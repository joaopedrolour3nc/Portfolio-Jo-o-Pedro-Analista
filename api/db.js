const { createClient } = require('@libsql/client');

function getClient() {
  return createClient({
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_TOKEN,
  });
}

async function ensureTables(db) {
  await db.execute(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY,
    title TEXT,
    content TEXT,
    tags TEXT,
    date TEXT,
    author TEXT,
    image TEXT
  )`);
  await db.execute(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY,
    titulo TEXT,
    descricaoCurta TEXT,
    stack TEXT,
    data TEXT,
    github TEXT,
    demo TEXT,
    imagem TEXT,
    tags TEXT,
    destaque INTEGER DEFAULT 0
  )`);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const db = getClient();
  await ensureTables(db);

  /* ---- GET: retorna todos os posts e projetos ---- */
  if (req.method === 'GET') {
    const [posts, projects] = await Promise.all([
      db.execute('SELECT * FROM posts ORDER BY id DESC'),
      db.execute('SELECT * FROM projects ORDER BY id DESC'),
    ]);

    return res.status(200).json({
      posts: posts.rows.map(p => ({
        id: p.id,
        title: p.title,
        content: p.content,
        tags: p.tags ? JSON.parse(p.tags) : [],
        date: p.date,
        author: p.author,
        image: p.image || null,
      })),
      projects: projects.rows.map(p => ({
        id: p.id,
        titulo: p.titulo,
        descricaoCurta: p.descricaoCurta,
        stack: p.stack ? JSON.parse(p.stack) : [],
        data: p.data,
        links: { github: p.github || null, demo: p.demo || null },
        imagem: p.imagem || null,
        tags: p.tags ? JSON.parse(p.tags) : [],
        destaque: !!p.destaque,
      }))
    });
  }

  /* ---- POST: cria um post ou projeto ---- */
  if (req.method === 'POST') {
    const { type, item } = req.body;
    if (!type || !item) return res.status(400).json({ error: 'Faltam dados' });

    if (type === 'post') {
      await db.execute({
        sql: `INSERT INTO posts (id, title, content, tags, date, author, image)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          item.id,
          item.title,
          item.content,
          JSON.stringify(item.tags || []),
          item.date,
          item.author || 'João Pedro',
          item.image || null,
        ]
      });
    } else if (type === 'project') {
      await db.execute({
        sql: `INSERT INTO projects (id, titulo, descricaoCurta, stack, data, github, demo, imagem, tags, destaque)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          item.id,
          item.titulo,
          item.descricaoCurta || '',
          JSON.stringify(item.stack || []),
          item.data || '',
          item.links?.github || null,
          item.links?.demo || null,
          item.imagem || null,
          JSON.stringify(item.tags || []),
          item.destaque ? 1 : 0,
        ]
      });
    } else {
      return res.status(400).json({ error: 'Tipo inválido' });
    }

    return res.status(200).json({ ok: true });
  }

  /* ---- DELETE: remove um post ou projeto ---- */
  if (req.method === 'DELETE') {
    const { type, id } = req.body;
    if (!type || !id) return res.status(400).json({ error: 'Faltam dados' });
    const table = type === 'post' ? 'posts' : 'projects';
    await db.execute({ sql: `DELETE FROM ${table} WHERE id = ?`, args: [id] });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
