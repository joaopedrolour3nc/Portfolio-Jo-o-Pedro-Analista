import { createClient } from '@libsql/client';

function getClient() {
  return createClient({
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_TOKEN,
  });
}

async function ensureTables(db) {
  await db.execute(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY,
    title TEXT, content TEXT, tags TEXT,
    date TEXT, author TEXT, image TEXT
  )`);
  await db.execute(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY,
    titulo TEXT, descricaoCurta TEXT, stack TEXT,
    data TEXT, github TEXT, demo TEXT,
    imagem TEXT, tags TEXT, destaque INTEGER DEFAULT 0
  )`);
  await db.execute(`CREATE TABLE IF NOT EXISTS site_content (
    key TEXT PRIMARY KEY,
    value TEXT
  )`);
}

const DEFAULT_CONTENT = {
  hero_title: 'Transformando dados em <em>decisões</em>.',
  hero_eyebrow: 'Analista de Dados',
  hero_subtitle: 'Construo dashboards, análises e automações que ajudam empresas a enxergar padrões, medir resultados e agir com mais inteligência.',
  hero_btn1_text: 'Ver Projetos →',
  hero_btn1_link: 'projetos.html',
  hero_btn2_text: 'Entre em contato',
  hero_btn2_link: 'contato.html',
  sobre_label: '// sobre mim',
  sobre_title: 'Quem sou eu',
  sobre_p1: 'Sou analista de dados com experiência em transformar dados brutos em insights acionáveis. Trabalho com o ciclo completo: da extração e modelagem até a visualização e apresentação para stakeholders.',
  sobre_p2: 'Tenho forte domínio em <strong>SQL</strong> para consultas complexas e modelagem, <strong>Power BI</strong> para dashboards executivos e operacionais, <strong>Python</strong> para automação e análise estatística, e <strong>Excel</strong> para relatórios dinâmicos e automações com VBA.',
  sobre_p3: 'Apaixonado por resolver problemas de negócio com dados — desde a pergunta certa até a visualização que convence a sala.',
  skills_label: '// stack',
  skills_title: 'Habilidades',
  skills_desc: 'Ferramentas e tecnologias que uso no dia a dia para gerar valor com dados.',
  skills_list: 'SQL,Power BI,Python,Excel,ETL,Dashboards,Estatística,DAX,Pandas,PostgreSQL,BigQuery,VBA',
  metrics_label: '// resultados',
  metrics_title: 'Em números',
  metric1_value: '+20',
  metric1_label: 'Dashboards entregues',
  metric2_value: '+50',
  metric2_label: 'Análises realizadas',
  metric3_value: '12',
  metric3_label: 'Automações desenvolvidas',
  habilidades: JSON.stringify([
    { nome: 'SQL & Banco de Dados', pct: 92 },
    { nome: 'Power BI & DAX',       pct: 88 },
    { nome: 'Python & Pandas',      pct: 80 },
    { nome: 'Excel & VBA',          pct: 85 },
    { nome: 'Estatística Aplicada', pct: 74 },
  ]),
  contato_title: 'Entre em contato',
  contato_desc: 'Aberto a oportunidades de emprego, projetos freelance e parcerias. Escolha o canal que preferir — responderei o mais breve possível.',
  contato_disponivel: 'Disponível para novas oportunidades',
  contato_email: 'joaopedro08moura@proton.me',
  contato_linkedin: 'https://www.linkedin.com/in/joaopedrolour3nc/',
  contato_github: 'https://github.com/joaopedrolour3nc',
  contato_localizacao: 'São Paulo, SP — Brasil',
  contato_localizacao_sub: 'Remoto ou presencial',
  blog_title: 'Artigos & Insights',
  blog_desc: 'Análises, aprendizados e reflexões sobre dados, ferramentas e carreira.',
  projetos_title: 'Projetos',
  projetos_desc: 'Trabalhos desenvolvidos nas áreas de Business Intelligence, Análise de Dados, Engenharia de Dados e Automação.',
  footer_github: 'https://github.com/joaopedrolour3nc',
  footer_linkedin: 'https://www.linkedin.com/in/joaopedrolour3nc/',
  nav_home: 'Home',
  nav_projetos: 'Projetos',
  nav_blog: 'Blog',
  nav_contato: 'Contato',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const db = getClient();
    await ensureTables(db);

    /* ---- GET ---- */
    if (req.method === 'GET') {
      const [posts, projects, content] = await Promise.all([
        db.execute('SELECT * FROM posts ORDER BY id DESC'),
        db.execute('SELECT * FROM projects ORDER BY id DESC'),
        db.execute('SELECT key, value FROM site_content'),
      ]);

      const contentMap = {};
      content.rows.forEach(r => { contentMap[r.key] = r.value; });
      const merged = { ...DEFAULT_CONTENT, ...contentMap };

      return res.status(200).json({
        posts: posts.rows.map(p => ({
          id: p.id, title: p.title, content: p.content,
          tags: p.tags ? JSON.parse(p.tags) : [],
          date: p.date, author: p.author, image: p.image || null,
        })),
        projects: projects.rows.map(p => ({
          id: p.id, titulo: p.titulo, descricaoCurta: p.descricaoCurta,
          stack: p.stack ? JSON.parse(p.stack) : [],
          data: p.data,
          links: { github: p.github || null, demo: p.demo || null },
          imagem: p.imagem || null,
          tags: p.tags ? JSON.parse(p.tags) : [],
          destaque: !!p.destaque,
        })),
        content: merged,
      });
    }

    /* ---- POST ---- */
    if (req.method === 'POST') {
      const { type, item } = req.body;
      if (!type || !item) return res.status(400).json({ error: 'Faltam dados' });

      if (type === 'post') {
        await db.execute({
          sql: `INSERT INTO posts (id, title, content, tags, date, author, image) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [item.id, item.title, item.content, JSON.stringify(item.tags || []), item.date, item.author || 'João Pedro', item.image || null]
        });
      } else if (type === 'project') {
        await db.execute({
          sql: `INSERT INTO projects (id, titulo, descricaoCurta, stack, data, github, demo, imagem, tags, destaque) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [item.id, item.titulo, item.descricaoCurta || '', JSON.stringify(item.stack || []), item.data || '', item.links?.github || null, item.links?.demo || null, item.imagem || null, JSON.stringify(item.tags || []), item.destaque ? 1 : 0]
        });
      } else if (type === 'content') {
        // item = { key: 'hero_title', value: '...' } ou array de pares
        const pairs = Array.isArray(item) ? item : [item];
        for (const pair of pairs) {
          await db.execute({
            sql: `INSERT INTO site_content (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
            args: [pair.key, pair.value]
          });
        }
      } else {
        return res.status(400).json({ error: 'Tipo inválido' });
      }
      return res.status(200).json({ ok: true });
    }

    /* ---- DELETE ---- */
    if (req.method === 'DELETE') {
      const { type, id } = req.body;
      if (!type || !id) return res.status(400).json({ error: 'Faltam dados' });
      const table = type === 'post' ? 'posts' : 'projects';
      await db.execute({ sql: `DELETE FROM ${table} WHERE id = ?`, args: [id] });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Método não permitido' });

  } catch (err) {
    console.error('DB error:', err);
    return res.status(500).json({ error: err.message });
  }
}
