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
  password: string;
  role: Role;
  created_at: string;
};

type JsonBody = Record<string, unknown>;

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

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
    throw new Error('RESEND_API_KEY is missing');
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

const getOtpKey = (email: string) => `otp:${email}`;
const getOtpCooldownKey = (email: string) => `otp-cooldown:${email}`;
const getSessionKey = (token: string) => `session:${token}`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
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
  const password = String(body.password ?? '');
  const role = isValidRole(body.role) ? body.role : 'customer';

  if (!name || !email || !password) {
    return badRequest('name, email and password are required');
  }
  if (!isValidEmail(email)) {
    return badRequest('Please provide a valid email');
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
    'INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)' 
  ).bind(id, name, email, passwordHash, role, new Date().toISOString()).run();

  await sendWelcomeEmail(env, name, email);

  const user = { id, name, email, role };
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

const handleLogin = async (request: Request, env: Env) => {
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

  const session = await createSession(env, user);
  return json({ success: true, message: 'Login successful', token: session.token, user: session.user }, { headers: corsHeaders });
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    try {
      if (request.method === 'POST' && url.pathname === '/signup') {
        return await handleSignup(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/send-otp') {
        return await handleSendOtp(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/verify-otp') {
        return await handleVerifyOtp(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/login') {
        return await handleLogin(request, env);
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
