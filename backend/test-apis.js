// Uses global fetch in Node.js v18+

const API_BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('🧪 Starting API Verification Tests...');

  try {
    // Test Cart payload
    const testCart = [
      { id: 'prod-001', name: 'Tomato 1 kg', price: 25, quantity: 2, shopId: 'shop-123' },
      { id: 'prod-002', name: 'Potato 1 kg', price: 20, quantity: 3, shopId: 'shop-123' }
    ];
    // Subtotal: (25 * 2) + (20 * 3) = 50 + 60 = 110
    // Platform Fee (20%): 22
    // Delivery Fee: 0
    // Total: 110

    // --- TEST 1: POST /api/checkout/payment-method (Online) ---
    console.log('\n1️⃣ Testing: POST /api/checkout/payment-method (Online)...');
    const checkoutRes = await fetch(`${API_BASE_URL}/api/checkout/payment-method`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cartItems: testCart,
        address: 'Test Address Pune, Maharashtra - 411001',
        paymentMethod: 'online',
        customerId: 'CUST_TEST_123'
      })
    });

    const checkoutData = await checkoutRes.json();
    console.log('Response Status:', checkoutRes.status);
    console.log('Response Body:', JSON.stringify(checkoutData, null, 2));

    if (checkoutRes.status !== 201 || !checkoutData.orderId) {
      throw new Error('Test 1 Failed: Could not create order');
    }
    const orderId = checkoutData.orderId;

    // --- TEST 2: POST /api/payment/razorpay/create-order ---
    console.log('\n2️⃣ Testing: POST /api/payment/razorpay/create-order...');
    const createOrderRes = await fetch(`${API_BASE_URL}/api/payment/razorpay/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId })
    });

    const createOrderData = await createOrderRes.json();
    console.log('Response Status:', createOrderRes.status);
    console.log('Response Body:', JSON.stringify(createOrderData, null, 2));

    if (createOrderRes.status !== 200 || !createOrderData.razorpayOrderDetails) {
      throw new Error('Test 2 Failed: Could not create Razorpay order');
    }
    const razorpayOrderId = createOrderData.razorpayOrderDetails.id;

    // --- TEST 3: POST /api/payment/verify (Online payment) ---
    console.log('\n3️⃣ Testing: POST /api/payment/verify (Online)...');
    const verifyRes = await fetch(`${API_BASE_URL}/api/payment/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: 'pay_mock_verified_123',
        razorpaySignature: 'mock_sig_123'
      })
    });

    const verifyData = await verifyRes.json();
    console.log('Response Status:', verifyRes.status);
    console.log('Response Body:', JSON.stringify(verifyData, null, 2));

    if (verifyRes.status !== 200 || verifyData.status !== 'placed') {
      throw new Error('Test 3 Failed: Online verification failed');
    }

    // --- TEST 4: POST /api/checkout/payment-method (COD) ---
    console.log('\n4️⃣ Testing: POST /api/checkout/payment-method (COD)...');
    const codCheckoutRes = await fetch(`${API_BASE_URL}/api/checkout/payment-method`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cartItems: testCart,
        address: 'Test Address Pune, Maharashtra - 411001',
        paymentMethod: 'cod',
        customerId: 'CUST_TEST_123'
      })
    });

    const codCheckoutData = await codCheckoutRes.json();
    console.log('Response Status:', codCheckoutRes.status);
    console.log('Response Body:', JSON.stringify(codCheckoutData, null, 2));

    if (codCheckoutRes.status !== 201 || !codCheckoutData.orderId) {
      throw new Error('Test 4 Failed: Could not create COD order');
    }
    const codOrderId = codCheckoutData.orderId;

    // --- TEST 5: POST /api/payment/verify (COD) ---
    console.log('\n5️⃣ Testing: POST /api/payment/verify (COD)...');
    const codVerifyRes = await fetch(`${API_BASE_URL}/api/payment/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: codOrderId,
        paymentMethod: 'cod'
      })
    });

    const codVerifyData = await codVerifyRes.json();
    console.log('Response Status:', codVerifyRes.status);
    console.log('Response Body:', JSON.stringify(codVerifyData, null, 2));

    if (codVerifyRes.status !== 200 || codVerifyData.status !== 'placed') {
      throw new Error('Test 5 Failed: COD verification failed');
    }

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! ✅');
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

runTests();
