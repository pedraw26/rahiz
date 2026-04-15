const crypto = require('crypto');

const VALID_USER = 'Rahiz';
const VALID_PASS = 'monatestagawd2026.';
const SECRET = crypto.randomBytes(32).toString('hex');

function makeToken(user) {
  const payload = JSON.stringify({ user, exp: Date.now() + 86400000 }); // 24h
  const hmac = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return Buffer.from(payload).toString('base64') + '.' + hmac;
}

function verifyToken(token) {
  try {
    const [payloadB64, hmac] = token.split('.');
    const payload = Buffer.from(payloadB64, 'base64').toString();
    const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
    if (hmac !== expected) return false;
    const data = JSON.parse(payload);
    if (data.exp < Date.now()) return false;
    return true;
  } catch { return false; }
}

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' };

  // POST = login attempt
  if (event.httpMethod === 'POST') {
    try {
      const { user, pass } = JSON.parse(event.body);
      if (user === VALID_USER && pass === VALID_PASS) {
        const token = makeToken(user);
        return {
          statusCode: 200,
          headers: {
            ...headers,
            'Set-Cookie': `d9x_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
          },
          body: JSON.stringify({ ok: true })
        };
      }
      return { statusCode: 401, headers, body: JSON.stringify({ ok: false, error: 'Invalid credentials' }) };
    } catch {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Bad request' }) };
    }
  }

  // GET = check session
  if (event.httpMethod === 'GET') {
    const cookies = event.headers.cookie || '';
    const match = cookies.match(/d9x_session=([^;]+)/);
    if (match && verifyToken(match[1])) {
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }
    return { statusCode: 401, headers, body: JSON.stringify({ ok: false }) };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
};
