// api/callback.js — Échange le code OAuth contre un token GitHub
module.exports = async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    res.status(400).send('Paramètre code manquant');
    return;
  }

  const clientId     = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.status(500).send('Variables GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET non configurées');
    return;
  }

  let token, errorMsg;

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
    });
    const data = await response.json();
    if (data.error) {
      errorMsg = data.error_description || data.error;
    } else {
      token = data.access_token;
    }
  } catch (err) {
    errorMsg = err.message;
  }

  if (errorMsg) {
    res.send(`<script>
      window.opener && window.opener.postMessage('authorization:github:error:${errorMsg.replace(/'/g, "\\'")}', '*');
      window.close();
    </script>`);
    return;
  }

  // Retourne le token au CMS via postMessage (pattern standard Decap CMS)
  res.send(`<script>
    (function () {
      function receiveMessage(e) {
        window.opener.postMessage(
          'authorization:github:success:{"token":"${token}","provider":"github"}',
          e.origin
        );
        window.removeEventListener('message', receiveMessage, false);
        window.close();
      }
      window.addEventListener('message', receiveMessage, false);
      window.opener.postMessage('authorizing:github', '*');
    })();
  </script>`);
};
