/* ============================================================
   main.js — Portfolio João Pedro
   - Animações: scroll fade, hover cards, theme transition, counters
   - Admin: publicar/gerenciar posts e projetos + editar conteúdo do site
   ============================================================ */

var ADMIN_PASS = '121246';
var API_URL    = '/api/db';
var _headerClickCount = 0;
var _headerClickTimer = null;
var _siteContent = {};

/* ============================================================
   UTILS
   ============================================================ */
function apiGet() {
  return fetch(API_URL + '?_=' + Date.now()).then(function(r) { return r.json(); });
}
function apiPost(type, item) {
  return fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: type, item: item })
  }).then(function(r) { return r.json(); });
}
function apiDelete(type, id) {
  return fetch(API_URL, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: type, id: id })
  }).then(function(r) { return r.json(); });
}
function saveContent(pairs) {
  return apiPost('content', pairs);
}

/* ============================================================
   ANIMAÇÕES — SCROLL FADE + SLIDE
   ============================================================ */
function initScrollAnimations() {
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  function observe() {
    document.querySelectorAll('.animate-on-scroll:not(.is-visible)').forEach(function(el) {
      observer.observe(el);
    });
  }
  observe();
  window._observeAnimations = observe;
}

/* ============================================================
   ANIMAÇÕES — CONTADOR
   ============================================================ */
function animateCounter(el) {
  var raw   = el.getAttribute('data-target') || el.textContent.trim();
  var prefix = raw.match(/^[^\d]*/)[0];
  var suffix = raw.match(/[^\d]*$/)[0];
  var num    = parseInt(raw.replace(/\D/g, ''), 10);
  if (isNaN(num)) return;
  var duration = 1400;
  var start    = null;
  el.textContent = prefix + '0' + suffix;
  function step(ts) {
    if (!start) start = ts;
    var progress = Math.min((ts - start) / duration, 1);
    var ease     = 1 - Math.pow(1 - progress, 3);
    el.textContent = prefix + Math.floor(ease * num) + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = prefix + num + suffix;
  }
  requestAnimationFrame(step);
}

function initCounters() {
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat__value[data-target]').forEach(function(el) {
    observer.observe(el);
  });
}

/* ============================================================
   TEMA
   ============================================================ */
function initTheme() {
  var saved = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  var btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.addEventListener('click', function() {
    var current = document.documentElement.getAttribute('data-theme');
    var next    = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
}

/* ============================================================
   CONTEÚDO DINÂMICO — aplica _siteContent na página
   ============================================================ */
function applyContent(c) {
  if (!c) return;
  _siteContent = c;

  function setText(sel, val) {
    if (!val) return;
    var el = document.querySelector(sel);
    if (el) el.innerHTML = val;
  }
  function setAttr(sel, attr, val) {
    if (!val) return;
    var el = document.querySelector(sel);
    if (el) el.setAttribute(attr, val);
  }

  // --- NAV ---
  var navLinks = document.querySelectorAll('.nav__link');
  var navKeys  = ['nav_home','nav_projetos','nav_blog','nav_contato'];
  navLinks.forEach(function(lnk, i) { if (navKeys[i] && c[navKeys[i]]) lnk.textContent = c[navKeys[i]]; });

  // --- HERO ---
  setText('.hero__eyebrow',  c.hero_eyebrow);
  setText('.hero__title',    c.hero_title);
  setText('.hero__subtitle', c.hero_subtitle);
  var heroBtns = document.querySelectorAll('.hero__actions .btn');
  if (heroBtns[0]) { heroBtns[0].textContent = c.hero_btn1_text || heroBtns[0].textContent; heroBtns[0].href = c.hero_btn1_link || heroBtns[0].href; }
  if (heroBtns[1]) { heroBtns[1].textContent = c.hero_btn2_text || heroBtns[1].textContent; heroBtns[1].href = c.hero_btn2_link || heroBtns[1].href; }

  // --- SOBRE ---
  setText('.sobre__label',  c.sobre_label);
  setText('.sobre__title',  c.sobre_title);
  var sobrePs = document.querySelectorAll('.sobre__text p');
  if (sobrePs[0] && c.sobre_p1) sobrePs[0].innerHTML = c.sobre_p1;
  if (sobrePs[1] && c.sobre_p2) sobrePs[1].innerHTML = c.sobre_p2;
  if (sobrePs[2] && c.sobre_p3) sobrePs[2].innerHTML = c.sobre_p3;

  // --- SKILLS chips ---
  setText('.skills__label', c.skills_label);
  setText('.skills__title', c.skills_title);
  setText('.skills__desc',  c.skills_desc);
  if (c.skills_list) {
    var skillsGrid = document.querySelector('.skills__chips');
    if (skillsGrid) {
      skillsGrid.innerHTML = c.skills_list.split(',').map(function(s) {
        return '<span class="chip">' + s.trim() + '</span>';
      }).join('');
    }
  }

  // --- HABILIDADES barras ---
  if (c.habilidades) {
    try {
      var habs = typeof c.habilidades === 'string' ? JSON.parse(c.habilidades) : c.habilidades;
      var habGrid = document.querySelector('.habilidades__list');
      if (habGrid) {
        habGrid.innerHTML = habs.map(function(h) {
          return '<div class="habilidade-item animate-on-scroll">' +
            '<div class="habilidade-item__header">' +
              '<span class="habilidade-item__nome">' + h.nome + '</span>' +
              '<span class="habilidade-item__pct">' + h.pct + '%</span>' +
            '</div>' +
            '<div class="habilidade-item__bar"><div class="habilidade-item__fill" style="width:' + h.pct + '%"></div></div>' +
          '</div>';
        }).join('');
        if (window._observeAnimations) window._observeAnimations();
      }
    } catch(e) {}
  }

  // --- MÉTRICAS ---
  setText('.metrics__label', c.metrics_label);
  setText('.metrics__title', c.metrics_title);
  var stats = document.querySelectorAll('.stat__value');
  var metricVals = [c.metric1_value, c.metric2_value, c.metric3_value];
  var metricLbls = [c.metric1_label, c.metric2_label, c.metric3_label];
  stats.forEach(function(el, i) {
    if (metricVals[i]) { el.setAttribute('data-target', metricVals[i]); el.textContent = metricVals[i]; }
  });
  document.querySelectorAll('.stat__label').forEach(function(el, i) {
    if (metricLbls[i]) el.textContent = metricLbls[i];
  });
  initCounters();

  // --- CONTATO ---
  setText('.contato__title', c.contato_title);
  setText('.contato__desc',  c.contato_desc);
  setText('.disponivel-badge', c.contato_disponivel);
  var emailEl = document.querySelector('a[href^="mailto"]');
  if (emailEl && c.contato_email) { emailEl.href = 'mailto:' + c.contato_email; emailEl.querySelector('.contact-card__value') && (emailEl.querySelector('.contact-card__value').textContent = c.contato_email); }
  var linkedinEl = document.querySelector('a[href*="linkedin"]');
  if (linkedinEl && c.contato_linkedin) linkedinEl.href = c.contato_linkedin;
  var githubEl = document.querySelector('a[href*="github.com"]:not(.btn)');
  if (githubEl && c.contato_github) githubEl.href = c.contato_github;
  setText('.contato__loc-title', c.contato_localizacao);
  setText('.contato__loc-sub',   c.contato_localizacao_sub);

  // --- BLOG ---
  setText('.blog-header .section__title', c.blog_title);
  setText('.blog-header .section__desc',  c.blog_desc);

  // --- PROJETOS ---
  setText('.projects-header .section__title', c.projetos_title);
  setText('.projects-header .section__desc',  c.projetos_desc);

  // --- FOOTER ---
  var footerLinks = document.querySelectorAll('.footer__social a');
  footerLinks.forEach(function(a) {
    if (a.href.includes('github') && c.footer_github) a.href = c.footer_github;
    if (a.href.includes('linkedin') && c.footer_linkedin) a.href = c.footer_linkedin;
  });
}

/* ============================================================
   BLOG — renderiza posts na index e na página de blog
   ============================================================ */
function renderBlogCards(posts) {
  var grid = document.getElementById('blog-grid');
  if (!grid) return;
  if (!posts || posts.length === 0) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-state__icon">✍️</div><div class="empty-state__title">Nenhum post ainda</div><div class="empty-state__desc">Em breve novos artigos por aqui.</div></div>';
    return;
  }
  grid.innerHTML = posts.map(function(p) {
    var tagsHtml = (p.tags || []).map(function(t) { return '<span class="tag">' + t + '</span>'; }).join('');
    var imgHtml  = p.image ? '<div class="post-card__img"><img src="' + p.image + '" alt="' + p.title + '" loading="lazy"></div>' : '';
    return '<article class="post-card animate-on-scroll">' + imgHtml +
      '<div class="post-card__body">' +
        '<div class="post-card__meta"><span class="post-card__date">' + (p.date || '') + '</span><span class="post-card__author">' + (p.author || '') + '</span></div>' +
        '<h3 class="post-card__title">' + p.title + '</h3>' +
        '<p class="post-card__excerpt">' + (p.content || '').replace(/<[^>]*>/g,'').substring(0,160) + '…</p>' +
        '<div class="post-card__tags">' + tagsHtml + '</div>' +
      '</div></article>';
  }).join('');
  if (window._observeAnimations) window._observeAnimations();
}

function renderFeaturedPosts(posts) {
  var grid = document.getElementById('featured-posts');
  if (!grid) return;
  var featured = (posts || []).slice(0, 3);
  if (!featured.length) { grid.innerHTML = ''; return; }
  grid.innerHTML = featured.map(function(p) {
    return '<article class="post-card post-card--sm animate-on-scroll">' +
      '<div class="post-card__body">' +
        '<div class="post-card__meta"><span class="post-card__date">' + (p.date || '') + '</span></div>' +
        '<h3 class="post-card__title">' + p.title + '</h3>' +
      '</div></article>';
  }).join('');
  if (window._observeAnimations) window._observeAnimations();
}

function renderFeaturedProjects(projects) {
  var grid = document.getElementById('featured-projects');
  if (!grid) return;
  var featured = (projects || []).filter(function(p) { return p.destaque; }).slice(0,3);
  if (!featured.length) featured = (projects || []).slice(0,3);
  if (!featured.length) { grid.innerHTML = ''; return; }
  grid.innerHTML = featured.map(function(p) {
    var isUrl = p.imagem && (p.imagem.startsWith('http') || p.imagem.startsWith('/') || p.imagem.startsWith('./') || p.imagem.startsWith('assets/'));
    var imgHtml = p.imagem
      ? isUrl ? '<div class="project-card__img project-card__img--photo"><img src="' + p.imagem + '" alt="' + p.titulo + '" loading="lazy"></div>'
               : '<div class="project-card__img">' + p.imagem + '</div>'
      : '';
    var stackHtml = (p.stack||[]).map(function(s){return '<span class="chip">'+s+'</span>';}).join('');
    var githubBtn = p.links && p.links.github ? '<a href="'+p.links.github+'" target="_blank" class="btn btn--outline btn--sm">GitHub</a>' : '';
    var demoBtn   = p.links && p.links.demo   ? '<a href="'+p.links.demo+'" target="_blank" class="btn btn--primary btn--sm">Demo</a>' : '';
    return '<article class="project-card animate-on-scroll">' + imgHtml +
      '<div class="project-card__body">' +
        '<h3 class="project-card__title">' + p.titulo + '</h3>' +
        '<p class="project-card__desc">' + (p.descricaoCurta||'') + '</p>' +
        '<div class="project-card__chips chips">' + stackHtml + '</div>' +
        '<div class="project-card__actions">' + githubBtn + demoBtn + '</div>' +
      '</div></article>';
  }).join('');
  if (window._observeAnimations) window._observeAnimations();
}

/* ============================================================
   ADMIN MODAL — LÓGICA
   ============================================================ */
function adminOpen()  { var m = document.getElementById('admin-modal'); if (m) { m.classList.add('is-open'); } }
function adminClose() { var m = document.getElementById('admin-modal'); if (m) { m.classList.remove('is-open'); showAdminView('login'); } }
function showAdminView(view) {
  document.querySelectorAll('.admin-view').forEach(function(v) { v.style.display = 'none'; });
  var el = document.getElementById('admin-view-' + view);
  if (el) el.style.display = 'flex';
}

function adminLogin() {
  var pw = document.getElementById('admin-password');
  var err = document.getElementById('admin-login-error');
  if (!pw) return;
  if (pw.value === ADMIN_PASS) {
    showAdminView('panel');
    loadAdminData();
  } else {
    if (err) { err.textContent = 'Senha incorreta.'; err.style.display = 'block'; }
    pw.value = '';
  }
}

function switchAdminTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.admin-tab-content').forEach(function(c) { c.style.display = 'none'; });
  var btn = document.querySelector('.admin-tab[data-tab="' + tab + '"]');
  var content = document.getElementById('admin-tab-' + tab);
  if (btn) btn.classList.add('active');
  if (content) content.style.display = 'block';
}

function switchPublicarDest(dest) {
  document.querySelectorAll('.dest-tab').forEach(function(t) { t.classList.remove('active'); });
  var btn = document.querySelector('.dest-tab[data-dest="' + dest + '"]');
  if (btn) btn.classList.add('active');
  var projFields = document.getElementById('proj-fields');
  if (projFields) projFields.style.display = (dest === 'post') ? 'none' : 'block';
}

function setAdminStatus(id, msg, type) {
  var el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = 'admin-status admin-status--' + (type || 'info');
  el.style.display = msg ? 'block' : 'none';
}

/* ---- PUBLICAR ---- */
function handlePublicar() {
  var destBtn = document.querySelector('.dest-tab.active');
  var dest    = destBtn ? destBtn.dataset.dest : 'post';

  if (dest === 'post' || dest === 'ambos') {
    var title   = document.getElementById('pub-title')   ? document.getElementById('pub-title').value.trim() : '';
    var content = document.getElementById('pub-content') ? document.getElementById('pub-content').value.trim() : '';
    var author  = document.getElementById('pub-author')  ? document.getElementById('pub-author').value.trim() : 'João Pedro';
    var date    = document.getElementById('pub-date')    ? document.getElementById('pub-date').value : '';
    var tags    = document.getElementById('pub-tags')    ? document.getElementById('pub-tags').value.split(',').map(function(t){return t.trim();}).filter(Boolean) : [];
    var image   = document.getElementById('pub-image-b64') ? document.getElementById('pub-image-b64').value : '';
    if (!title || !content) { setAdminStatus('pub-status', 'Preencha título e conteúdo.', 'error'); return; }
    var post = { id: Date.now(), title: title, content: content, author: author, date: date, tags: tags, image: image };
    setAdminStatus('pub-status', 'Salvando…', 'info');
    apiPost('post', post).then(function(r) {
      if (r.ok) { setAdminStatus('pub-status', 'Post publicado!', 'success'); clearPublicarForm(); loadAdminData(); }
      else { setAdminStatus('pub-status', 'Erro: ' + (r.error||'desconhecido'), 'error'); }
    }).catch(function(e) { setAdminStatus('pub-status', 'Erro de rede.', 'error'); });
  }

  if (dest === 'projeto' || dest === 'ambos') {
    var titulo  = document.getElementById('pub-proj-titulo') ? document.getElementById('pub-proj-titulo').value.trim() : '';
    var desc    = document.getElementById('pub-proj-desc')   ? document.getElementById('pub-proj-desc').value.trim() : '';
    var stack   = document.getElementById('pub-proj-stack')  ? document.getElementById('pub-proj-stack').value.split(',').map(function(t){return t.trim();}).filter(Boolean) : [];
    var pdata   = document.getElementById('pub-proj-data')   ? document.getElementById('pub-proj-data').value : '';
    var github  = document.getElementById('pub-proj-github') ? document.getElementById('pub-proj-github').value.trim() : '';
    var demo    = document.getElementById('pub-proj-demo')   ? document.getElementById('pub-proj-demo').value.trim() : '';
    var ptags   = document.getElementById('pub-proj-tags')   ? document.getElementById('pub-proj-tags').value.split(',').map(function(t){return t.trim();}).filter(Boolean) : [];
    var pimage  = document.getElementById('pub-proj-image-b64') ? document.getElementById('pub-proj-image-b64').value : '';
    var destaque = document.getElementById('pub-proj-destaque') ? document.getElementById('pub-proj-destaque').checked : false;
    if (!titulo) { setAdminStatus('pub-status', 'Preencha o título do projeto.', 'error'); return; }
    var project = { id: Date.now(), titulo: titulo, descricaoCurta: desc, stack: stack, data: pdata, links: { github: github, demo: demo }, imagem: pimage, tags: ptags, destaque: destaque };
    setAdminStatus('pub-status', 'Salvando…', 'info');
    apiPost('project', project).then(function(r) {
      if (r.ok) { setAdminStatus('pub-status', 'Projeto publicado!', 'success'); clearPublicarForm(); loadAdminData(); }
      else { setAdminStatus('pub-status', 'Erro: ' + (r.error||'desconhecido'), 'error'); }
    }).catch(function(e) { setAdminStatus('pub-status', 'Erro de rede.', 'error'); });
  }
}

function clearPublicarForm() {
  ['pub-title','pub-content','pub-author','pub-date','pub-tags','pub-image-b64',
   'pub-proj-titulo','pub-proj-desc','pub-proj-stack','pub-proj-data','pub-proj-github','pub-proj-demo','pub-proj-tags','pub-proj-image-b64'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) { if (el.type === 'checkbox') el.checked = false; else el.value = ''; }
  });
  ['pub-image-preview','pub-proj-image-preview'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.src = '';
  });
}

/* ---- GERENCIAR ---- */
function switchGerenciarTab(tab) {
  document.querySelectorAll('.ger-tab').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.ger-tab-content').forEach(function(c) { c.style.display = 'none'; });
  var btn = document.querySelector('.ger-tab[data-ger="' + tab + '"]');
  var content = document.getElementById('ger-tab-' + tab);
  if (btn) btn.classList.add('active');
  if (content) content.style.display = 'block';
}

function loadAdminData() {
  apiGet().then(function(data) {
    renderGerenciarPosts(data.posts || []);
    renderGerenciarProjects(data.projects || []);
    _siteContent = data.content || {};
    loadContentEditor(_siteContent);
  });
}

function renderGerenciarPosts(posts) {
  var list = document.getElementById('ger-posts-list');
  if (!list) return;
  if (!posts.length) { list.innerHTML = '<div class="ger-empty">Nenhum post cadastrado.</div>'; return; }
  list.innerHTML = posts.map(function(p) {
    return '<div class="ger-item">' +
      '<div class="ger-item__info"><strong>' + p.title + '</strong><span>' + (p.date||'') + ' · ' + (p.author||'') + '</span></div>' +
      '<button class="btn btn--danger btn--sm" onclick="deleteItem(\'post\',' + p.id + ')">Excluir</button>' +
    '</div>';
  }).join('');
}

function renderGerenciarProjects(projects) {
  var list = document.getElementById('ger-projects-list');
  if (!list) return;
  if (!projects.length) { list.innerHTML = '<div class="ger-empty">Nenhum projeto cadastrado.</div>'; return; }
  list.innerHTML = projects.map(function(p) {
    return '<div class="ger-item">' +
      '<div class="ger-item__info"><strong>' + p.titulo + '</strong><span>' + (p.data||'') + (p.destaque?' · ★ Destaque':'') + '</span></div>' +
      '<button class="btn btn--danger btn--sm" onclick="deleteItem(\'project\',' + p.id + ')">Excluir</button>' +
    '</div>';
  }).join('');
}

function deleteItem(type, id) {
  if (!confirm('Confirmar exclusão?')) return;
  apiDelete(type, id).then(function(r) {
    if (r.ok) { loadAdminData(); setAdminStatus('ger-status', 'Item excluído.', 'success'); }
    else { setAdminStatus('ger-status', 'Erro ao excluir.', 'error'); }
  });
}

/* ---- EDITAR CONTEÚDO DO SITE ---- */
var CONTENT_FIELDS = [
  { group: '🌐 Navegação', fields: [
    { key: 'nav_home',     label: 'Link Home' },
    { key: 'nav_projetos', label: 'Link Projetos' },
    { key: 'nav_blog',     label: 'Link Blog' },
    { key: 'nav_contato',  label: 'Link Contato' },
  ]},
  { group: '🦸 Hero', fields: [
    { key: 'hero_eyebrow',   label: 'Eyebrow (ex: Analista de Dados)' },
    { key: 'hero_title',     label: 'Título (HTML permitido)', type: 'textarea' },
    { key: 'hero_subtitle',  label: 'Subtítulo', type: 'textarea' },
    { key: 'hero_btn1_text', label: 'Botão 1 — Texto' },
    { key: 'hero_btn1_link', label: 'Botão 1 — Link' },
    { key: 'hero_btn2_text', label: 'Botão 2 — Texto' },
    { key: 'hero_btn2_link', label: 'Botão 2 — Link' },
  ]},
  { group: '👤 Sobre Mim', fields: [
    { key: 'sobre_label', label: 'Label (ex: // sobre mim)' },
    { key: 'sobre_title', label: 'Título' },
    { key: 'sobre_p1',    label: 'Parágrafo 1', type: 'textarea' },
    { key: 'sobre_p2',    label: 'Parágrafo 2 (HTML permitido)', type: 'textarea' },
    { key: 'sobre_p3',    label: 'Parágrafo 3', type: 'textarea' },
  ]},
  { group: '🛠 Skills', fields: [
    { key: 'skills_label', label: 'Label (ex: // stack)' },
    { key: 'skills_title', label: 'Título' },
    { key: 'skills_desc',  label: 'Descrição' },
    { key: 'skills_list',  label: 'Skills (separadas por vírgula)' },
  ]},
  { group: '📊 Habilidades (barras)', fields: [
    { key: 'habilidades', label: 'JSON das barras (nome + pct)', type: 'textarea', placeholder: '[{"nome":"SQL","pct":92},{"nome":"Power BI","pct":88}]' },
  ]},
  { group: '🔢 Métricas', fields: [
    { key: 'metrics_label',  label: 'Label' },
    { key: 'metrics_title',  label: 'Título' },
    { key: 'metric1_value',  label: 'Métrica 1 — Valor (ex: +20)' },
    { key: 'metric1_label',  label: 'Métrica 1 — Legenda' },
    { key: 'metric2_value',  label: 'Métrica 2 — Valor' },
    { key: 'metric2_label',  label: 'Métrica 2 — Legenda' },
    { key: 'metric3_value',  label: 'Métrica 3 — Valor' },
    { key: 'metric3_label',  label: 'Métrica 3 — Legenda' },
  ]},
  { group: '📝 Blog', fields: [
    { key: 'blog_title', label: 'Título da seção' },
    { key: 'blog_desc',  label: 'Descrição', type: 'textarea' },
  ]},
  { group: '🚀 Projetos', fields: [
    { key: 'projetos_title', label: 'Título da seção' },
    { key: 'projetos_desc',  label: 'Descrição', type: 'textarea' },
  ]},
  { group: '📬 Contato', fields: [
    { key: 'contato_title',         label: 'Título' },
    { key: 'contato_desc',          label: 'Descrição', type: 'textarea' },
    { key: 'contato_disponivel',    label: 'Badge disponibilidade' },
    { key: 'contato_email',         label: 'E-mail' },
    { key: 'contato_linkedin',      label: 'LinkedIn URL' },
    { key: 'contato_github',        label: 'GitHub URL' },
    { key: 'contato_localizacao',   label: 'Localização' },
    { key: 'contato_localizacao_sub', label: 'Localização subtítulo' },
  ]},
  { group: '🔗 Footer / Redes Sociais', fields: [
    { key: 'footer_github',   label: 'GitHub URL' },
    { key: 'footer_linkedin', label: 'LinkedIn URL' },
  ]},
];

function loadContentEditor(c) {
  var container = document.getElementById('content-editor');
  if (!container) return;

  container.innerHTML = CONTENT_FIELDS.map(function(group) {
    var fieldsHtml = group.fields.map(function(f) {
      var val = (c[f.key] || '').replace(/"/g, '&quot;');
      var input = f.type === 'textarea'
        ? '<textarea id="ce-' + f.key + '" class="admin-input admin-textarea" placeholder="' + (f.placeholder||'') + '">' + (c[f.key]||'') + '</textarea>'
        : '<input id="ce-' + f.key + '" type="text" class="admin-input" value="' + val + '">';
      return '<div class="admin-field"><label class="admin-label">' + f.label + '</label>' + input + '</div>';
    }).join('');
    return '<div class="content-group"><div class="content-group__title">' + group.group + '</div>' + fieldsHtml + '</div>';
  }).join('');
}

function saveAllContent() {
  var pairs = [];
  CONTENT_FIELDS.forEach(function(group) {
    group.fields.forEach(function(f) {
      var el = document.getElementById('ce-' + f.key);
      if (el) pairs.push({ key: f.key, value: el.value });
    });
  });
  setAdminStatus('content-status', 'Salvando…', 'info');
  saveContent(pairs).then(function(r) {
    if (r.ok) {
      setAdminStatus('content-status', 'Salvo com sucesso! Recarregue a página para ver.', 'success');
      var c = {};
      pairs.forEach(function(p) { c[p.key] = p.value; });
      applyContent(c);
    } else {
      setAdminStatus('content-status', 'Erro ao salvar.', 'error');
    }
  }).catch(function() { setAdminStatus('content-status', 'Erro de rede.', 'error'); });
}

/* ---- UPLOAD IMAGEM ---- */
function setupImageUpload(inputId, b64Id, previewId) {
  var input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('change', function() {
    var file = input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        var canvas = document.createElement('canvas');
        var MAX = 800;
        var w = img.width, h = img.height;
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        var b64 = canvas.toDataURL('image/jpeg', 0.78);
        var b64El = document.getElementById(b64Id);
        var prevEl = document.getElementById(previewId);
        if (b64El) b64El.value = b64;
        if (prevEl) { prevEl.src = b64; prevEl.style.display = 'block'; }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ============================================================
   HEADER CLICK — abre admin com 5 cliques
   ============================================================ */
function initHeaderClick() {
  var nameEl = document.querySelector('.nav__brand') || document.querySelector('.hero__name') || document.querySelector('header h1, header .brand, .site-name');
  if (!nameEl) return;
  nameEl.addEventListener('click', function() {
    _headerClickCount++;
    clearTimeout(_headerClickTimer);
    _headerClickTimer = setTimeout(function() { _headerClickCount = 0; }, 2000);
    if (_headerClickCount >= 5) {
      _headerClickCount = 0;
      var modal = document.getElementById('admin-modal');
      if (modal && modal.classList.contains('is-open')) adminClose();
      else adminOpen();
    }
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  initScrollAnimations();
  initHeaderClick();

  // Setup image uploads
  setupImageUpload('pub-image-input',      'pub-image-b64',      'pub-image-preview');
  setupImageUpload('pub-proj-image-input', 'pub-proj-image-b64', 'pub-proj-image-preview');

  // Admin modal event delegation
  document.addEventListener('click', function(e) {
    var t = e.target;
    if (t.closest('#admin-modal .modal__overlay')) adminClose();
    if (t.id === 'admin-login-btn')   adminLogin();
    if (t.id === 'admin-logout-btn')  adminClose();
    if (t.classList.contains('admin-tab'))  switchAdminTab(t.dataset.tab);
    if (t.classList.contains('dest-tab'))   switchPublicarDest(t.dataset.dest);
    if (t.classList.contains('ger-tab'))    switchGerenciarTab(t.dataset.ger);
    if (t.id === 'pub-submit-btn')    handlePublicar();
    if (t.id === 'content-save-btn')  saveAllContent();
  });

  // Enter no campo de senha
  var pw = document.getElementById('admin-password');
  if (pw) pw.addEventListener('keydown', function(e) { if (e.key === 'Enter') adminLogin(); });

  // Carregar dados da API
  apiGet().then(function(data) {
    _siteContent = data.content || {};
    applyContent(_siteContent);
    renderBlogCards(data.posts || []);
    renderFeaturedPosts(data.posts || []);
    renderFeaturedProjects(data.projects || []);
  }).catch(function(err) { console.warn('API error:', err); });
});
