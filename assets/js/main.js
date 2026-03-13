/* ============================================================
   main.js — Portfolio João Pedro
   ============================================================ */

/* --- Tema (executa antes do render para evitar flash) --- */
(function () {
  var t = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', t);
})();

/* ============================================================
   GLOBALS
   ============================================================ */
var ADMIN_PASS = '121246';
var API_URL    = '/api/db';

function gel(id) { return document.getElementById(id); }
function gval(id) { var e = gel(id); return e ? e.value.trim() : ''; }

function setAdminStatus(id, msg, type) {
  var e = gel(id);
  if (!e) return;
  if (!msg) { e.style.display = 'none'; return; }
  e.style.display = 'block';
  e.className = 'admin-status admin-status--' + (type || 'info');
  e.textContent = msg;
}

/* ============================================================
   API
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

/* ============================================================
   ANIMAÇÕES — SCROLL FADE + SLIDE
   ============================================================ */
function initScrollAnimations() {
  if (!window.IntersectionObserver) return;
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -30px 0px' });

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
  var raw    = el.getAttribute('data-target') || el.textContent.trim();
  var prefix = raw.match(/^[^\d]*/)[0];
  var suffix = raw.match(/[^\d]*$/)[0];
  var num    = parseInt(raw.replace(/\D/g, ''), 10);
  if (isNaN(num)) return;
  var duration = 1400, start = null;
  el.textContent = prefix + '0' + suffix;
  function step(ts) {
    if (!start) start = ts;
    var p = Math.min((ts - start) / duration, 1);
    el.textContent = prefix + Math.floor((1 - Math.pow(1 - p, 3)) * num) + suffix;
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = prefix + num + suffix;
  }
  requestAnimationFrame(step);
}

function initCounters() {
  if (!window.IntersectionObserver) return;
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) { animateCounter(entry.target); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat__value[data-target]').forEach(function(el) { obs.observe(el); });
}

/* ============================================================
   TEMA
   ============================================================ */
function updateToggleIcon(theme) {
  document.querySelectorAll('.theme-toggle__knob').forEach(function(k) {
    k.textContent = theme === 'dark' ? '🌙' : '☀️';
  });
}

/* ============================================================
   CONTEÚDO DINÂMICO
   ============================================================ */
function applyContent(c) {
  if (!c) return;
  function setText(sel, val) {
    if (!val) return;
    document.querySelectorAll(sel).forEach(function(el) { el.innerHTML = val; });
  }
  var navLinks = document.querySelectorAll('.nav__link');
  ['nav_home','nav_projetos','nav_blog','nav_contato'].forEach(function(k,i) {
    if (navLinks[i] && c[k]) navLinks[i].textContent = c[k];
  });
  setText('.hero__eyebrow', c.hero_eyebrow);
  setText('.hero__title',   c.hero_title);
  setText('.hero__subtitle',c.hero_subtitle);
  var hb = document.querySelectorAll('.hero__actions .btn');
  if (hb[0]) { if(c.hero_btn1_text) hb[0].textContent=c.hero_btn1_text; if(c.hero_btn1_link) hb[0].href=c.hero_btn1_link; }
  if (hb[1]) { if(c.hero_btn2_text) hb[1].textContent=c.hero_btn2_text; if(c.hero_btn2_link) hb[1].href=c.hero_btn2_link; }
  setText('.sobre__label', c.sobre_label); setText('.sobre__title', c.sobre_title);
  var sp = document.querySelectorAll('.sobre__text p');
  if(sp[0]&&c.sobre_p1) sp[0].innerHTML=c.sobre_p1;
  if(sp[1]&&c.sobre_p2) sp[1].innerHTML=c.sobre_p2;
  if(sp[2]&&c.sobre_p3) sp[2].innerHTML=c.sobre_p3;
  setText('.skills__label', c.skills_label); setText('.skills__title', c.skills_title); setText('.skills__desc', c.skills_desc);
  if (c.skills_list) { var sc=document.querySelector('.skills__chips'); if(sc) sc.innerHTML=c.skills_list.split(',').map(function(s){return '<span class="chip">'+s.trim()+'</span>';}).join(''); }
  if (c.habilidades) {
    try {
      var habs = typeof c.habilidades==='string' ? JSON.parse(c.habilidades) : c.habilidades;
      var hl = document.querySelector('.habilidades__list');
      if (hl) { hl.innerHTML=habs.map(function(h){return '<div class="habilidade-item animate-on-scroll"><div class="habilidade-item__header"><span class="habilidade-item__nome">'+h.nome+'</span><span class="habilidade-item__pct">'+h.pct+'%</span></div><div class="habilidade-item__bar"><div class="habilidade-item__fill" style="width:'+h.pct+'%"></div></div></div>';}).join(''); if(window._observeAnimations) window._observeAnimations(); }
    } catch(e) {}
  }
  setText('.metrics__label', c.metrics_label); setText('.metrics__title', c.metrics_title);
  var sv=document.querySelectorAll('.stat__value'), sl=document.querySelectorAll('.stat__label');
  [c.metric1_value,c.metric2_value,c.metric3_value].forEach(function(v,i){ if(sv[i]&&v){sv[i].setAttribute('data-target',v);sv[i].textContent=v;} });
  [c.metric1_label,c.metric2_label,c.metric3_label].forEach(function(v,i){ if(sl[i]&&v) sl[i].textContent=v; });
  initCounters();
  setText('.contato__title', c.contato_title); setText('.contato__desc', c.contato_desc);
  setText('.disponivel-badge', c.contato_disponivel);
  if(c.contato_email){var ea=document.querySelector('a[href^="mailto"]');if(ea){ea.href='mailto:'+c.contato_email;var cv=ea.querySelector('.contact-card__value');if(cv)cv.textContent=c.contato_email;}}
  if(c.contato_linkedin){var la=document.querySelector('a[href*="linkedin"]');if(la)la.href=c.contato_linkedin;}
  if(c.contato_github) document.querySelectorAll('a[href*="github.com"]').forEach(function(a){if(!a.classList.contains('btn'))a.href=c.contato_github;});
  setText('.contato__loc-title', c.contato_localizacao); setText('.contato__loc-sub', c.contato_localizacao_sub);
  setText('.blog-header .section__title', c.blog_title); setText('.blog-header .section__desc', c.blog_desc);
  setText('.projects-header .section__title', c.projetos_title); setText('.projects-header .section__desc', c.projetos_desc);
  if(c.footer_github)   document.querySelectorAll('.footer__social a[href*="github"]').forEach(function(a){a.href=c.footer_github;});
  if(c.footer_linkedin) document.querySelectorAll('.footer__social a[href*="linkedin"]').forEach(function(a){a.href=c.footer_linkedin;});
}

/* ============================================================
   RENDERIZAR POSTS / PROJETOS
   ============================================================ */
function renderBlogCards(posts) {
  var grid = gel('blog-grid'); if (!grid) return;
  if (!posts||!posts.length) { grid.innerHTML='<div class="empty-state"><div class="empty-state__icon">✍️</div><div class="empty-state__title">Nenhum post ainda</div></div>'; return; }
  grid.innerHTML = posts.map(function(p){
    var tags=(p.tags||[]).map(function(t){return '<span class="tag">'+t+'</span>';}).join('');
    var img=p.image?'<div class="post-card__img"><img src="'+p.image+'" alt="'+p.title+'" loading="lazy"></div>':'';
    return '<article class="post-card animate-on-scroll">'+img+'<div class="post-card__body"><div class="post-card__meta"><span class="post-card__date">'+(p.date||'')+'</span><span class="post-card__author">'+(p.author||'')+'</span></div><h3 class="post-card__title">'+p.title+'</h3><p class="post-card__excerpt">'+((p.content||'').replace(/<[^>]*>/g,'').substring(0,160))+'…</p><div class="post-card__tags">'+tags+'</div></div></article>';
  }).join('');
  if(window._observeAnimations) window._observeAnimations();
}
function renderFeaturedPosts(posts) {
  var grid=gel('featured-posts'); if(!grid) return;
  grid.innerHTML=(posts||[]).slice(0,3).map(function(p){return '<article class="post-card post-card--sm animate-on-scroll"><div class="post-card__body"><div class="post-card__meta"><span class="post-card__date">'+(p.date||'')+'</span></div><h3 class="post-card__title">'+p.title+'</h3></div></article>';}).join('');
  if(window._observeAnimations) window._observeAnimations();
}
function renderFeaturedProjects(projects) {
  var grid=gel('featured-projects'); if(!grid) return;
  var items=(projects||[]).filter(function(p){return p.destaque;}).slice(0,3);
  if(!items.length) items=(projects||[]).slice(0,3);
  grid.innerHTML=items.map(function(p){
    var stack=(p.stack||[]).map(function(s){return '<span class="chip">'+s+'</span>';}).join('');
    var gh=p.links&&p.links.github?'<a href="'+p.links.github+'" target="_blank" class="btn btn--outline btn--sm">GitHub</a>':'';
    var demo=p.links&&p.links.demo?'<a href="'+p.links.demo+'" target="_blank" class="btn btn--primary btn--sm">Demo</a>':'';
    return '<article class="project-card animate-on-scroll"><div class="project-card__body"><h3 class="project-card__title">'+p.titulo+'</h3><p class="project-card__desc">'+(p.descricaoCurta||'')+'</p><div class="project-card__chips chips">'+stack+'</div><div class="project-card__actions">'+gh+demo+'</div></div></article>';
  }).join('');
  if(window._observeAnimations) window._observeAnimations();
}

/* ============================================================
   ADMIN — MODAL (IDs: admin-modal, admin-view-login, admin-view-panel)
   ============================================================ */
function openModal() {
  var m = gel('admin-modal'); if (!m) return;
  m.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  showAdminView('login');
  setTimeout(function(){ var el=gel('admin-password'); if(el) el.focus(); }, 80);
}
function closeModal() {
  var m = gel('admin-modal'); if (!m) return;
  m.classList.remove('is-open');
  document.body.style.overflow = '';
  showAdminView('login');
  var inp = gel('admin-password'); if(inp){ inp.value=''; inp.classList.remove('error'); }
}
function showAdminView(view) {
  var lv=gel('admin-view-login'), pv=gel('admin-view-panel');
  if(lv) lv.style.display = view==='login' ? 'flex' : 'none';
  if(pv) pv.style.display = view==='panel' ? 'flex' : 'none';
}

/* LOGIN */
function doLogin() {
  var inp = gel('admin-password'); if(!inp) return;
  var err = gel('admin-login-error');
  if (inp.value === ADMIN_PASS) {
    if(err) err.style.display='none';
    showAdminView('panel');
    switchAdminTab('publicar');
    loadAdminData();
  } else {
    if(err){ err.textContent='Senha incorreta.'; err.style.display='block'; }
    inp.value=''; inp.focus();
  }
}

/* TABS (data-tab="publicar|gerenciar|pagina" → id="admin-tab-publicar|gerenciar|pagina") */
function switchAdminTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(function(t){ t.classList.remove('active'); });
  document.querySelectorAll('.admin-tab-content').forEach(function(c){ c.style.display='none'; });
  var btn = document.querySelector('.admin-tab[data-tab="'+tab+'"]');
  var panel = gel('admin-tab-'+tab);
  if(btn) btn.classList.add('active');
  if(panel) panel.style.display='block';
  if(tab==='gerenciar') loadAdminData();
  if(tab==='pagina') loadContentEditor(window._siteContent||{});
}

/* DEST TABS (data-dest="post|projeto|ambos") */
var _currentDest = 'post';
function switchDest(dest) {
  _currentDest = dest;
  var projFields = gel('proj-fields');
  if(projFields) projFields.style.display = (dest==='projeto'||dest==='ambos') ? 'block' : 'none';
}

/* PUBLICAR */
function handlePublicar() {
  var title  = gval('pub-title');
  var content= gval('pub-content');
  var author = gval('pub-author') || 'João Pedro';
  var tags   = gval('pub-tags').split(',').map(function(t){return t.trim();}).filter(Boolean);
  var date   = gval('pub-date') || new Date().toISOString().split('T')[0];
  var image  = gel('pub-image-b64') ? gel('pub-image-b64').value : '';

  if (!title) { setAdminStatus('pub-status','Preencha o título.','error'); return; }

  var btn = gel('pub-submit-btn');
  if(btn){ btn.disabled=true; btn.textContent='Publicando...'; }
  setAdminStatus('pub-status','🔄 Salvando…','info');

  var promises = [];

  if (_currentDest==='post'||_currentDest==='ambos') {
    if (!content) { setAdminStatus('pub-status','Escreva o conteúdo.','error'); if(btn){btn.disabled=false;btn.textContent='Publicar →';} return; }
    promises.push(apiPost('post',{id:Date.now(),title:title,content:content,author:author,date:date,tags:tags,image:image||null}));
  }

  if (_currentDest==='projeto'||_currentDest==='ambos') {
    var titulo = gval('pub-proj-titulo') || title;
    var desc   = gval('pub-proj-desc');
    promises.push(apiPost('project',{
      id:Date.now()+1, titulo:titulo, descricaoCurta:desc,
      stack:gval('pub-proj-stack').split(',').map(function(s){return s.trim();}).filter(Boolean),
      data:gval('pub-proj-data'),
      links:{github:gval('pub-proj-github')||null, demo:gval('pub-proj-demo')||null},
      imagem:(gel('pub-proj-image-b64')?gel('pub-proj-image-b64').value:'')||null,
      tags:gval('pub-proj-tags').split(',').map(function(t){return t.trim();}).filter(Boolean),
      destaque:gel('pub-proj-destaque')?gel('pub-proj-destaque').checked:false
    }));
  }

  Promise.all(promises)
    .then(function(){ setAdminStatus('pub-status','✅ Publicado com sucesso!','success'); clearPubForm(); })
    .catch(function(e){ setAdminStatus('pub-status','❌ Erro: '+(e.message||''),'error'); })
    .finally(function(){ if(btn){btn.disabled=false;btn.textContent='Publicar →';} });
}

function clearPubForm() {
  ['pub-title','pub-content','pub-author','pub-date','pub-tags',
   'pub-proj-titulo','pub-proj-desc','pub-proj-stack','pub-proj-data',
   'pub-proj-github','pub-proj-demo','pub-proj-tags'].forEach(function(id){
    var el=gel(id); if(el) el.value='';
  });
  var au=gel('pub-author'); if(au) au.value='João Pedro';
  var dc=gel('pub-proj-destaque'); if(dc) dc.checked=false;
  var b64=gel('pub-image-b64'); if(b64) b64.value='';
  var prev=gel('pub-image-preview'); if(prev){prev.src='';prev.style.display='none';}
  var b642=gel('pub-proj-image-b64'); if(b642) b642.value='';
  var prev2=gel('pub-proj-image-preview'); if(prev2){prev2.src='';prev2.style.display='none';}
}

/* GERENCIAR */
var _gerTab = 'posts';
function loadAdminData() {
  apiGet().then(function(data){
    window._siteContent = data.content||{};
    var pl=gel('ger-posts-list'), prl=gel('ger-projects-list');
    var posts = data.posts||[], projects = data.projects||[];
    if(pl) {
      if(!posts.length){ pl.innerHTML='<div class="ger-empty">Nenhum post.</div>'; }
      else pl.innerHTML=posts.map(function(p){
        return '<div class="ger-item"><div class="ger-item__info"><strong>'+p.title+'</strong><span>'+(p.date||'')+'</span></div>'+
          '<button class="btn btn--outline btn--sm" style="color:var(--error,#e55);border-color:var(--error,#e55);flex-shrink:0;" onclick="doDelete(\'post\','+p.id+')">Excluir</button></div>';
      }).join('');
    }
    if(prl) {
      if(!projects.length){ prl.innerHTML='<div class="ger-empty">Nenhum projeto.</div>'; }
      else prl.innerHTML=projects.map(function(p){
        return '<div class="ger-item"><div class="ger-item__info"><strong>'+p.titulo+'</strong><span>'+(p.data||'')+'</span></div>'+
          '<button class="btn btn--outline btn--sm" style="color:var(--error,#e55);border-color:var(--error,#e55);flex-shrink:0;" onclick="doDelete(\'project\','+p.id+')">Excluir</button></div>';
      }).join('');
    }
  });
}

function switchGerTab(tab) {
  _gerTab = tab;
  document.querySelectorAll('.ger-tab').forEach(function(t){ t.classList.remove('active'); });
  document.querySelectorAll('.ger-tab-content').forEach(function(c){ c.style.display='none'; });
  var btn=document.querySelector('.ger-tab[data-ger="'+tab+'"]');
  var panel=gel('ger-tab-'+tab);
  if(btn) btn.classList.add('active');
  if(panel) panel.style.display='block';
}

function doDelete(type, id) {
  if(!confirm('Excluir permanentemente?')) return;
  apiDelete(type,id).then(function(r){
    if(r.ok){ loadAdminData(); setAdminStatus('ger-status','✅ Excluído!','success'); }
    else { setAdminStatus('ger-status','❌ Erro ao excluir.','error'); }
  });
}

/* ============================================================
   ADMIN — ABA PÁGINA
   ============================================================ */
var CONTENT_FIELDS = [
  {group:'🌐 Navegação',fields:[{key:'nav_home',label:'Home'},{key:'nav_projetos',label:'Projetos'},{key:'nav_blog',label:'Blog'},{key:'nav_contato',label:'Contato'}]},
  {group:'🦸 Hero',fields:[{key:'hero_eyebrow',label:'Eyebrow'},{key:'hero_title',label:'Título (HTML ok)',type:'textarea'},{key:'hero_subtitle',label:'Subtítulo',type:'textarea'},{key:'hero_btn1_text',label:'Botão 1 — Texto'},{key:'hero_btn1_link',label:'Botão 1 — Link'},{key:'hero_btn2_text',label:'Botão 2 — Texto'},{key:'hero_btn2_link',label:'Botão 2 — Link'}]},
  {group:'👤 Sobre Mim',fields:[{key:'sobre_label',label:'Label'},{key:'sobre_title',label:'Título'},{key:'sobre_p1',label:'Parágrafo 1',type:'textarea'},{key:'sobre_p2',label:'Parágrafo 2',type:'textarea'},{key:'sobre_p3',label:'Parágrafo 3',type:'textarea'}]},
  {group:'🛠 Skills',fields:[{key:'skills_label',label:'Label'},{key:'skills_title',label:'Título'},{key:'skills_desc',label:'Descrição'},{key:'skills_list',label:'Skills (vírgula)'}]},
  {group:'📊 Habilidades',fields:[{key:'habilidades',label:'JSON [{nome, pct}]',type:'textarea',placeholder:'[{"nome":"SQL","pct":92}]'}]},
  {group:'🔢 Métricas',fields:[{key:'metrics_label',label:'Label'},{key:'metrics_title',label:'Título'},{key:'metric1_value',label:'Métrica 1 — Valor'},{key:'metric1_label',label:'Métrica 1 — Legenda'},{key:'metric2_value',label:'Métrica 2 — Valor'},{key:'metric2_label',label:'Métrica 2 — Legenda'},{key:'metric3_value',label:'Métrica 3 — Valor'},{key:'metric3_label',label:'Métrica 3 — Legenda'}]},
  {group:'📝 Blog',fields:[{key:'blog_title',label:'Título'},{key:'blog_desc',label:'Descrição',type:'textarea'}]},
  {group:'🚀 Projetos',fields:[{key:'projetos_title',label:'Título'},{key:'projetos_desc',label:'Descrição',type:'textarea'}]},
  {group:'📬 Contato',fields:[{key:'contato_title',label:'Título'},{key:'contato_desc',label:'Descrição',type:'textarea'},{key:'contato_disponivel',label:'Badge'},{key:'contato_email',label:'E-mail'},{key:'contato_linkedin',label:'LinkedIn URL'},{key:'contato_github',label:'GitHub URL'},{key:'contato_localizacao',label:'Localização'},{key:'contato_localizacao_sub',label:'Sub-localização'}]},
  {group:'🔗 Footer',fields:[{key:'footer_github',label:'GitHub URL'},{key:'footer_linkedin',label:'LinkedIn URL'}]}
];

function loadContentEditor(c) {
  var container = gel('content-editor'); if(!container) return;
  container.innerHTML = CONTENT_FIELDS.map(function(group){
    var fields = group.fields.map(function(f){
      var val = c[f.key]||'';
      var safe = String(val).replace(/"/g,'&quot;');
      var input = f.type==='textarea'
        ? '<textarea id="ce-'+f.key+'" class="form__textarea" style="min-height:55px;font-size:0.79rem;" placeholder="'+(f.placeholder||'')+'">'+val+'</textarea>'
        : '<input id="ce-'+f.key+'" type="text" class="form__input" style="font-size:0.79rem;" value="'+safe+'">';
      return '<div class="form__group" style="margin-bottom:6px;"><label class="form__label" style="font-size:0.66rem;">'+f.label+'</label>'+input+'</div>';
    }).join('');
    return '<div style="margin-bottom:14px;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;"><div style="font-family:var(--font-mono);font-size:0.66rem;letter-spacing:0.08em;color:var(--accent);padding:7px 12px;background:var(--bg-secondary);border-bottom:1px solid var(--border);text-transform:uppercase;">'+group.group+'</div><div style="padding:10px 12px;">'+fields+'</div></div>';
  }).join('');
}

function saveAllContent() {
  var pairs = [];
  CONTENT_FIELDS.forEach(function(group){
    group.fields.forEach(function(f){ var el=gel('ce-'+f.key); if(el) pairs.push({key:f.key,value:el.value}); });
  });
  setAdminStatus('content-status','🔄 Salvando…','info');
  apiPost('content',pairs).then(function(r){
    if(r.ok){
      setAdminStatus('content-status','✅ Salvo! Atualize a página para ver.','success');
      var c={}; pairs.forEach(function(p){c[p.key]=p.value;}); window._siteContent=c; applyContent(c);
    } else { setAdminStatus('content-status','❌ Erro ao salvar.','error'); }
  }).catch(function(){ setAdminStatus('content-status','❌ Erro de rede.','error'); });
}

/* ============================================================
   UPLOAD IMAGEM — comprime antes de salvar
   ============================================================ */
function setupImageUpload(inputId, b64Id, previewId) {
  var input = gel(inputId); if(!input) return;
  input.addEventListener('change', function(){
    var file = input.files[0]; if(!file) return;
    var reader = new FileReader();
    reader.onload = function(ev){
      var img = new Image();
      img.onload = function(){
        var canvas = document.createElement('canvas');
        var MAX=800, w=img.width, h=img.height;
        if(w>MAX){h=Math.round(h*MAX/w);w=MAX;} if(h>MAX){w=Math.round(w*MAX/h);h=MAX;}
        canvas.width=w; canvas.height=h;
        canvas.getContext('2d').drawImage(img,0,0,w,h);
        var b64 = canvas.toDataURL('image/jpeg',0.78);
        var b64El=gel(b64Id); if(b64El) b64El.value=b64;
        var prev=gel(previewId); if(prev){prev.src=b64;prev.style.display='block';}
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {

  /* --- Tema --- */
  updateToggleIcon(localStorage.getItem('theme')||'dark');
  document.querySelectorAll('.theme-toggle').forEach(function(btn){
    btn.addEventListener('click', function(){
      var next = document.documentElement.getAttribute('data-theme')==='dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateToggleIcon(next);
    });
  });

  /* --- Menu mobile --- */
  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function(e){
      e.stopPropagation();
      var open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open?'true':'false');
    });
    nav.querySelectorAll('.nav__link').forEach(function(link){
      link.addEventListener('click', function(){ nav.classList.remove('open'); navToggle.setAttribute('aria-expanded','false'); });
    });
    document.addEventListener('click', function(e){
      if(nav.classList.contains('open')&&!nav.contains(e.target)){ nav.classList.remove('open'); navToggle.setAttribute('aria-expanded','false'); }
    });
  }

  /* --- Link ativo --- */
  var page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(function(l){ if(l.getAttribute('href')===page) l.classList.add('active'); });

  /* --- Copyright --- */
  document.querySelectorAll('.footer__year').forEach(function(el){ el.textContent=new Date().getFullYear(); });

  /* --- Animações --- */
  initScrollAnimations();

  /* --- Upload imagem --- */
  setupImageUpload('pub-image-input',      'pub-image-b64',      'pub-image-preview');
  setupImageUpload('pub-proj-image-input', 'pub-proj-image-b64', 'pub-proj-image-preview');

  /* --- Admin: 5 cliques no nome --- */
  var logoName = document.querySelector('.header__logo-name');
  var clicks=0, timer=null;
  if(logoName){
    logoName.style.userSelect='none';
    logoName.addEventListener('click', function(e){
      e.preventDefault(); clicks++;
      clearTimeout(timer);
      timer=setTimeout(function(){clicks=0;},2000);
      if(clicks>=5){clicks=0;openModal();}
    });
  }

  /* --- Admin: fechar modal --- */
  document.addEventListener('click', function(e){
    if(e.target.classList.contains('modal__overlay')) closeModal();
  });
  document.addEventListener('keydown', function(e){
    var m=gel('admin-modal'); if(e.key==='Escape'&&m&&m.classList.contains('is-open')) closeModal();
  });

  /* --- Admin: login --- */
  var loginBtn=gel('admin-login-btn'), passInp=gel('admin-password');
  if(loginBtn) loginBtn.addEventListener('click', doLogin);
  if(passInp) passInp.addEventListener('keydown', function(e){if(e.key==='Enter') doLogin();});

  /* --- Admin: logout --- */
  var logoutBtn=gel('admin-logout-btn');
  if(logoutBtn) logoutBtn.addEventListener('click', closeModal);

  /* --- Admin: tabs principais --- */
  document.querySelectorAll('.admin-tab').forEach(function(tab){
    tab.addEventListener('click', function(){ switchAdminTab(tab.dataset.tab); });
  });

  /* --- Admin: dest tabs --- */
  document.querySelectorAll('.dest-tab').forEach(function(tab){
    tab.addEventListener('click', function(){
      document.querySelectorAll('.dest-tab').forEach(function(t){t.classList.remove('active');});
      tab.classList.add('active');
      switchDest(tab.dataset.dest);
    });
  });

  /* --- Admin: ger tabs --- */
  document.querySelectorAll('.ger-tab').forEach(function(tab){
    tab.addEventListener('click', function(){ switchGerTab(tab.dataset.ger); });
  });

  /* --- Admin: publicar --- */
  var pubBtn=gel('pub-submit-btn');
  if(pubBtn) pubBtn.addEventListener('click', handlePublicar);

  /* --- Admin: salvar conteúdo --- */
  var saveBtn=gel('content-save-btn');
  if(saveBtn) saveBtn.addEventListener('click', saveAllContent);

  /* --- Carregar dados da API --- */
  apiGet().then(function(data){
    window._siteContent = data.content||{};
    applyContent(window._siteContent);
    renderBlogCards(data.posts||[]);
    renderFeaturedPosts(data.posts||[]);
    renderFeaturedProjects(data.projects||[]);
  }).catch(function(err){ console.warn('API:', err); });

});
