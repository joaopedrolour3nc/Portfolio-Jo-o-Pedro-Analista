// Vercel Function — proxy para API do GitHub
// Token fica guardado nas variáveis de ambiente da Vercel, nunca exposto no frontend

export default async function handler(req, res) {
  // Permite chamadas do próprio site
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = process.env.GITHUB_TOKEN;
  if (!token) return res.status(500).json({ error: 'Token não configurado na Vercel' });

  const REPO_OWNER = 'joaopedrolour3nc';
  const REPO_NAME  = 'Portfolio-Jo-o-Pedro-Analista';
  const DATA_FILE  = 'data.json';
  const BRANCH     = 'main';
  const API_URL    = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_FILE}`;

  // GET — retorna SHA + conteúdo
  if (req.method === 'GET') {
    try {
      const r = await fetch(`${API_URL}?ref=${BRANCH}&_=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github+json' }
      });
      if (!r.ok) throw new Error(`GitHub API HTTP ${r.status}`);
      const meta = await r.json();

      // Lê conteúdo via raw
      const raw = await fetch(`https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${DATA_FILE}?_=${Date.now()}`);
      const data = await raw.json();

      return res.status(200).json({ sha: meta.sha, data });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // PUT — salva conteúdo
  if (req.method === 'PUT') {
    try {
      const { data, sha } = req.body;
      if (!data || !sha) return res.status(400).json({ error: 'Faltam dados ou SHA' });

      const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

      const r = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github+json'
        },
        body: JSON.stringify({
          message: `update — ${new Date().toISOString()}`,
          content,
          sha,
          branch: BRANCH
        })
      });

      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.message || `HTTP ${r.status}`);
      }

      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
