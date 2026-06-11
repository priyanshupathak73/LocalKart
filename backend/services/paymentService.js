const crypto = require('crypto');
const Razorpay = require('razorpay');

// Configuration Check Helpers
const getRazorpayConfig = () => {
  const configured = process.env.RAZORPAY_KEY_ID && 
                     process.env.RAZORPAY_KEY_ID !== 'your_razorpay_key_id' && 
                     process.env.RAZORPAY_KEY_SECRET && 
                     process.env.RAZORPAY_KEY_SECRET !== 'your_razorpay_key_secret';
  return {
    isConfigured: !!configured,
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET
  };
};

const getCashfreeConfig = () => {
  const configured = process.env.CASHFREE_APP_ID && 
                     process.env.CASHFREE_APP_ID !== 'your_cashfree_app_id' && 
                     process.env.CASHFREE_SECRET_KEY && 
                     process.env.CASHFREE_SECRET_KEY !== 'your_cashfree_secret_key';
  return {
    isConfigured: !!configured,
    appId: process.env.CASHFREE_APP_ID,
    secretKey: process.env.CASHFREE_SECRET_KEY,
    env: process.env.CASHFREE_ENV || 'sandbox'
  };
};

// ── RAZORPAY GATEWAY WRAPPER ─────────────────────────────────
class RazorpayGateway {
  constructor() {
    const config = getRazorpayConfig();
    if (config.isConfigured) {
      this.client = new Razorpay({
        key_id: config.keyId,
        key_secret: config.keySecret
      });
    }
  }

  async createOrder(orderId, amount, receipt) {
    const config = getRazorpayConfig();
    const amountInPaise = Math.round(amount * 100);

    if (!config.isConfigured) {
      // Mock Razorpay order response
      console.warn('[Razorpay] Config is missing. Generating sandbox/mock order.');
      return {
        isMock: true,
        id: `order_mock_${crypto.randomBytes(6).toString('hex')}`,
        entity: 'order',
        amount: amountInPaise,
        amount_paid: 0,
        amount_due: amountInPaise,
        currency: 'INR',
        receipt: receipt,
        status: 'created',
        created_at: Math.floor(Date.now() / 1000)
      };
    }

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt
    };

    return await this.client.orders.create(options);
  }

  async verify(payload) {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = payload;
    const config = getRazorpayConfig();

    if (razorpayOrderId.startsWith('order_mock_')) {
      return { success: true, isMock: true };
    }

    if (!config.isConfigured) {
      throw new Error('Razorpay keys missing for signature verification');
    }

    const expectedSignature = crypto
      .createHmac('sha256', config.keySecret)
      .update(razorpayOrderId + '|' + razorpayPaymentId)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return { success: false, error: 'Signature mismatch' };
    }

    return { success: true };
  }
}

// ── CASHFREE GATEWAY WRAPPER ──────────────────────────────────
class CashfreeGateway {
  constructor() {
    // API base URL configuration based on env setting
    const config = getCashfreeConfig();
    this.baseUrl = config.env === 'production' 
      ? 'https://api.cashfree.com/pg' 
      : 'https://sandbox.cashfree.com/pg';
  }

  async createOrder(orderId, amount, customerData) {
    const config = getCashfreeConfig();

    if (!config.isConfigured) {
      // Mock Cashfree order response
      console.warn('[Cashfree] Config is missing. Generating sandbox/mock order.');
      const mockSessionId = `session_mock_${crypto.randomBytes(8).toString('hex')}`;
      return {
        isMock: true,
        order_id: `cf_order_${orderId}`,
        payment_session_id: mockSessionId,
        order_status: 'ACTIVE',
        order_amount: amount,
        order_currency: 'INR'
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'x-client-id': config.appId,
          'x-client-secret': config.secretKey,
          'x-api-version': '2023-08-01',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order_id: `cf_order_${orderId}_${crypto.randomBytes(3).toString('hex')}`,
          order_amount: Number(amount.toFixed(2)),
          order_currency: 'INR',
          customer_details: {
            customer_id: customerData.id || 'cust_guest',
            customer_phone: customerData.phone || '9999999999',
            customer_email: customerData.email || 'customer@example.com',
            customer_name: customerData.name || 'Guest Customer'
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cashfree order creation failed: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[Cashfree error]:', error.message);
      throw error;
    }
  }

  async verify(payload) {
    const { orderId, paymentSessionId, cfOrderId } = payload;
    const config = getCashfreeConfig();

    if (paymentSessionId && paymentSessionId.startsWith('session_mock_')) {
      return { success: true, isMock: true };
    }

    if (!config.isConfigured) {
      throw new Error('Cashfree keys missing for verification');
    }

    // Query Cashfree API directly to verify the order status
    try {
      const response = await fetch(`${this.baseUrl}/orders/${cfOrderId}`, {
        method: 'GET',
        headers: {
          'x-client-id': config.appId,
          'x-client-secret': config.secretKey,
          'x-api-version': '2023-08-01',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to query order from Cashfree');
      }

      const orderData = await response.json();
      if (orderData.order_status === 'PAID') {
        return { success: true, orderDetails: orderData };
      }

      return { success: false, error: `Cashfree order status is: ${orderData.order_status}` };
    } catch (error) {
      console.error('[Cashfree verify error]:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// ── UNIFIED PAYMENT SERVICE FACTORY ───────────────────────────
class PaymentService {
  constructor() {
    this.razorpay = new RazorpayGateway();
    this.cashfree = new CashfreeGateway();
  }

  async createOrder(order, gatewayPreference = 'razorpay', customerData = {}) {
    const rzpConfig = getRazorpayConfig();
    const cfConfig = getCashfreeConfig();

    // If Razorpay is preferred
    if (gatewayPreference === 'razorpay') {
      try {
        // Try creating with Razorpay
        const rzpOrder = await this.razorpay.createOrder(
          order._id.toString(),
          order.total,
          `receipt_order_${order._id}`
        );
        return {
          gateway: 'razorpay',
          isMock: !!rzpOrder.isMock,
          razorpayKeyId: rzpConfig.isConfigured ? rzpConfig.keyId : 'mock_key',
          razorpayOrderDetails: rzpOrder
        };
      } catch (error) {
        console.warn('Razorpay order creation failed, attempting Cashfree fallback...', error.message);
        // Fallback to Cashfree
        const cfOrder = await this.cashfree.createOrder(
          order._id.toString(),
          order.total,
          customerData
        );
        return {
          gateway: 'cashfree',
          isMock: !!cfOrder.isMock,
          cashfreeAppId: cfConfig.isConfigured ? cfConfig.appId : 'mock_key',
          cashfreeOrderDetails: cfOrder,
          fallback: true
        };
      }
    } else {
      // Cashfree preferred
      try {
        const cfOrder = await this.cashfree.createOrder(
          order._id.toString(),
          order.total,
          customerData
        );
        return {
          gateway: 'cashfree',
          isMock: !!cfOrder.isMock,
          cashfreeAppId: cfConfig.isConfigured ? cfConfig.appId : 'mock_key',
          cashfreeOrderDetails: cfOrder
        };
      } catch (error) {
        console.warn('Cashfree order creation failed, attempting Razorpay fallback...', error.message);
        // Fallback to Razorpay
        const rzpOrder = await this.razorpay.createOrder(
          order._id.toString(),
          order.total,
          `receipt_order_${order._id}`
        );
        return {
          gateway: 'razorpay',
          isMock: !!rzpOrder.isMock,
          razorpayKeyId: rzpConfig.isConfigured ? rzpConfig.keyId : 'mock_key',
          razorpayOrderDetails: rzpOrder,
          fallback: true
        };
      }
    }
  }

  async verifyPayment(payload, gateway) {
    if (gateway === 'razorpay') {
      return await this.razorpay.verify(payload);
    } else if (gateway === 'cashfree') {
      return await this.cashfree.verify(payload);
    } else {
      throw new Error(`Unsupported payment gateway: ${gateway}`);
    }
  }
}

module.exports = new PaymentService();
