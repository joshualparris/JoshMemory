module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ ok: true, mode: 'hosted-node-demo', languagesExecuted: 1, note: 'Full 9-language chain runs on the local Go server.' });
};
