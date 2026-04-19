var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.ts
var json = /* @__PURE__ */ __name((data, init = {}) => new Response(JSON.stringify(data), {
  ...init,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    ...init.headers || {}
  }
}), "json");
var getAppName = /* @__PURE__ */ __name((env) => env.APP_NAME || "LocalKart", "getAppName");
var normalizeEmail = /* @__PURE__ */ __name((value) => String(value ?? "").trim().toLowerCase(), "normalizeEmail");
var normalizePhone = /* @__PURE__ */ __name((value) => String(value ?? "").replace(/\D/g, "").trim(), "normalizePhone");
var isValidEmail = /* @__PURE__ */ __name((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), "isValidEmail");
var isValidPhone = /* @__PURE__ */ __name((phone) => /^\d{10,15}$/.test(phone), "isValidPhone");
var isValidRole = /* @__PURE__ */ __name((value) => value === "customer" || value === "shopkeeper", "isValidRole");
var isStrongPassword = /* @__PURE__ */ __name((password) => password.length >= 6, "isStrongPassword");
var generateOtp = /* @__PURE__ */ __name(() => Math.floor(1e5 + Math.random() * 9e5).toString(), "generateOtp");
var generateToken = /* @__PURE__ */ __name(() => crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, ""), "generateToken");
var hashPassword = /* @__PURE__ */ __name(async (password) => {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  const key = await crypto.subtle.importKey("raw", passwordBytes, "PBKDF2", false, ["deriveBits"]);
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations: 1e5
    },
    key,
    256
  );
  const hashHex = Array.from(new Uint8Array(derivedBits)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${saltHex}:${hashHex}`;
}, "hashPassword");
var verifyPassword = /* @__PURE__ */ __name(async (password, stored) => {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = new Uint8Array(saltHex.match(/.{1,2}/g)?.map((part) => Number.parseInt(part, 16)) || []);
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);
  const key = await crypto.subtle.importKey("raw", passwordBytes, "PBKDF2", false, ["deriveBits"]);
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations: 1e5
    },
    key,
    256
  );
  const computed = Array.from(new Uint8Array(derivedBits)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return computed === hashHex;
}, "verifyPassword");
var sendEmail = /* @__PURE__ */ __name(async (env, to, subject, html) => {
  if (!env.RESEND_API_KEY) {
    console.warn("[auth-worker] RESEND_API_KEY is missing. Skipping email send in local/dev mode.", { to, subject });
    return;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: env.RESEND_FROM || `${getAppName(env)} <no-reply@resend.dev>`,
      to: [to],
      subject,
      html
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API error: ${response.status} ${errorText}`);
  }
}, "sendEmail");
var sendWelcomeEmail = /* @__PURE__ */ __name(async (env, name, email) => {
  const subject = "Welcome to LocalKart";
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
}, "sendWelcomeEmail");
var sendOtpEmail = /* @__PURE__ */ __name(async (env, email, otp) => {
  const subject = "Your LocalKart OTP";
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
}, "sendOtpEmail");
var fileToDataUrl = /* @__PURE__ */ __name(async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  const base64 = btoa(binary);
  return `data:${file.type};base64,${base64}`;
}, "fileToDataUrl");
var getOtpKey = /* @__PURE__ */ __name((email) => `otp:${email}`, "getOtpKey");
var getOtpCooldownKey = /* @__PURE__ */ __name((email) => `otp-cooldown:${email}`, "getOtpCooldownKey");
var getSessionKey = /* @__PURE__ */ __name((token) => `session:${token}`, "getSessionKey");
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};
var badRequest = /* @__PURE__ */ __name((message) => json({ success: false, message }, { status: 400, headers: corsHeaders }), "badRequest");
var unauthorized = /* @__PURE__ */ __name((message) => json({ success: false, message }, { status: 401, headers: corsHeaders }), "unauthorized");
var serverError = /* @__PURE__ */ __name((message) => json({ success: false, message }, { status: 500, headers: corsHeaders }), "serverError");
var createSession = /* @__PURE__ */ __name(async (env, user) => {
  const token = generateToken();
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  await env.SESSION_KV.put(getSessionKey(token), JSON.stringify(payload), {
    expirationTtl: 60 * 60 * 24 * 30
  });
  return { token, user: payload };
}, "createSession");
var handleSignup = /* @__PURE__ */ __name(async (request, env) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const name = String(body.name ?? "").trim();
  const email = normalizeEmail(body.email);
  const phoneNumber = normalizePhone(body.phoneNumber);
  const password = String(body.password ?? "");
  const role = isValidRole(body.role) ? body.role : "customer";
  if (!name || !email || !password) {
    return badRequest("name, email and password are required");
  }
  if (!isValidEmail(email)) {
    return badRequest("Please provide a valid email");
  }
  if (phoneNumber && !isValidPhone(phoneNumber)) {
    return badRequest("Please provide a valid phone number");
  }
  if (!isStrongPassword(password)) {
    return badRequest("Password must be at least 6 characters");
  }
  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (existing) {
    return json({ success: false, message: "User already exists" }, { status: 409, headers: corsHeaders });
  }
  const passwordHash = await hashPassword(password);
  const id = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT INTO users (id, name, email, phone_number, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).bind(id, name, email, phoneNumber || null, passwordHash, role, (/* @__PURE__ */ new Date()).toISOString()).run();
  await sendWelcomeEmail(env, name, email);
  const user = { id, name, email, phoneNumber: phoneNumber || null, role };
  const session = await createSession(env, { id, name, email, password: passwordHash, role, created_at: (/* @__PURE__ */ new Date()).toISOString() });
  return json({ success: true, message: "Signup successful", user, token: session.token }, { status: 201, headers: corsHeaders });
}, "handleSignup");
var handleSendOtp = /* @__PURE__ */ __name(async (request, env) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const email = normalizeEmail(body.email);
  if (!email) return badRequest("email is required");
  if (!isValidEmail(email)) return badRequest("Please provide a valid email");
  const user = await env.DB.prepare("SELECT id, name, email, role FROM users WHERE email = ?").bind(email).first();
  if (!user) {
    return json({ success: false, message: "Account not found" }, { status: 404, headers: corsHeaders });
  }
  const cooldownKey = getOtpCooldownKey(email);
  const lastSentAt = await env.OTP_KV.get(cooldownKey);
  if (lastSentAt) {
    return json({ success: false, message: "Please wait 60 seconds before requesting another OTP" }, { status: 429, headers: corsHeaders });
  }
  const otp = generateOtp();
  await env.OTP_KV.put(getOtpKey(email), JSON.stringify({ otp, createdAt: Date.now() }), {
    expirationTtl: 300
  });
  await env.OTP_KV.put(cooldownKey, String(Date.now()), {
    expirationTtl: 60
  });
  await sendOtpEmail(env, email, otp);
  return json({ success: true, message: "OTP sent successfully" }, { headers: corsHeaders });
}, "handleSendOtp");
var handleVerifyOtp = /* @__PURE__ */ __name(async (request, env) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const email = normalizeEmail(body.email);
  const otp = String(body.otp ?? "").trim();
  if (!email || !otp) {
    return badRequest("email and otp are required");
  }
  if (!isValidEmail(email)) {
    return badRequest("Please provide a valid email");
  }
  if (!/^[0-9]{6}$/.test(otp)) {
    return badRequest("OTP must be 6 digits");
  }
  const stored = await env.OTP_KV.get(getOtpKey(email));
  if (!stored) {
    return unauthorized("OTP expired or not found");
  }
  let parsed;
  try {
    parsed = JSON.parse(stored);
  } catch {
    return unauthorized("OTP expired or not found");
  }
  if (parsed.otp !== otp) {
    return unauthorized("Invalid OTP");
  }
  await env.OTP_KV.delete(getOtpKey(email));
  const user = await env.DB.prepare("SELECT id, name, email, role FROM users WHERE email = ?").bind(email).first();
  if (!user) {
    return unauthorized("Account not found");
  }
  const session = await createSession(env, { id: user.id, name: user.name, email: user.email, password: "", role: user.role, created_at: (/* @__PURE__ */ new Date()).toISOString() });
  return json({ success: true, message: "OTP verified successfully", token: session.token, user: session.user }, { headers: corsHeaders });
}, "handleVerifyOtp");
var handleLoginWithOtp = /* @__PURE__ */ __name(async (request, env) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const email = normalizeEmail(body.email);
  const password = String(body.password ?? "");
  if (!email || !password) {
    return badRequest("email and password are required");
  }
  if (!isValidEmail(email)) {
    return badRequest("Please provide a valid email");
  }
  const user = await env.DB.prepare("SELECT id, name, email, password, role, created_at FROM users WHERE email = ?").bind(email).first();
  if (!user) {
    return unauthorized("Invalid credentials");
  }
  const ok = await verifyPassword(password, user.password);
  if (!ok) {
    return unauthorized("Invalid credentials");
  }
  const cooldownKey = getOtpCooldownKey(email);
  const lastSentAt = await env.OTP_KV.get(cooldownKey);
  if (lastSentAt) {
    return json({ success: false, message: "Please wait 60 seconds before requesting another OTP" }, { status: 429, headers: corsHeaders });
  }
  const otp = generateOtp();
  await env.OTP_KV.put(getOtpKey(email), JSON.stringify({ otp, createdAt: Date.now() }), {
    expirationTtl: 300
  });
  await env.OTP_KV.put(cooldownKey, String(Date.now()), {
    expirationTtl: 60
  });
  await sendOtpEmail(env, email, otp);
  return json({
    success: true,
    message: "Credentials verified. OTP sent to your email.",
    email,
    requiresOtp: true
  }, { headers: corsHeaders });
}, "handleLoginWithOtp");
var handleLogin = /* @__PURE__ */ __name(async (request, env) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const identifier = String(body.email ?? body.identifier ?? "").trim();
  const password = String(body.password ?? "");
  const selectedRole = String(body.role ?? "customer").trim().toLowerCase();
  if (!identifier || !password) {
    return badRequest("email/phone and password are required");
  }
  if (!["customer", "shopkeeper"].includes(selectedRole)) {
    return badRequest("role must be either customer or shopkeeper");
  }
  const email = normalizeEmail(identifier);
  const phoneNumber = normalizePhone(identifier);
  const hasEmail = isValidEmail(email);
  const hasPhone = isValidPhone(phoneNumber);
  if (!hasEmail && !hasPhone) {
    return badRequest("Please provide a valid email or phone number");
  }
  const user = hasEmail ? await env.DB.prepare("SELECT id, name, email, phone_number, password, role, created_at FROM users WHERE email = ?").bind(email).first() : await env.DB.prepare("SELECT id, name, email, phone_number, password, role, created_at FROM users WHERE phone_number = ?").bind(phoneNumber).first();
  if (!user) {
    return unauthorized("Invalid email or password");
  }
  const ok = await verifyPassword(password, user.password);
  if (!ok) {
    return unauthorized("Invalid email or password");
  }
  if (user.role !== selectedRole) {
    const roleLabel = selectedRole === "shopkeeper" ? "shopkeeper" : "customer";
    return unauthorized(`You are not registered as a ${roleLabel}`);
  }
  const session = await createSession(env, user);
  return json({ success: true, message: "Login successful", role: user.role, token: session.token, user: session.user }, { headers: corsHeaders });
}, "handleLogin");
var handleCreateShop = /* @__PURE__ */ __name(async (request, env) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const ownerId = String(body.owner_id ?? "").trim();
  const name = String(body.name ?? "").trim();
  const category = String(body.category ?? "").trim();
  const description = String(body.description ?? "").trim();
  const address = String(body.address ?? "").trim();
  const phoneNumber = String(body.phoneNumber ?? "").trim();
  const imageUrl = String(body.imageUrl ?? "").trim();
  const serviceType = String(body.service_type ?? "").trim().toLowerCase();
  if (!ownerId || !name || !category || !description || !address || !phoneNumber || !imageUrl || !serviceType) {
    return badRequest("owner_id, name, category, description, address, phoneNumber, imageUrl and service_type are required");
  }
  if (!["products", "services", "both"].includes(serviceType)) {
    return badRequest("service_type must be one of products, services, or both");
  }
  const owner = await env.DB.prepare("SELECT id, role FROM users WHERE id = ?").bind(ownerId).first();
  if (!owner) {
    return badRequest("Invalid owner_id");
  }
  if (owner.role !== "shopkeeper") {
    return unauthorized("Only shopkeepers can create a shop");
  }
  const existingShop = await env.DB.prepare("SELECT id FROM shops WHERE owner_id = ?").bind(ownerId).first();
  if (existingShop) {
    return json({ success: false, message: "Shop already exists for this user" }, { status: 409, headers: corsHeaders });
  }
  const shopId = crypto.randomUUID();
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    "INSERT INTO shops (id, owner_id, name, category, description, address, phone_number, imageUrl, service_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(shopId, ownerId, name, category, description, address, phoneNumber, imageUrl, serviceType, createdAt).run();
  return json(
    {
      success: true,
      message: "Shop created successfully",
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
        created_at: createdAt
      }
    },
    { status: 201, headers: corsHeaders }
  );
}, "handleCreateShop");
var handleGetShop = /* @__PURE__ */ __name(async (request, env) => {
  const url = new URL(request.url);
  const ownerId = String(url.searchParams.get("owner_id") ?? "").trim();
  if (!ownerId) {
    return badRequest("owner_id is required");
  }
  const shop = await env.DB.prepare(
    "SELECT id, owner_id, name, category, description, address, phone_number, imageUrl, service_type, created_at FROM shops WHERE owner_id = ?"
  ).bind(ownerId).first();
  if (!shop) {
    return json({ success: false, message: "Shop not found" }, { status: 404, headers: corsHeaders });
  }
  return json({ success: true, shop }, { headers: corsHeaders });
}, "handleGetShop");
var handleCreateProduct = /* @__PURE__ */ __name(async (request, env) => {
  let payload;
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const shopId2 = String(formData.get("shop_id") ?? "").trim();
    const name2 = String(formData.get("name") ?? "").trim();
    const category2 = String(formData.get("category") ?? "").trim();
    const price2 = Number(formData.get("price") ?? 0);
    const stock2 = Number(formData.get("stock") ?? 0);
    const file = formData.get("image");
    if (!(file instanceof File)) {
      return badRequest("image file is required");
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return badRequest("Only jpg, png, and webp images are allowed");
    }
    if (file.size > 2 * 1024 * 1024) {
      return badRequest("Image must be 2MB or smaller");
    }
    payload = {
      shopId: shopId2,
      name: name2,
      category: category2,
      price: Number.isFinite(price2) ? price2 : 0,
      stock: Number.isFinite(stock2) ? Math.max(0, Math.floor(stock2)) : 0,
      imageUrl: await fileToDataUrl(file)
    };
  } else {
    let body;
    try {
      body = await request.json();
    } catch {
      return badRequest("Invalid JSON body");
    }
    payload = {
      shopId: String(body.shop_id ?? "").trim(),
      name: String(body.name ?? "").trim(),
      category: String(body.category ?? "").trim(),
      price: Number(body.price ?? 0),
      stock: Number(body.stock ?? 0),
      imageUrl: String(body.imageUrl ?? "").trim()
    };
  }
  const { shopId, name, category, price, stock, imageUrl } = payload;
  if (!shopId || !name || !category || !imageUrl) {
    return badRequest("shop_id, name, category and imageUrl are required");
  }
  const shop = await env.DB.prepare("SELECT id FROM shops WHERE id = ?").bind(shopId).first();
  if (!shop) {
    return badRequest("Shop not found. Please create your shop first");
  }
  const id = crypto.randomUUID();
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    "INSERT INTO products (id, shop_id, name, category, price, stock, imageUrl, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(id, shopId, name, category, Number.isFinite(price) ? price : 0, Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : 0, imageUrl, createdAt).run();
  return json(
    {
      success: true,
      message: "Product created successfully",
      product: { id, shop_id: shopId, name, category, price, stock, imageUrl, created_at: createdAt }
    },
    { status: 201, headers: corsHeaders }
  );
}, "handleCreateProduct");
var handleGetProducts = /* @__PURE__ */ __name(async (request, env) => {
  const url = new URL(request.url);
  const shopId = String(url.searchParams.get("shop_id") ?? "").trim();
  if (!shopId) {
    return badRequest("shop_id is required");
  }
  const results = await env.DB.prepare(
    "SELECT id, shop_id, name, category, price, stock, imageUrl, created_at FROM products WHERE shop_id = ? ORDER BY created_at DESC"
  ).bind(shopId).all();
  const products = results.results || [];
  return json({ success: true, products }, { headers: corsHeaders });
}, "handleGetProducts");
var handleGetOrders = /* @__PURE__ */ __name(async (request, env) => {
  const url = new URL(request.url);
  const shopId = String(url.searchParams.get("shop_id") ?? "").trim();
  if (!shopId) {
    return badRequest("shop_id is required");
  }
  const results = await env.DB.prepare(
    "SELECT id, shop_id, total, status, created_at FROM orders WHERE shop_id = ? ORDER BY created_at DESC"
  ).bind(shopId).all();
  const orders = results.results || [];
  return json({ success: true, orders }, { headers: corsHeaders });
}, "handleGetOrders");
var src_default = {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    const url = new URL(request.url);
    try {
      if (request.method === "GET" && url.pathname === "/signup") {
        return new Response("API working", { status: 200, headers: corsHeaders });
      }
      if (request.method === "POST" && url.pathname === "/signup") {
        return await handleSignup(request, env);
      }
      if (request.method === "POST" && url.pathname === "/send-otp") {
        return await handleSendOtp(request, env);
      }
      if (request.method === "POST" && url.pathname === "/login-with-otp") {
        return await handleLoginWithOtp(request, env);
      }
      if (request.method === "POST" && url.pathname === "/verify-otp") {
        return await handleVerifyOtp(request, env);
      }
      if (request.method === "POST" && url.pathname === "/login") {
        return await handleLogin(request, env);
      }
      if (request.method === "POST" && url.pathname === "/shops") {
        return await handleCreateShop(request, env);
      }
      if (request.method === "GET" && url.pathname === "/shops") {
        return await handleGetShop(request, env);
      }
      if (request.method === "POST" && url.pathname === "/products") {
        return await handleCreateProduct(request, env);
      }
      if (request.method === "GET" && url.pathname === "/products") {
        return await handleGetProducts(request, env);
      }
      if (request.method === "GET" && url.pathname === "/orders") {
        return await handleGetOrders(request, env);
      }
      if (request.method === "GET" && url.pathname === "/health") {
        return json({ success: true, message: "LocalKart auth worker is running" }, { headers: corsHeaders });
      }
      return json({ success: false, message: "Route not found" }, { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error("[auth-worker] Unhandled error:", error);
      return serverError("Something went wrong");
    }
  }
};

// C:/Users/priya/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// C:/Users/priya/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-WVVFFC/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// C:/Users/priya/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-WVVFFC/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
