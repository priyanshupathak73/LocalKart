// Uses global fetch in Node.js v18+

const API_BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('🧪 Starting API Failover & Fallback Integration Tests...');

  try {
    const testCart = [
      { id: 'prod-010', name: 'Butter 100g', price: 60, quantity: 2, shopId: 'shop-123' }
    ];
    // Subtotal: 120
    // Total: 120

    // Create MongoDB Order details
    console.log('\n1️⃣ Creating MongoDB order...');
    const checkoutRes = await fetch(`${API_BASE_URL}/api/checkout/payment-method`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cartItems: testCart,
        address: '123, Fallback St, Hinjewadi, Pune',
        paymentMethod: 'online',
        customerId: 'CUST_TEST_CF'
      })
    });

    const checkoutData = await checkoutRes.json();
    console.log('Checkout response:', checkoutRes.status, checkoutData);
    if (!checkoutData.orderId) throw new Error('Failed to create order');
    const orderId = checkoutData.orderId;

    // --- TEST 2: Create payment order with RAZORPAY preference ---
    console.log('\n2️⃣ Testing: unified order creation (Razorpay preferred)...');
    const rzpRes = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        gatewayPreference: 'razorpay'
      })
    });
    const rzpData = await rzpRes.json();
    console.log('Razorpay preference response:', rzpRes.status);
    console.log('Gateway assigned:', rzpData.gateway);
    if (rzpRes.status !== 200 || rzpData.gateway !== 'razorpay') {
      throw new Error('Test 2 Failed: Primary Razorpay order creation failed');
    }

    // --- TEST 3: Create payment order with CASHFREE preference ---
    console.log('\n3️⃣ Testing: unified order creation (Cashfree preferred)...');
    const cfRes = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        gatewayPreference: 'cashfree'
      })
    });
    const cfData = await cfRes.json();
    console.log('Cashfree preference response:', cfRes.status);
    console.log('Gateway assigned:', cfData.gateway);
    if (cfRes.status !== 200 || cfData.gateway !== 'cashfree') {
      throw new Error('Test 3 Failed: Secondary Cashfree order creation failed');
    }
    const cfOrderId = cfData.cashfreeOrderDetails.order_id;
    const paymentSessionId = cfData.cashfreeOrderDetails.payment_session_id;

    // --- TEST 4: Verify CASHFREE mock payment ---
    console.log('\n4️⃣ Testing: Cashfree mock payment verification...');
    const verifyCFRes = await fetch(`${API_BASE_URL}/api/payment/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gateway: 'cashfree',
        cfOrderId,
        paymentSessionId
      })
    });
    const verifyCFData = await verifyCFRes.json();
    console.log('Cashfree verification response:', verifyCFRes.status, verifyCFData);
    if (verifyCFRes.status !== 200 || verifyCFData.status !== 'placed') {
      throw new Error('Test 4 Failed: Cashfree verification failed');
    }

    console.log('\n🎉 ALL FALLBACK AND MULTI-GATEWAY TESTS PASSED SUCCESSFULLY! ✅');
  } catch (error) {
    console.error('\n❌ Integration test execution failed:', error.message);
    process.exit(1);
  }
}

runTests();
