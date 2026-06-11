// Test script for verifying Delivery Agent APIs
const API_BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('🧪 Starting API Verification Tests for Delivery Agent...');
  try {
    // 1. Register a delivery agent
    console.log('\n1️⃣ Registering delivery agent...');
    const registerRes = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Agent Rohit',
        email: `agent_${Date.now()}@test.com`,
        password: 'password123',
        role: 'delivery',
        phoneNumber: '9870653210',
        vehicleDetails: 'Electric Bike MH-12'
      })
    });
    const registerData = await registerRes.json();
    console.log('Status:', registerRes.status);
    if (registerRes.status !== 201 || !registerData.token) {
      throw new Error('Registration failed: ' + JSON.stringify(registerData));
    }
    const token = registerData.token;
    console.log('Token received successfully.');

    // 2. Fetch deliveries
    console.log('\n2️⃣ Fetching deliveries...');
    const deliveriesRes = await fetch(`${API_BASE_URL}/api/agent/deliveries`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const deliveriesData = await deliveriesRes.json();
    console.log('Status:', deliveriesRes.status);
    if (deliveriesRes.status !== 200 || !deliveriesData.success) {
      throw new Error('Fetching deliveries failed: ' + JSON.stringify(deliveriesData));
    }
    console.log(`Deliveries fetched: ${deliveriesData.deliveries.length}`);

    // 3. Create a mock order to accept
    console.log('\n3️⃣ Creating a mock order to claim...');
    const orderRes = await fetch(`${API_BASE_URL}/api/checkout/payment-method`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cartItems: [
          { id: 'prod-001', name: 'Fresh Bread', price: 40, quantity: 1, shopId: 'bakery-001' }
        ],
        address: 'Gyan Vihar Colony, Ara, Bihar - 801101',
        paymentMethod: 'cod',
        customerId: 'CUST_TEST_999'
      })
    });
    const orderData = await orderRes.json();
    console.log('Status:', orderRes.status);
    if (orderRes.status !== 201 || !orderData.orderId) {
      throw new Error('Order creation failed: ' + JSON.stringify(orderData));
    }
    const orderId = orderData.orderId;
    console.log(`Mock order created with ID: ${orderId}`);

    // Verify order placement (moves status to placed)
    await fetch(`${API_BASE_URL}/api/payment/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, paymentMethod: 'cod' })
    });

    // 4. Claim the order
    console.log('\n4️⃣ Claiming the order...');
    const claimRes = await fetch(`${API_BASE_URL}/api/agent/claim-order`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ orderId })
    });
    const claimData = await claimRes.json();
    console.log('Status:', claimRes.status);
    if (claimRes.status !== 200 || !claimData.success) {
      throw new Error('Claiming order failed: ' + JSON.stringify(claimData));
    }
    console.log('Order claimed successfully.');

    // 5. Update agent location coordinates
    console.log('\n5️⃣ Updating location coordinates...');
    const locRes = await fetch(`${API_BASE_URL}/api/agent/update-location`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ lat: 25.5945, lng: 84.1639, orderId })
    });
    const locData = await locRes.json();
    console.log('Status:', locRes.status);
    if (locRes.status !== 200 || !locData.success) {
      throw new Error('Location update failed: ' + JSON.stringify(locData));
    }
    console.log('Location updated successfully.');

    // 6. Update order status to out_for_delivery
    console.log('\n6️⃣ Updating status to out_for_delivery...');
    const statusRes1 = await fetch(`${API_BASE_URL}/api/agent/update-status`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ orderId, status: 'out_for_delivery' })
    });
    const statusData1 = await statusRes1.json();
    console.log('Status:', statusRes1.status);
    if (statusRes1.status !== 200 || !statusData1.success) {
      throw new Error('Status update 1 failed: ' + JSON.stringify(statusData1));
    }
    console.log('Status updated to out_for_delivery.');

    // 7. Update order status to delivered
    console.log('\n7️⃣ Updating status to delivered...');
    const statusRes2 = await fetch(`${API_BASE_URL}/api/agent/update-status`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ orderId, status: 'delivered' })
    });
    const statusData2 = await statusRes2.json();
    console.log('Status:', statusRes2.status);
    if (statusRes2.status !== 200 || !statusData2.success) {
      throw new Error('Status update 2 failed: ' + JSON.stringify(statusData2));
    }
    console.log('Status updated to delivered.');

    // 8. Fetch earnings dashboard
    console.log('\n8️⃣ Fetching agent earnings...');
    const earningsRes = await fetch(`${API_BASE_URL}/api/agent/earnings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const earningsData = await earningsRes.json();
    console.log('Status:', earningsRes.status);
    if (earningsRes.status !== 200 || !earningsData.success) {
      throw new Error('Fetching earnings failed: ' + JSON.stringify(earningsData));
    }
    console.log('Earnings Summary:', JSON.stringify(earningsData, null, 2));

    console.log('\n🎉 ALL AGENT API TESTS PASSED SUCCESSFULLY! ✅');
  } catch (e) {
    console.error('\n❌ Test execution failed:', e.message);
    process.exit(1);
  }
}

runTests();
