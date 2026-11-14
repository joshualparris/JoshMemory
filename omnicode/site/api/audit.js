const { createHash } = require('node:crypto');
function valid(email) { return email.length <= 254 && /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,63}$/.test(email) && !email.includes('..'); }
module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!valid(email)) return res.status(400).json({ error: 'Please supply a valid demo email.' });
  const domain = email.split('@')[1];
  const local = email.split('@')[0];
  const masked = local[0] + (local.length > 1 ? '***' : '') + '@' + domain;
  const domainClass = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com'].includes(domain) ? 'personal-provider' : 'other-domain';
  const fingerprint = createHash('sha256').update(email).digest('hex').slice(0, 16);
  const tld = domain.split('.').at(-1);
  res.status(200).json({ mode: 'hosted-node-demo', email, masked, domain, domainClass, tld, fingerprint,
    stages: [{ language: 'JavaScript (Node.js)', action: 'Validate, normalise, classify and fingerprint (hosted demo)', result: 'complete' }],
    languagesExecuted: 1, notice: 'The hosted demo executes Node.js only. Run the local Go server to execute the complete nine-language pipeline.' });
};
