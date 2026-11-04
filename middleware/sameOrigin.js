function sameOriginMutation(req, res, next) {
  if (['GET','HEAD','OPTIONS'].includes(req.method)) return next();

  const site = String(req.get('sec-fetch-site') || '').toLowerCase();
  if (site === 'cross-site') return res.status(403).send('Cross-site admin request denied.');

  const origin = req.get('origin');
  if (origin) {
    try {
      const parsed = new URL(origin);
      const host = req.get('host');
      if ((parsed.protocol !== 'https:' && parsed.protocol !== 'http:') ||
          parsed.host.toLowerCase() !== String(host || '').toLowerCase()) {
        return res.status(403).send('Admin request origin mismatch.');
      }
    } catch (error) {
      return res.status(403).send('Invalid request origin.');
    }
  }
  next();
}
module.exports = { sameOriginMutation };
