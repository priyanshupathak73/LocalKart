export interface Env {
  DB: D1Database;
  OTP_KV: KVNamespace;
  SESSION_KV: KVNamespace;
  RESEND_API_KEY: string;
  FRONTEND_URL?: string;
  RESEND_FROM?: string;
  APP_NAME?: string;
}

type Role = 'customer' | 'shopkeeper';

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone_number?: string | null;
  password: string;
  role: Role;
  created_at: string;
};

type ShopRow = {
  id: string;
  owner_id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  phone_number: string;
  imageUrl: string;
  service_type: 'products' | 'services' | 'both';
  created_at: string;
};

type JsonBody = Record<string, unknown>;

type ProductUpload = {
  shopId: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
};

const json = (data: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...(init.headers || {}),
    },
  });

const getAppName = (env: Env) => env.APP_NAME || 'LocalKart';

const normalizeEmail = (value: unknown) => String(value ?? '').trim().toLowerCase();

const normalizePhone = (value: unknown) => String(value ?? '').replace(/\D/g, '').trim();

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPhone = (phone: string) => /^\d{10,15}$/.test(phone);

const isValidRole = (value: unknown): value is Role => value === 'customer' || value === 'shopkeeper';

const isStrongPassword = (password: string) => password.length >= 6;

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = () => crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');

const hashPassword = async (password: string) => {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  const key = await crypto.subtle.importKey('raw', passwordBytes, 'PBKDF2', false, ['deriveBits']);
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations: 100000,
    },
    key,
    256
  );
  const hashHex = Array.from(new Uint8Array(derivedBits)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${saltHex}:${hashHex}`;
};

const verifyPassword = async (password: string, stored: string) => {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;

  const salt = new Uint8Array(saltHex.match(/.{1,2}/g)?.map((part) => Number.parseInt(part, 16)) || []);
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);
  const key = await crypto.subtle.importKey('raw', passwordBytes, 'PBKDF2', false, ['deriveBits']);
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations: 100000,
    },
    key,
    256
  );
  const computed = Array.from(new Uint8Array(derivedBits)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return computed === hashHex;
};

const sendEmail = async (env: Env, to: string, subject: string, html: string) => {
  if (!env.RESEND_API_KEY) {
    console.warn('[auth-worker] RESEND_API_KEY is missing. Skipping email send in local/dev mode.', { to, subject });
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.RESEND_FROM || `${getAppName(env)} <no-reply@resend.dev>`,
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API error: ${response.status} ${errorText}`);
  }
};

const sendWelcomeEmail = async (env: Env, name: string, email: string) => {
  const subject = 'Welcome to LocalKart';
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
      <h2 style="margin:0 0 12px;color:#7c3aed">Welcome to LocalKart</h2>
      <p>Hi ${name},</p>
      <p>Welcome to LocalKart. Your account has been created successfully.</p>
      <p>You can now sign in and start using the platform.</p>
      <p style="margin-top:24px">Thanks,<br/>The LocalKart Team</p>
    </div>
  `;

  await sendEmail(env, email, subject, html);
};

const sendOtpEmail = async (env: Env, email: string, otp: string) => {
  const subject = 'Your LocalKart OTP';
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
      <h2 style="margin:0 0 12px;color:#7c3aed">Your LocalKart OTP</h2>
      <p>Use this code to complete your login:</p>
      <div style="font-size:28px;font-weight:700;letter-spacing:6px;margin:18px 0;color:#4f46e5">${otp}</div>
      <p>This code expires in 5 minutes.</p>
      <p style="margin-top:24px">If you did not request this code, you can ignore this email.</p>
    </div>
  `;

  await sendEmail(env, email, subject, html);
};

const fileToDataUrl = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  const base64 = btoa(binary);
  return `data:${file.type};base64,${base64}`;
};

const getOtpKey = (email: string) => `otp:${email}`;
const getOtpCooldownKey = (email: string) => `otp-cooldown:${email}`;
const getSessionKey = (token: string) => `session:${token}`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const badRequest = (message: string) => json({ success: false, message }, { status: 400, headers: corsHeaders });
const unauthorized = (message: string) => json({ success: false, message }, { status: 401, headers: corsHeaders });
const serverError = (message: string) => json({ success: false, message }, { status: 500, headers: corsHeaders });

const createSession = async (env: Env, user: UserRow) => {
  const token = generateToken();
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  await env.SESSION_KV.put(getSessionKey(token), JSON.stringify(payload), {
    expirationTtl: 60 * 60 * 24 * 30,
  });

  return { token, user: payload };
};

const handleSignup = async (request: Request, env: Env) => {
  let body: JsonBody;
  try {
    body = (await request.json()) as JsonBody;
  } catch {
    return badRequest('Invalid JSON body');
  }

  const name = String(body.name ?? '').trim();
  const email = normalizeEmail(body.email);
  const phoneNumber = normalizePhone(body.phoneNumber);
  const password = String(body.password ?? '');
  const role = isValidRole(body.role) ? body.role : 'customer';

  if (!name || !email || !password) {
    return badRequest('name, email and password are required');
  }
  if (!isValidEmail(email)) {
    return badRequest('Please provide a valid email');
  }
  if (phoneNumber && !isValidPhone(phoneNumber)) {
    return badRequest('Please provide a valid phone number');
  }
  if (!isStrongPassword(password)) {
    return badRequest('Password must be at least 6 characters');
  }

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existing) {
    return json({ success: false, message: 'User already exists' }, { status: 409, headers: corsHeaders });
  }

  const passwordHash = await hashPassword(password);
  const id = crypto.randomUUID();

  await env.DB.prepare(
    'INSERT INTO users (id, name, email, phone_number, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)' 
  ).bind(id, name, email, phoneNumber || null, passwordHash, role, new Date().toISOString()).run();

  await sendWelcomeEmail(env, name, email);

  const user = { id, name, email, phoneNumber: phoneNumber || null, role };
  const session = await createSession(env, { id, name, email, password: passwordHash, role, created_at: new Date().toISOString() });

  return json({ success: true, message: 'Signup successful', user, token: session.token }, { status: 201, headers: corsHeaders });
};

const handleSendOtp = async (request: Request, env: Env) => {
  let body: JsonBody;
  try {
    body = (await request.json()) as JsonBody;
  } catch {
    return badRequest('Invalid JSON body');
  }

  const email = normalizeEmail(body.email);
  if (!email) return badRequest('email is required');
  if (!isValidEmail(email)) return badRequest('Please provide a valid email');

  const user = await env.DB.prepare('SELECT id, name, email, role FROM users WHERE email = ?').bind(email).first<{ id: string; name: string; email: string; role: Role }>();
  if (!user) {
    return json({ success: false, message: 'Account not found' }, { status: 404, headers: corsHeaders });
  }

  const cooldownKey = getOtpCooldownKey(email);
  const lastSentAt = await env.OTP_KV.get(cooldownKey);
  if (lastSentAt) {
    return json({ success: false, message: 'Please wait 60 seconds before requesting another OTP' }, { status: 429, headers: corsHeaders });
  }

  const otp = generateOtp();
  await env.OTP_KV.put(getOtpKey(email), JSON.stringify({ otp, createdAt: Date.now() }), {
    expirationTtl: 300,
  });
  await env.OTP_KV.put(cooldownKey, String(Date.now()), {
    expirationTtl: 60,
  });

  await sendOtpEmail(env, email, otp);

  return json({ success: true, message: 'OTP sent successfully' }, { headers: corsHeaders });
};

const handleVerifyOtp = async (request: Request, env: Env) => {
  let body: JsonBody;
  try {
    body = (await request.json()) as JsonBody;
  } catch {
    return badRequest('Invalid JSON body');
  }

  const email = normalizeEmail(body.email);
  const otp = String(body.otp ?? '').trim();

  if (!email || !otp) {
    return badRequest('email and otp are required');
  }
  if (!isValidEmail(email)) {
    return badRequest('Please provide a valid email');
  }
  if (!/^[0-9]{6}$/.test(otp)) {
    return badRequest('OTP must be 6 digits');
  }

  const stored = await env.OTP_KV.get(getOtpKey(email));
  if (!stored) {
    return unauthorized('OTP expired or not found');
  }

  let parsed: { otp: string; createdAt: number };
  try {
    parsed = JSON.parse(stored) as { otp: string; createdAt: number };
  } catch {
    return unauthorized('OTP expired or not found');
  }

  if (parsed.otp !== otp) {
    return unauthorized('Invalid OTP');
  }

  await env.OTP_KV.delete(getOtpKey(email));

  const user = await env.DB.prepare('SELECT id, name, email, role FROM users WHERE email = ?').bind(email).first<{ id: string; name: string; email: string; role: Role }>();
  if (!user) {
    return unauthorized('Account not found');
  }

  const session = await createSession(env, { id: user.id, name: user.name, email: user.email, password: '', role: user.role, created_at: new Date().toISOString() });

  return json({ success: true, message: 'OTP verified successfully', token: session.token, user: session.user }, { headers: corsHeaders });
};

const handleLoginWithOtp = async (request: Request, env: Env) => {
  let body: JsonBody;
  try {
    body = (await request.json()) as JsonBody;
  } catch {
    return badRequest('Invalid JSON body');
  }

  const email = normalizeEmail(body.email);
  const password = String(body.password ?? '');

  if (!email || !password) {
    return badRequest('email and password are required');
  }
  if (!isValidEmail(email)) {
    return badRequest('Please provide a valid email');
  }

  const user = await env.DB.prepare('SELECT id, name, email, password, role, created_at FROM users WHERE email = ?').bind(email).first<UserRow>();
  if (!user) {
    return unauthorized('Invalid credentials');
  }

  const ok = await verifyPassword(password, user.password);
  if (!ok) {
    return unauthorized('Invalid credentials');
  }

  const cooldownKey = getOtpCooldownKey(email);
  const lastSentAt = await env.OTP_KV.get(cooldownKey);
  if (lastSentAt) {
    return json({ success: false, message: 'Please wait 60 seconds before requesting another OTP' }, { status: 429, headers: corsHeaders });
  }

  const otp = generateOtp();
  await env.OTP_KV.put(getOtpKey(email), JSON.stringify({ otp, createdAt: Date.now() }), {
    expirationTtl: 300,
  });
  await env.OTP_KV.put(cooldownKey, String(Date.now()), {
    expirationTtl: 60,
  });

  await sendOtpEmail(env, email, otp);

  return json({ 
    success: true, 
    message: 'Credentials verified. OTP sent to your email.',
    email,
    requiresOtp: true
  }, { headers: corsHeaders });
};

const handleLogin = async (request: Request, env: Env) => {
  let body: JsonBody;
  try {
    body = (await request.json()) as JsonBody;
  } catch {
    return badRequest('Invalid JSON body');
  }

  const identifier = String(body.email ?? body.identifier ?? '').trim();
  const password = String(body.password ?? '');
  const selectedRole = String(body.role ?? 'customer').trim().toLowerCase();

  if (!identifier || !password) {
    return badRequest('email/phone and password are required');
  }

  if (!['customer', 'shopkeeper'].includes(selectedRole)) {
    return badRequest('role must be either customer or shopkeeper');
  }

  const email = normalizeEmail(identifier);
  const phoneNumber = normalizePhone(identifier);
  const hasEmail = isValidEmail(email);
  const hasPhone = isValidPhone(phoneNumber);

  if (!hasEmail && !hasPhone) {
    return badRequest('Please provide a valid email or phone number');
  }

  const user = hasEmail
    ? await env.DB.prepare('SELECT id, name, email, phone_number, password, role, created_at FROM users WHERE email = ?').bind(email).first<UserRow>()
    : await env.DB.prepare('SELECT id, name, email, phone_number, password, role, created_at FROM users WHERE phone_number = ?').bind(phoneNumber).first<UserRow>();
  
  if (!user) {
    return unauthorized('Invalid email or password');
  }

  const ok = await verifyPassword(password, user.password);
  if (!ok) {
    return unauthorized('Invalid email or password');
  }

  // Check if user's role matches the selected role
  if (user.role !== selectedRole) {
    const roleLabel = selectedRole === 'shopkeeper' ? 'shopkeeper' : 'customer';
    return unauthorized(`You are not registered as a ${roleLabel}`);
  }

  const session = await createSession(env, user);
  return json({ success: true, message: 'Login successful', role: user.role, token: session.token, user: session.user }, { headers: corsHeaders });
};

const handleCreateShop = async (request: Request, env: Env) => {
  let body: JsonBody;
  try {
    body = (await request.json()) as JsonBody;
  } catch {
    return badRequest('Invalid JSON body');
  }

  const ownerId = String(body.owner_id ?? '').trim();
  const name = String(body.name ?? '').trim();
  const category = String(body.category ?? '').trim();
  const description = String(body.description ?? '').trim();
  const address = String(body.address ?? '').trim();
  const phoneNumber = String(body.phoneNumber ?? '').trim();
  const imageUrl = String(body.imageUrl ?? '').trim();
  const serviceType = String(body.service_type ?? '').trim().toLowerCase();

  if (!ownerId || !name || !category || !description || !address || !phoneNumber || !imageUrl || !serviceType) {
    return badRequest('owner_id, name, category, description, address, phoneNumber, imageUrl and service_type are required');
  }

  if (!['products', 'services', 'both'].includes(serviceType)) {
    return badRequest('service_type must be one of products, services, or both');
  }

  const owner = await env.DB.prepare('SELECT id, role FROM users WHERE id = ?').bind(ownerId).first<{ id: string; role: Role }>();
  if (!owner) {
    return badRequest('Invalid owner_id');
  }
  if (owner.role !== 'shopkeeper') {
    return unauthorized('Only shopkeepers can create a shop');
  }

  const existingShop = await env.DB.prepare('SELECT id FROM shops WHERE owner_id = ?').bind(ownerId).first();
  if (existingShop) {
    return json({ success: false, message: 'Shop already exists for this user' }, { status: 409, headers: corsHeaders });
  }

  const shopId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await env.DB.prepare(
    'INSERT INTO shops (id, owner_id, name, category, description, address, phone_number, imageUrl, service_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  )
    .bind(shopId, ownerId, name, category, description, address, phoneNumber, imageUrl, serviceType, createdAt)
    .run();

  return json(
    {
      success: true,
      message: 'Shop created successfully',
      shop: {
        id: shopId,
        owner_id: ownerId,
        name,
        category,
        description,
        address,
        phone_number: phoneNumber,
        imageUrl,
        service_type: serviceType,
        created_at: createdAt,
      },
    },
    { status: 201, headers: corsHeaders }
  );
};

const handleGetShop = async (request: Request, env: Env) => {
  const url = new URL(request.url);
  const ownerId = String(url.searchParams.get('owner_id') ?? '').trim();
  if (!ownerId) {
    return badRequest('owner_id is required');
  }

  const shop = await env.DB.prepare(
    'SELECT id, owner_id, name, category, description, address, phone_number, imageUrl, service_type, created_at FROM shops WHERE owner_id = ?'
  )
    .bind(ownerId)
    .first<ShopRow>();

  if (!shop) {
    return json({ success: false, message: 'Shop not found' }, { status: 404, headers: corsHeaders });
  }

  return json({ success: true, shop }, { headers: corsHeaders });
};

const handleCreateProduct = async (request: Request, env: Env) => {
  let payload: ProductUpload;

  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const shopId = String(formData.get('shop_id') ?? '').trim();
    const name = String(formData.get('name') ?? '').trim();
    const category = String(formData.get('category') ?? '').trim();
    const price = Number(formData.get('price') ?? 0);
    const stock = Number(formData.get('stock') ?? 0);
    const file = formData.get('image');

    if (!(file instanceof File)) {
      return badRequest('image file is required');
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return badRequest('Only jpg, png, and webp images are allowed');
    }

    if (file.size > 2 * 1024 * 1024) {
      return badRequest('Image must be 2MB or smaller');
    }

    payload = {
      shopId,
      name,
      category,
      price: Number.isFinite(price) ? price : 0,
      stock: Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : 0,
      imageUrl: await fileToDataUrl(file),
    };
  } else {
    let body: JsonBody;
    try {
      body = (await request.json()) as JsonBody;
    } catch {
      return badRequest('Invalid JSON body');
    }

    payload = {
      shopId: String(body.shop_id ?? '').trim(),
      name: String(body.name ?? '').trim(),
      category: String(body.category ?? '').trim(),
      price: Number(body.price ?? 0),
      stock: Number(body.stock ?? 0),
      imageUrl: String(body.imageUrl ?? '').trim(),
    };
  }

  const { shopId, name, category, price, stock, imageUrl } = payload;

  if (!shopId || !name || !category || !imageUrl) {
    return badRequest('shop_id, name, category and imageUrl are required');
  }

  const shop = await env.DB.prepare('SELECT id FROM shops WHERE id = ?').bind(shopId).first();
  if (!shop) {
    return badRequest('Shop not found. Please create your shop first');
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await env.DB.prepare(
    'INSERT INTO products (id, shop_id, name, category, price, stock, imageUrl, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  )
    .bind(id, shopId, name, category, Number.isFinite(price) ? price : 0, Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : 0, imageUrl, createdAt)
    .run();

  return json(
    {
      success: true,
      message: 'Product created successfully',
      product: { id, shop_id: shopId, name, category, price, stock, imageUrl, created_at: createdAt },
    },
    { status: 201, headers: corsHeaders }
  );
};

const handleGetProducts = async (request: Request, env: Env) => {
  const url = new URL(request.url);
  const shopId = String(url.searchParams.get('shop_id') ?? '').trim();
  if (!shopId) {
    return badRequest('shop_id is required');
  }

  const results = await env.DB.prepare(
    'SELECT id, shop_id, name, category, price, stock, imageUrl, created_at FROM products WHERE shop_id = ? ORDER BY created_at DESC'
  )
    .bind(shopId)
    .all();

  const products = (results.results || []) as Array<Record<string, unknown>>;
  return json({ success: true, products }, { headers: corsHeaders });
};

const handleGetOrders = async (request: Request, env: Env) => {
  const url = new URL(request.url);
  const shopId = String(url.searchParams.get('shop_id') ?? '').trim();
  if (!shopId) {
    return badRequest('shop_id is required');
  }

  const results = await env.DB.prepare(
    'SELECT id, shop_id, total, status, created_at FROM orders WHERE shop_id = ? ORDER BY created_at DESC'
  )
    .bind(shopId)
    .all();

  const orders = (results.results || []) as Array<Record<string, unknown>>;
  return json({ success: true, orders }, { headers: corsHeaders });
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    try {
      if (request.method === 'GET' && url.pathname === '/signup') {
        return new Response('API working', { status: 200, headers: corsHeaders });
      }

      if (request.method === 'POST' && url.pathname === '/signup') {
        return await handleSignup(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/send-otp') {
        return await handleSendOtp(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/login-with-otp') {
        return await handleLoginWithOtp(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/verify-otp') {
        return await handleVerifyOtp(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/login') {
        return await handleLogin(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/shops') {
        return await handleCreateShop(request, env);
      }

      if (request.method === 'GET' && url.pathname === '/shops') {
        return await handleGetShop(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/products') {
        return await handleCreateProduct(request, env);
      }

      if (request.method === 'GET' && url.pathname === '/products') {
        return await handleGetProducts(request, env);
      }

      if (request.method === 'GET' && url.pathname === '/orders') {
        return await handleGetOrders(request, env);
      }

      if (request.method === 'GET' && url.pathname === '/health') {
        return json({ success: true, message: 'LocalKart auth worker is running' }, { headers: corsHeaders });
      }

      return json({ success: false, message: 'Route not found' }, { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error('[auth-worker] Unhandled error:', error);
      return serverError('Something went wrong');
    }
  },
};
