const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Business = require('../models/Business');
const { protect } = require('../middleware/auth');

// @desc    Get active deliveries (assigned & unassigned)
// @route   GET /api/agent/deliveries
router.get('/deliveries', protect, async (req, res) => {
  try {
    const agentId = req.user._id;

    // Fetch orders with relevant status for delivery
    const orders = await Order.find({
      status: { $in: ['placed', 'confirmed', 'preparing', 'picked_up', 'out_for_delivery', 'delivered'] }
    }).sort({ createdAt: -1 });

    const mappedOrders = [];

    for (let order of orders) {
      const isAssignedToMe = order.deliveryAgentId && order.deliveryAgentId.toString() === agentId.toString();
      const isUnassigned = !order.deliveryAgentId && ['placed', 'confirmed', 'preparing'].includes(order.status);

      // Filter: only return if assigned to me or if it is unassigned and available
      if (!isAssignedToMe && !isUnassigned) {
        continue;
      }

      const orderObj = order.toObject();

      // Get shop details for pickup
      let pickupLocation = 'Local Shop, Ara';
      let shopName = 'LocalKart Vendor';
      let shopPhone = '9999999999';
      let pickupCoords = { lat: 25.5941, lng: 84.1633 }; // default Ara

      if (order.items && order.items.length > 0) {
        const shopId = order.items[0].shopId;
        const biz = await Business.findOne({ id: shopId });
        if (biz) {
          pickupLocation = biz.address || pickupLocation;
          shopName = biz.name || shopName;
          shopPhone = biz.phone || shopPhone;
          if (biz.coordinates && biz.coordinates.lat) {
            pickupCoords = biz.coordinates;
          }
        }
      }

      // Fetch customer name & phone if exists
      let customerName = 'Customer';
      let customerPhone = '9876543210';
      if (order.customerId) {
        const customer = await User.findById(order.customerId);
        if (customer) {
          customerName = customer.name;
          customerPhone = customer.phoneNumber || customerPhone;
        }
      }

      // Generate deterministic drop coordinates based on order ID if not stored
      let dropCoords = { lat: 25.5980, lng: 84.1700 };
      if (order._id) {
        const hash = order._id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        dropCoords.lat = 25.5880 + (hash % 80) * 0.0003;
        dropCoords.lng = 84.1500 + (hash % 120) * 0.0003;
      }

      mappedOrders.push({
        ...orderObj,
        pickupLocation,
        shopName,
        shopPhone,
        pickupCoords,
        customerName,
        customerPhone,
        dropCoords,
        isAssignedToMe,
        isAvailable: isUnassigned
      });
    }

    res.json({ success: true, deliveries: mappedOrders });
  } catch (error) {
    console.error('Fetch deliveries error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Claim an unassigned order
// @route   POST /api/agent/claim-order
router.post('/claim-order', protect, async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    if (order.deliveryAgentId) {
      return res.status(400).json({ success: false, message: 'Order already claimed by another agent' });
    }

    order.deliveryAgentId = req.user._id;
    if (order.status === 'placed') {
      order.status = 'confirmed';
    }
    
    await order.save();
    res.json({ success: true, message: 'Order claimed successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update order status
// @route   POST /api/agent/update-status
router.post('/update-status', protect, async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Assign to agent if not assigned
    if (!order.deliveryAgentId) {
      order.deliveryAgentId = req.user._id;
    } else if (order.deliveryAgentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'This order is assigned to another agent' });
    }

    order.status = status;
    await order.save();
    
    res.json({ success: true, message: `Status updated to ${status}`, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update agent location
// @route   POST /api/agent/update-location
router.post('/update-location', protect, async (req, res) => {
  try {
    const { lat, lng, orderId } = req.body;

    // Update agent's profile coordinates
    await User.findByIdAndUpdate(req.user._id, {
      lastKnownLocation: { lat, lng }
    });

    // If orderId is active, update order's tracking coordinates
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        agentLocation: { lat, lng }
      });
    }

    res.json({ success: true, message: 'Location updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get earnings dashboard overview
// @route   GET /api/agent/earnings
router.get('/earnings', protect, async (req, res) => {
  try {
    const agentId = req.user._id;

    // Fetch all delivered orders for this agent
    const deliveredOrders = await Order.find({
      deliveryAgentId: agentId,
      status: 'delivered'
    });

    const basePay = 45; // ₹45 base pay per delivery
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = [];

    // Compute weekly charts dynamically
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      const ordersOnDay = deliveredOrders.filter(o => {
        const date = new Date(o.createdAt || o.updatedAt);
        return date >= d && date < nextD;
      });

      const earnings = ordersOnDay.length * basePay;
      const dayName = daysOfWeek[d.getDay()];

      weeklyData.push({
        name: dayName,
        amount: earnings
      });
    }

    const totalDeliveries = deliveredOrders.length;
    const totalEarningsSum = totalDeliveries * basePay;
    const incentive = totalDeliveries * 10; // ₹10 incentive per order

    // Calculate today's earnings specifically
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = deliveredOrders.filter(o => {
      const date = new Date(o.createdAt || o.updatedAt);
      return date >= today;
    });
    const todayEarnings = todayOrders.length * basePay;

    res.json({
      success: true,
      todayEarnings,
      totalEarnings: totalEarningsSum + incentive,
      incentive,
      totalDeliveries,
      onlineTime: req.user.isOnline ? '8.5 hrs' : '0 hrs',
      weeklyEarnings: weeklyData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
