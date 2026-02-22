/* ============================================================
   projects.js — Carrega projetos do data.json (GitHub raw)
   ============================================================ */

var REPO_OWNER  = 'joaopedrolour3nc';
var REPO_NAME   = 'Portfolio-Jo-o-Pedro-Analista';
var DATA_FILE   = 'data.json';
var BRANCH      = 'main';
var RAW_BASE    = 'https://raw.githubusercontent.com/' + REPO_OWNER + '/' + REPO_NAME + '/' + BRANCH + '/';

var activeFilters = new Set();
var searchQuery   = '';
var sortOrder     = 'recente';
var ALL_PROJECTS  = [];

function formatProjectDate(data) {
  if (!data || !data.includes('-')) return data || '';
  var parts  = data.split('-');
  var months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  if (parts.length === 3) {
    // DD-MM-YYYY
    var m = parseInt(parts[1], 10);
    return parts[0] + ' ' + (months[m-1] || '') + ' ' + parts[2];
  }
  // MM-YYYY
  var m = parseInt(parts[0], 10);
  return (months[m-1] || '') + ' ' + parts[1];
}

function getAllTags() {
  var tags = new Set();
  ALL_PROJECTS.forEach(function(p) { p.tags.forEach(function(t) { tags.add(t); }); });
  return Array.from(tags).sort();
}

function filteredProjects() {
  var result = ALL_PROJECTS.slice();
  if (activeFilters.size > 0) {
    result = result.filter(function(p) {
      return p.tags.some(function(t) { return activeFilters.has(t); });
    });
  }
  if (searchQuery.trim()) {
    var q = searchQuery.toLowerCase();
    result = result.filter(function(p) {
      return p.titulo.toLowerCase().includes(q) ||
             p.descricaoCurta.toLowerCase().includes(q) ||
             p.stack.some(function(s) { return s.toLowerCase().includes(q); }) ||
             p.tags.some(function(t) { return t.toLowerCase().includes(q); });
    });
  }
  if (sortOrder === 'recente') {
    result.sort(function(a, b) { return b.data.localeCompare(a.data); });
  } else {
    result.sort(function(a, b) { return a.titulo.localeCompare(b.titulo); });
  }
  return result;
}

function renderProjects() {
  var grid = document.getElementById('projects-grid');
  if (!grid) return;
  var list = filteredProjects();
  grid.innerHTML = '';

  if (list.length === 0) {
    grid.innerHTML =
      '<div class="empty-state">' +
        '<div class="empty-state__icon">🔎</div>' +
        '<div class="empty-state__title">Nenhum projeto encontrado</div>' +
        '<div class="empty-state__desc">Tente outros filtros ou termos de busca.</div>' +
      '</div>';
    return;
  }

  list.forEach(function(p) {
    var card = document.createElement('article');
    card.className = 'project-card';

    var isUrl = p.imagem && (p.imagem.startsWith('http') || p.imagem.startsWith('/') || p.imagem.startsWith('./') || p.imagem.startsWith('assets/'));
    var imgHtml = p.imagem
      ? isUrl
        ? '<div class="project-card__img project-card__img--photo"><img src="' + p.imagem + '" alt="' + p.titulo + '" loading="lazy" onerror="this.parentElement.innerHTML=\'📂\'"></div>'
        : '<div class="project-card__img">' + p.imagem + '</div>'
      : '';

    var badgeHtml  = p.destaque ? '<span class="badge-destaque">★ Destaque</span>' : '';
    var stackHtml  = p.stack.map(function(s) { return '<span class="chip">' + s + '</span>'; }).join('');
    var tagsHtml   = p.tags.map(function(t)  { return '<span class="tag">#' + t + '</span>'; }).join('');

    var githubBtn = p.links && p.links.github
      ? '<a href="' + p.links.github + '" target="_blank" rel="noopener" class="btn btn--outline btn--sm btn--icon">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>' +
          'GitHub</a>'
      : '';

    var demoBtn = p.links && p.links.demo
      ? '<a href="' + p.links.demo + '" target="_blank" rel="noopener" class="btn btn--primary btn--sm btn--icon">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>' +
          'Demo</a>'
      : '';

    card.innerHTML =
      imgHtml +
      '<div class="project-card__body">' +
        '<div class="project-card__header"><h3 class="project-card__title">' + p.titulo + '</h3>' + badgeHtml + '</div>' +
        '<p class="project-card__desc">' + p.descricaoCurta + '</p>' +
        '<div class="project-card__date">' + formatProjectDate(p.data) + '</div>' +
        '<div class="project-card__chips chips">' + stackHtml + '</div>' +
        '<div class="project-card__tags chips">' + tagsHtml + '</div>' +
        '<div class="project-card__actions">' + githubBtn + demoBtn + '</div>' +
      '</div>';

    grid.appendChild(card);
  });
}

function renderFilterTags() {
  var container = document.getElementById('filter-tags');
  if (!container) return;
  var tags = getAllTags();
  container.innerHTML = tags.map(function(tag) {
    return '<button class="chip chip--interactive' + (activeFilters.has(tag) ? ' chip--active' : '') + '" data-tag="' + tag + '">' + tag + '</button>';
  }).join('');
  container.querySelectorAll('.chip--interactive').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var tag = btn.dataset.tag;
      if (activeFilters.has(tag)) { activeFilters.delete(tag); btn.classList.remove('chip--active'); }
      else                        { activeFilters.add(tag);    btn.classList.add('chip--active'); }
      renderProjects();
    });
  });
}

function showProjectsLoading(show) {
  var el = document.getElementById('projects-loading');
  if (el) el.style.display = show ? 'flex' : 'none';
  var grid = document.getElementById('projects-grid');
  if (grid) grid.style.display = show ? 'none' : 'grid';
}

document.addEventListener('DOMContentLoaded', function() {
  var grid = document.getElementById('projects-grid');
  if (!grid) return;

  showProjectsLoading(true);

  fetch(RAW_BASE + DATA_FILE + '?nocache=' + Date.now())
    .then(function(r) { return r.json(); })
    .then(function(data) {
      ALL_PROJECTS = data.projects || [];
      showProjectsLoading(false);
      renderFilterTags();
      renderProjects();
    })
    .catch(function() {
      showProjectsLoading(false);
      grid.innerHTML =
        '<div class="empty-state">' +
          '<div class="empty-state__icon">⚠️</div>' +
          '<div class="empty-state__title">Erro ao carregar projetos</div>' +
          '<div class="empty-state__desc">Tente recarregar a página.</div>' +
        '</div>';
    });

  var searchInput = document.getElementById('project-search');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) { searchQuery = e.target.value; renderProjects(); });
  }
  var sortSelect = document.getElementById('project-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', function(e) { sortOrder = e.target.value; renderProjects(); });
  }
});
