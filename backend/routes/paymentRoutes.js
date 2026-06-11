const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const paymentService = require('../services/paymentService');

// Initialize Razorpay if credentials are provided
let razorpayClient = null;
const isRazorpayConfigured = process.env.RAZORPAY_KEY_ID && 
                             process.env.RAZORPAY_KEY_ID !== 'your_razorpay_key_id' && 
                             process.env.RAZORPAY_KEY_SECRET && 
                             process.env.RAZORPAY_KEY_SECRET !== 'your_razorpay_key_secret';

if (isRazorpayConfigured) {
  razorpayClient = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// Helper to calculate total & commission
const calculateOrderDetails = (items) => {
  let subtotal = 0;
  items.forEach(item => {
    subtotal += Number(item.price) * Number(item.quantity);
  });

  // During free delivery period, delivery fee is 0
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  // 20% platform fee commission
  const platformFee = Number((subtotal * 0.20).toFixed(2));

  return { subtotal, deliveryFee, total, platformFee };
};

// 1. POST /api/checkout/payment-method
router.post('/checkout/payment-method', async (req, res) => {
  try {
    const { cartItems, address, paymentMethod, customerId } = req.body;

    // Validation
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required' });
    }

    for (const item of cartItems) {
      const productId = item.productId || item.id;
      if (!productId || !item.name || item.price === undefined || !item.quantity) {
        return res.status(400).json({ success: false, message: 'Invalid product details in cart items' });
      }
      if (Number(item.price) < 0 || Number(item.quantity) <= 0) {
        return res.status(400).json({ success: false, message: 'Price must be >= 0 and Quantity must be > 0' });
      }
    }

    if (!address || typeof address !== 'string' || !address.trim()) {
      return res.status(400).json({ success: false, message: 'Valid delivery address is required' });
    }

    const validMethods = ['online', 'cod', 'upi_auto', 'upi'];
    if (!paymentMethod || !validMethods.includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing payment method' });
    }

    // Calculations
    const { subtotal, deliveryFee, total, platformFee } = calculateOrderDetails(cartItems);

    const mongoose = require('mongoose');
    const isValidObjectId = customerId && mongoose.Types.ObjectId.isValid(customerId);

    // Create Order Document
    const newOrder = new Order({
      customerId: isValidObjectId ? customerId : null,
      items: cartItems.map(item => ({
        productId: item.productId || item.id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        shopId: item.shopId || null
      })),
      address: address.trim(),
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending',
      subtotal,
      deliveryFee,
      total,
      platformFee
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: 'Order details saved successfully',
      orderId: newOrder._id,
      total: newOrder.total,
      paymentMethod: newOrder.paymentMethod
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ success: false, message: 'Failed to process checkout details', error: error.message });
  }
});

// 2. POST /api/payment/create-order (Unified order creation with Cashfree fallback support)
router.post('/payment/create-order', async (req, res) => {
  try {
    const { orderId, gatewayPreference, customerData } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!['online', 'upi', 'upi_auto'].includes(order.paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Online order creation is only for online/upi payment methods' });
    }

    // Default customer details for prefill (especially needed for Cashfree)
    const prefillData = customerData || {
      id: order.customerId ? order.customerId.toString() : 'guest_customer',
      phone: '9999999999',
      email: 'customer@localkart.com',
      name: 'LocalKart Customer'
    };

    // Invoke unified payment service
    const paymentData = await paymentService.createOrder(order, gatewayPreference || 'razorpay', prefillData);

    // Save corresponding gateway identifiers to MongoDB Order
    if (paymentData.gateway === 'razorpay') {
      order.razorpayOrderId = paymentData.razorpayOrderDetails.id;
    } else if (paymentData.gateway === 'cashfree') {
      order.cashfreeOrderId = paymentData.cashfreeOrderDetails.order_id;
    }
    await order.save();

    res.status(200).json({
      success: true,
      ...paymentData
    });
  } catch (error) {
    console.error('Unified create-order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order', error: error.message });
  }
});

// Legacy backward-compatible wrapper
router.post('/payment/razorpay/create-order', async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const paymentData = await paymentService.createOrder(order, 'razorpay');
    if (paymentData.gateway === 'razorpay') {
      order.razorpayOrderId = paymentData.razorpayOrderDetails.id;
    }
    await order.save();
    res.status(200).json({ success: true, ...paymentData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. POST /api/payment/verify (Supports signature checks, webhooks, and multi-gateway responses)
router.post('/payment/verify', async (req, res) => {
  try {
    // 3a. Check if this is a Razorpay Webhook Event
    const signatureHeader = req.headers['x-razorpay-signature'];
    if (signatureHeader && req.body.event) {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

      if (!webhookSecret || webhookSecret === 'your_razorpay_webhook_secret') {
        return res.status(400).json({ success: false, message: 'Webhook secret is not configured' });
      }

      // Verify webhook signature
      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== signatureHeader) {
        return res.status(400).json({ success: false, message: 'Invalid signature verification' });
      }

      const event = req.body.event;
      const paymentEntity = req.body.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;

      if (event === 'payment.captured') {
        const order = await Order.findOne({ razorpayOrderId });
        if (order) {
          order.paymentStatus = 'paid';
          order.status = 'placed';
          order.razorpayPaymentId = paymentEntity.id;
          await order.save();
        }
      } else if (event === 'payment.failed') {
        const order = await Order.findOne({ razorpayOrderId });
        if (order) {
          order.paymentStatus = 'failed';
          await order.save();
        }
      }

      return res.status(200).json({ success: true, message: 'Webhook event processed successfully' });
    }

    // 3b. Client-side payment verification (Unified)
    const { 
      razorpayOrderId, 
      razorpayPaymentId, 
      razorpaySignature, 
      orderId, 
      paymentMethod,
      paymentSessionId,
      cfOrderId,
      gateway
    } = req.body;

    // Handle Cash on Delivery (COD) placement
    if (paymentMethod === 'cod' && orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      order.status = 'placed';
      order.paymentStatus = 'pending';
      await order.save();
      return res.status(200).json({
        success: true,
        message: 'COD Order placed successfully',
        orderId: order._id,
        status: order.status
      });
    }

    // Determine Gateway
    let activeGateway = gateway;
    if (!activeGateway) {
      if (cfOrderId || paymentSessionId) {
        activeGateway = 'cashfree';
      } else if (razorpayOrderId) {
        activeGateway = 'razorpay';
      }
    }

    if (!activeGateway) {
      return res.status(400).json({ success: false, message: 'Unable to determine payment gateway' });
    }

    // Verify payment status/signatures with the Payment Service
    const verificationResult = await paymentService.verifyPayment(req.body, activeGateway);

    if (!verificationResult.success) {
      if (activeGateway === 'razorpay') {
        await Order.findOneAndUpdate({ razorpayOrderId }, { paymentStatus: 'failed' });
      } else {
        let mongoOrderId = orderId;
        if (cfOrderId && cfOrderId.startsWith('cf_order_')) {
          mongoOrderId = cfOrderId.split('_')[2];
        }
        await Order.findByIdAndUpdate(mongoOrderId, { paymentStatus: 'failed' });
      }
      return res.status(400).json({ success: false, message: verificationResult.error || 'Payment verification failed' });
    }

    // Signature matches, update database order
    let finalOrder;
    if (activeGateway === 'razorpay') {
      finalOrder = await Order.findOne({ razorpayOrderId });
      if (finalOrder) {
        finalOrder.paymentStatus = 'paid';
        finalOrder.status = 'placed';
        finalOrder.razorpayPaymentId = razorpayPaymentId;
        finalOrder.razorpaySignature = razorpaySignature;
        await finalOrder.save();
      }
    } else if (activeGateway === 'cashfree') {
      let mongoOrderId = orderId;
      if (cfOrderId && cfOrderId.startsWith('cf_order_')) {
        mongoOrderId = cfOrderId.split('_')[2];
      }
      finalOrder = await Order.findById(mongoOrderId);
      if (finalOrder) {
        finalOrder.paymentStatus = 'paid';
        finalOrder.status = 'placed';
        finalOrder.cashfreeOrderId = cfOrderId;
        finalOrder.cashfreePaymentId = paymentSessionId || 'cf_pay_success';
        await finalOrder.save();
      }
    }

    if (!finalOrder) {
      return res.status(404).json({ success: false, message: 'Associated Order not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and order status updated',
      orderId: finalOrder._id,
      status: finalOrder.status
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify payment', error: error.message });
  }
});

module.exports = router;
