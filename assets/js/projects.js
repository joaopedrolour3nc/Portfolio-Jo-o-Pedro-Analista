/* ============================================================
   projects.js — Dados e lógica de renderização / filtro
   ============================================================

   COMO ADICIONAR UM NOVO PROJETO:
   Basta copiar o modelo abaixo e adicionar ao array PROJECTS.

   MODELO DE PROJETO:
   {
     id: 5,                                  // ID único (incremental)
     titulo: "Nome do Projeto",              // Título do projeto
     descricaoCurta: "Descrição curta...",   // Até ~150 caracteres
     stack: ["Python", "SQL"],               // Tecnologias usadas
     data: "03-2024",                        // Formato MM-YYYY ou DD-MM-YYYY (ex: "23-02-2026")
     links: {
       github: "https://github.com/...",     // URL do repositório (ou null)
       demo:   "https://...",                // URL da demo (ou null)
     },
     imagem: null,                           // Emoji (ex: "📊"), URL externa (ex: "https://i.imgur.com/abc.png"),
     //                                          // caminho local (ex: "assets/img/meu-projeto.png"), ou null
     tags: ["ETL", "Automação"],            // Tags para filtro
     destaque: false,                        // true = exibe badge "Destaque"
   },
   ============================================================ */

const PROJECTS = [
  {
    id: 1,
    titulo: "Dashboard Comercial — Power BI",
    descricaoCurta: "Painel interativo de KPIs comerciais com análise de receita, funil de vendas e metas por regional. Conectado a banco SQL Server via DirectQuery.",
    stack: ["Power BI", "SQL Server", "DAX"],
    data: "11-2024",
    links: {
      github: "https://github.com/joaopedrolour3nc/dashboard-comercial",
      demo: null,
    },
    imagem: "📊",
    tags: ["Power BI", "Dashboard", "Vendas"],
    destaque: true,
  },
  {
    id: 2,
    titulo: "Análise de Churn com SQL",
    descricaoCurta: "Estudo completo de churn de clientes em base PostgreSQL: cohort analysis, segmentação RFM e identificação de padrões de cancelamento.",
    stack: ["PostgreSQL", "SQL", "DBeaver"],
    data: "08-2024",
    links: {
      github: "https://github.com/joaopedrolour3nc/analise-churn-sql",
      demo: null,
    },
    imagem: "🔍",
    tags: ["SQL", "Análise", "CRM"],
    destaque: true,
  },
  {
    id: 3,
    titulo: "Pipeline ETL — API → Data Warehouse",
    descricaoCurta: "Pipeline de dados em Python que extrai dados de APIs REST, transforma com Pandas e carrega em BigQuery. Agendado via Cloud Scheduler.",
    stack: ["Python", "Pandas", "BigQuery", "GCP"],
    data: "05-2024",
    links: {
      github: "https://github.com/joaopedrolour3nc/pipeline-etl-bq",
      demo: null,
    },
    imagem: "⚙️",
    tags: ["ETL", "Python", "Cloud"],
    destaque: false,
  },
  {
    id: 4,
    titulo: "Automação de Relatórios Excel",
    descricaoCurta: "Macro VBA + script Python para geração automática de relatórios mensais: consolida 30+ planilhas, aplica fórmulas e envia por e-mail via Outlook.",
    stack: ["Excel", "VBA", "Python", "openpyxl"],
    data: "02-2024",
    links: {
      github: "https://github.com/joaopedrolour3nc/automacao-excel",
      demo: null,
    },
    imagem: "📁",
    tags: ["Excel", "Automação", "Relatórios"],
    destaque: false,
  },
];

/* ============================================================
   LÓGICA DE RENDER / FILTRO
   ============================================================ */

let activeFilters = new Set();
let searchQuery = '';
let sortOrder = 'recente';

function getAllTags() {
  const tags = new Set();
  PROJECTS.forEach(p => p.tags.forEach(t => tags.add(t)));
  return [...tags].sort();
}

function filteredProjects() {
  let result = [...PROJECTS];

  if (activeFilters.size > 0) {
    result = result.filter(p =>
      p.tags.some(t => activeFilters.has(t))
    );
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    result = result.filter(p =>
      p.titulo.toLowerCase().includes(q) ||
      p.descricaoCurta.toLowerCase().includes(q) ||
      p.stack.some(s => s.toLowerCase().includes(q)) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  if (sortOrder === 'recente') {
    result.sort((a, b) => b.data.localeCompare(a.data));
  } else if (sortOrder === 'az') {
    result.sort((a, b) => a.titulo.localeCompare(b.titulo));
  }

  return result;
}

function formatDate(yyyymm) {
  if (!yyyymm || !yyyymm.includes('-')) return yyyymm || '';
  var parts = yyyymm.split('-');
  var year  = parts[0];
  var month = parseInt(parts[1], 10);
  var months = [
    'Jan','Fev','Mar','Abr','Mai','Jun',
    'Jul','Ago','Set','Out','Nov','Dez'
  ];
  // Mês fora do intervalo 1-12: mostra só o ano para não quebrar
  if (month < 1 || month > 12 || isNaN(month)) return year;
  return months[month - 1] + ' ' + year;
}

function renderProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  const list = filteredProjects();
  grid.innerHTML = '';

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">🔎</div>
        <div class="empty-state__title">Nenhum projeto encontrado</div>
        <div class="empty-state__desc">Tente outros filtros ou termos de busca.</div>
      </div>
    `;
    return;
  }

  list.forEach(p => {
    const card = document.createElement('article');
    card.className = 'project-card';

    // Detecta automaticamente se imagem é URL (http/https ou caminho local) ou emoji
    const isUrl = p.imagem && (
      p.imagem.startsWith('http') ||
      p.imagem.startsWith('/') ||
      p.imagem.startsWith('./') ||
      p.imagem.startsWith('assets/')
    );
    const imgHtml = p.imagem
      ? isUrl
        ? `<div class="project-card__img project-card__img--photo">
             <img src="${p.imagem}" alt="${p.titulo}" loading="lazy" onerror="this.parentElement.innerHTML='📂'">
           </div>`
        : `<div class="project-card__img">${p.imagem}</div>`
      : '';

    const badgeHtml = p.destaque
      ? `<span class="badge-destaque">★ Destaque</span>`
      : '';

    const stackHtml = p.stack
      .map(s => `<span class="chip">${s}</span>`)
      .join('');

    const tagsHtml = p.tags
      .map(t => `<span class="tag">#${t}</span>`)
      .join('');

    const githubBtn = p.links.github
      ? `<a href="${p.links.github}" target="_blank" rel="noopener" class="btn btn--outline btn--sm btn--icon">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
             <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
           </svg>
           GitHub
         </a>`
      : '';

    const demoBtn = p.links.demo
      ? `<a href="${p.links.demo}" target="_blank" rel="noopener" class="btn btn--primary btn--sm btn--icon">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
             <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
           </svg>
           Demo
         </a>`
      : '';

    card.innerHTML = `
      ${imgHtml}
      <div class="project-card__body">
        <div class="project-card__header">
          <h3 class="project-card__title">${p.titulo}</h3>
          ${badgeHtml}
        </div>
        <p class="project-card__desc">${p.descricaoCurta}</p>
        <div class="project-card__date">${formatDate(p.data)}</div>
        <div class="project-card__chips chips">${stackHtml}</div>
        <div class="project-card__tags chips">${tagsHtml}</div>
        <div class="project-card__actions">
          ${githubBtn}
          ${demoBtn}
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

function renderFilterTags() {
  const container = document.getElementById('filter-tags');
  if (!container) return;

  const tags = getAllTags();
  container.innerHTML = tags.map(tag => `
    <button class="chip chip--interactive${activeFilters.has(tag) ? ' chip--active' : ''}" data-tag="${tag}">
      ${tag}
    </button>
  `).join('');

  container.querySelectorAll('.chip--interactive').forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.dataset.tag;
      if (activeFilters.has(tag)) {
        activeFilters.delete(tag);
        btn.classList.remove('chip--active');
      } else {
        activeFilters.add(tag);
        btn.classList.add('chip--active');
      }
      renderProjects();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderFilterTags();
  renderProjects();

  const searchInput = document.getElementById('project-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProjects();
    });
  }

  const sortSelect = document.getElementById('project-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortOrder = e.target.value;
      renderProjects();
    });
  }
});
