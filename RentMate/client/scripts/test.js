// test.js
// Usage: node test.js [BASE_URL]
// Default BASE_URL = http://localhost:3000
const fetch = require('node-fetch');

const BASE_URL = process.argv[2] || 'http://localhost:3000';

function log(title) { console.log(`\n=== ${title} ===`); }
function ok(status) { return status >= 200 && status < 400; }

let sessionId = null;

async function request(method, path, { payload, cookie } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (cookie) headers.Cookie = `sessionId=${cookie}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: payload ? JSON.stringify(payload) : undefined,
  });

  const bodyText = await res.text();

  const setCookie = res.headers.get('set-cookie') || '';
  const m = setCookie.match(/sessionId=([^;]+)/);
  const nextCookie = m ? m[1] : cookie;

  return { status: res.status, bodyText, cookie: nextCookie, res };
}

function printResult(name, { status }, passIf = (s)=>ok(s)) {
  console.log(`Running: ${name}`);
  const passed = passIf(status);
  console.log(`${passed ? '✅ PASSED' : '❌ FAILED'}: ${name} → ${status}`);
  return passed;
}

async function registerAndLogin() {
  console.log('\n=== Register & Login ===');

  const username = 'u' + Date.now().toString(36);
  const password = 'pass9';
  const fullName = 'Test User';

  let r = await request('POST', '/api/users/register', {
    payload: { username, password, fullName }
  });
  console.log(`${(r.status===201||r.status===409)?'✅':'❌'} POST /api/users/register → ${r.status}`);

  r = await request('POST', '/api/users/login', {
    payload: { username, password, rememberMe: true }
  });

  sessionId = r.cookie || null;
  console.log(`${(r.status===200 && sessionId)?'✅':'❌'} POST /api/users/login → ${r.status}`);

  if (!sessionId) {
    console.log('Body:', r.bodyText);
    throw new Error('No sessionId received from login (Set-Cookie missing)');
  }

  return { username, password };
}

async function createProduct() {
  log('Create Product');
  const payload = {
    title: 'Hammer',
    description: 'Solid test hammer',
    price: 10,
    stock: 3,
    image: '',
    rentalDays: 7,
    addedBy: 'tester'
  };
  const r = await request('POST', '/api/products', { payload, cookie: sessionId });
  sessionId = r.cookie;
  printResult('POST /api/products (create)', r, s => s === 201);

  let newId = null;
  try {
    const parsed = JSON.parse(r.bodyText);
    newId = parsed?.newId || null;
  } catch {}
  return newId;
}

async function aiTests() {
  log('RentMate AI');
  let r = await request('POST', '/api/ai/price-suggest', {
    payload: { title: 'Canon EOS 80D camera', description: 'DSLR body', basePrice: 15, rentalDays: 3 }
  });
  printResult('POST /api/ai/price-suggest (valid)', r, s => s === 200);

  r = await request('POST', '/api/ai/price-suggest', {
    payload: { description: 'no title here' }
  });
  printResult('POST /api/ai/price-suggest (missing title)', r, s => s === 400);
}

async function disputesTests(productId) {
  log('Dispute Center');
  let r = await request('GET', '/api/disputes', { cookie: sessionId });
  sessionId = r.cookie;
  printResult('GET /api/disputes (list mine)', r, s => s === 200);

  r = await request('POST', '/api/disputes', {
    cookie: sessionId,
    payload: { productId, type: 'damage', description: 'Broken screen' }
  });
  sessionId = r.cookie;
  printResult('POST /api/disputes (create)', r, s => s === 201);

  let disputeId = null;
  try { disputeId = JSON.parse(r.bodyText)?.id; } catch {}

  r = await request('POST', `/api/disputes/${encodeURIComponent(disputeId)}/reply`, {
    cookie: sessionId,
    payload: { text: 'Please handle ASAP' }
  });
  sessionId = r.cookie;
  printResult('POST /api/disputes/:id/reply', r, s => s === 200);
  r = await request('POST', `/api/disputes/${encodeURIComponent(disputeId)}/resolve`, {
    cookie: sessionId
  });
  sessionId = r.cookie;
  printResult('POST /api/disputes/:id/resolve', r, s => s === 200 || s === 403 || s === 409);
}

async function profileTests(username, currentPassword) {
  log('Profile & Change Password');

  let r = await request('GET', '/api/account/profile', { cookie: sessionId });
  sessionId = r.cookie;
  printResult('GET /api/account/profile', r, s => s === 200);

  const newName = 'User ' + Math.random().toString(36).slice(2,6);
  r = await request('POST', '/api/account/profile', {
    cookie: sessionId,
    payload: { fullName: newName, mode: 'dark' }
  });
  sessionId = r.cookie;
  printResult('POST /api/account/profile (update)', r, s => s === 200);

  r = await request('POST', '/api/account/change-password', {
    cookie: sessionId,
    payload: { oldPassword: 'WRONG', newPassword: 'pass10' }
  });
  sessionId = r.cookie;
  printResult('POST /api/account/change-password (wrong old)', r, s => s === 400);

  r = await request('POST', '/api/account/change-password', {
    cookie: sessionId,
    payload: { oldPassword: currentPassword, newPassword: 'pass10' }
  });
  sessionId = r.cookie;
  printResult('POST /api/account/change-password (ok)', r, s => s === 200);

  // Verify login with new password
  r = await request('POST', '/api/users/login', {
    payload: { username, password: 'pass10', rememberMe: true }
  });
  sessionId = r.cookie;
  printResult('POST /api/users/login (after password change)', r, s => s === 200);
}

async function statsTests() {
  log('Stats');
  const r = await request('GET', '/api/stats/my', { cookie: sessionId });
  sessionId = r.cookie;
  printResult('GET /api/stats/my', r, s => s === 200);
}

async function run() {
  console.log(`Base URL: ${BASE_URL}\n`);

  // Public routes
  log('Public Routes');
  let r = await request('GET', '/api/products');
  printResult('GET /api/products', r);

  r = await request('GET', '/api/users/status');
  printResult('GET /api/users/status (unauth)', r, s => s === 200);

  // Protected routes (unauth)
  log('Protected Routes (Unauthenticated → expect 401)');
  const expect401 = s => s === 401;
  r = await request('GET', '/api/cart');
  printResult('GET /api/cart (unauth)', r, expect401);

  r = await request('POST', '/api/cart/add', { payload: { itemId: 'does-not-exist' } });
  printResult('POST /api/cart/add (unauth)', r, expect401);

  r = await request('GET', '/api/purchases');
  printResult('GET /api/purchases (unauth)', r, expect401);

  r = await request('POST', '/api/checkout/pay');
  printResult('POST /api/checkout/pay (unauth)', r, expect401);

  r = await request('GET', '/api/admin/activity');
  printResult('GET /api/admin/activity (unauth)', r, expect401);

  // Authenticated flow
  const { username, password } = await registerAndLogin();

  // Toggle mode via POST /api/users/status (no requireAuth but needs valid cookie)
  log('User Status Toggle');
  r = await request('POST', '/api/users/status', { cookie: sessionId });
  sessionId = r.cookie;
  printResult('POST /api/users/status (toggle)', r, s => s === 200);

  // Create product for downstream tests
  const productId = await createProduct();
  if (!productId) {
    console.log('❌ Could not create product; skipping cart/checkout/disputes/stats tests.');
  } else {
    // Cart flow
    log('Cart Flow');
    r = await request('POST', '/api/cart/add', { cookie: sessionId, payload: { itemId: productId } });
    sessionId = r.cookie;
    printResult('POST /api/cart/add', r, s => s === 201 || s === 409);

    r = await request('POST', '/api/cart/update-duration', { cookie: sessionId, payload: { itemId: productId, days: 3 } });
    sessionId = r.cookie;
    printResult('POST /api/cart/update-duration', r, s => s === 200);

    r = await request('GET', '/api/cart', { cookie: sessionId });
    sessionId = r.cookie;
    printResult('GET /api/cart', r, s => s === 200);

    r = await request('POST', '/api/checkout/pay', { cookie: sessionId });
    sessionId = r.cookie;
    printResult('POST /api/checkout/pay', r, s => s === 200 || s === 400);

    r = await request('GET', '/api/purchases', { cookie: sessionId });
    sessionId = r.cookie;
    printResult('GET /api/purchases', r, s => s === 200);

    r = await request('POST', '/api/cart/clear', { cookie: sessionId });
    sessionId = r.cookie;
    printResult('POST /api/cart/clear', r, s => s === 200);

    // Dynamic delete
    log('Dynamic Routes');
    r = await request('DELETE', `/api/products/${encodeURIComponent(productId)}`, { cookie: sessionId });
    sessionId = r.cookie;
    printResult(`DELETE /api/products/:id (${productId})`, r, s => s === 204 || s === 200);

    // Disputes
    await disputesTests("p1");

    // Stats
    await statsTests();
  }

  // AI tests (public)
  await aiTests();

  // Profile & password change
  await profileTests(username, password);

  // Admin-related (read-only)
  log('Activity Routes');
  r = await request('GET', '/api/users/activity', { cookie: sessionId });
  sessionId = r.cookie;
  printResult('GET /api/users/activity', r, s => s === 200);

  r = await request('GET', '/api/admin/activity', { cookie: sessionId });
  sessionId = r.cookie;
  printResult('GET /api/admin/activity', r, s => s === 200);
}

run().catch(e => {
  console.error('Fatal error in tests:', e);
  process.exit(1);
});
