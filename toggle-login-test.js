const BASE_URL = 'http://localhost:8787';

async function test() {
  try {
    console.log('=== Toggle-Based Login System Tests ===\n');

    // Test 1: Signup customer
    console.log('1. Signing up as Customer...');
    const signupCustomer = await fetch(`${BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Customer',
        email: 'toggletest.customer@test.com',
        password: 'Test12345!',
        role: 'customer'
      })
    });
    const signupCustData = await signupCustomer.json();
    console.log('Signup Status:', signupCustomer.status);
    console.log('Role:', signupCustData.user?.role, '\n');

    // Test 2: Login customer with correct role
    console.log('2. Login as Customer with selected role=customer...');
    const loginCustomer = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'toggletest.customer@test.com',
        password: 'Test12345!',
        role: 'customer'
      })
    });
    const loginCustData = await loginCustomer.json();
    console.log('Login Status:', loginCustomer.status);
    console.log('Success:', loginCustData.success);
    console.log('Message:', loginCustData.message, '\n');

    // Test 3: Try to login customer with wrong role
    console.log('3. Try to login as Customer with selected role=shopkeeper...');
    const loginCustomerWrongRole = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'toggletest.customer@test.com',
        password: 'Test12345!',
        role: 'shopkeeper'
      })
    });
    const loginCustWrongData = await loginCustomerWrongRole.json();
    console.log('Login Status:', loginCustomerWrongRole.status);
    console.log('Success:', loginCustWrongData.success);
    console.log('Message:', loginCustWrongData.message, '\n');

    // Test 4: Signup shopkeeper
    console.log('4. Signing up as Shopkeeper...');
    const signupShopkeeper = await fetch(`${BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Shopkeeper',
        email: 'toggletest.shopkeeper@test.com',
        password: 'Test12345!',
        role: 'shopkeeper'
      })
    });
    const signupShopData = await signupShopkeeper.json();
    console.log('Signup Status:', signupShopkeeper.status);
    console.log('Role:', signupShopData.user?.role, '\n');

    // Test 5: Login shopkeeper with correct role
    console.log('5. Login as Shopkeeper with selected role=shopkeeper...');
    const loginShopkeeper = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'toggletest.shopkeeper@test.com',
        password: 'Test12345!',
        role: 'shopkeeper'
      })
    });
    const loginShopData = await loginShopkeeper.json();
    console.log('Login Status:', loginShopkeeper.status);
    console.log('Success:', loginShopData.success);
    console.log('Message:', loginShopData.message, '\n');

    // Test 6: Try to login shopkeeper with wrong role
    console.log('6. Try to login as Shopkeeper with selected role=customer...');
    const loginShopkeeperWrongRole = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'toggletest.shopkeeper@test.com',
        password: 'Test12345!',
        role: 'customer'
      })
    });
    const loginShopWrongData = await loginShopkeeperWrongRole.json();
    console.log('Login Status:', loginShopkeeperWrongRole.status);
    console.log('Success:', loginShopWrongData.success);
    console.log('Message:', loginShopWrongData.message, '\n');

    console.log('=== All Tests Complete ===');
  } catch (error) {
    console.error('Test Error:', error.message);
  }
}

test();
