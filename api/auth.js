// api/auth.js — Lance le flux OAuth GitHub pour Decap CMS
module.exports = function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(500).send('GITHUB_CLIENT_ID non configuré');
    return;
  }
  const callbackUrl = 'https://www.gacem-avocat.com/api/callback';
  const scope = 'repo,user';
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=${scope}`;
  res.redirect(302, url);
};
