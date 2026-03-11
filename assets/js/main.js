/* ============================================================
   main.js
   ============================================================ */

(function () {
  var t = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', t);
})();

function updateToggleIcon(theme) {
  document.querySelectorAll('.theme-toggle__knob').forEach(function (k) {
    k.textContent = theme === 'dark' ? '🌙' : '☀️';
  });
}

var ADMIN_PASS = '121246';
var API_PROXY  = '/api/github';

function gel(id) { return document.getElementById(id); }
function gval(id) { var e = gel(id); return e ? e.value.trim() : ''; }

function showEl(id, show) {
  var e = gel(id);
  if (e) e.style.display = show ? 'block' : 'none';
}

function setStatus(id, msg, type) {
  var e = gel(id);
  if (!e) return;
  if (!msg) { e.style.display = 'none'; return; }
  e.style.display = 'block';
  e.className = 'publish-status publish-status--' + (type || 'info');
  e.textContent = msg;
}

function ghRead() {
  return fetch(API_PROXY + '?_=' + Date.now())
    .then(function(r) {
      if (!r.ok) return r.json().then(function(e) { throw new Error(e.error || 'Erro ao ler'); });
      return r.json();
    });
}

function ghWrite(data, sha) {
  return fetch(API_PROXY, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: data, sha: sha })
  }).then(function(r) {
    if (!r.ok) return r.json().then(function(e) { throw new Error(e.error || 'Erro ao salvar'); });
    return r.json();
  });
}

document.addEventListener('DOMContentLoaded', function () {

  /* --- Tema --- */
  updateToggleIcon(localStorage.getItem('theme') || 'dark');
  document.querySelectorAll('.theme-toggle').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateToggleIcon(next);
    });
  });

  /* --- Menu mobile --- */
  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      var open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('.nav__link').forEach(function(link) {
      link.addEventListener('click', function() {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('click', function(e) {
      if (nav.classList.contains('open') && !nav.contains(e.target)) {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* --- Link ativo --- */
  var page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(function(l) {
    if (l.getAttribute('href') === page) l.classList.add('active');
  });

  /* --- Copyright --- */
  document.querySelectorAll('.footer__year').forEach(function(el) {
    el.textContent = new Date().getFullYear();
  });

  /* === ADMIN MODAL === */
  var logoName = document.querySelector('.header__logo-name');
  var clicks = 0, timer = null;
  if (logoName) {
    logoName.style.userSelect = 'none';
    logoName.addEventListener('click', function(e) {
      e.preventDefault();
      clicks++;
      clearTimeout(timer);
      timer = setTimeout(function() { clicks = 0; }, 2000);
      if (clicks >= 5) { clicks = 0; openModal(); }
    });
  }

  function openModal() {
    var m = gel('admin-modal');
    if (!m) return;
    m.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(function() { var el = gel('admin-pass-input'); if (el) el.focus(); }, 80);
  }

  function closeModal() {
    var m = gel('admin-modal');
    if (!m) return;
    m.style.display = 'none';
    document.body.style.overflow = '';
    showView('login');
    var inp = gel('admin-pass-input');
    if (inp) { inp.value = ''; inp.classList.remove('error'); }
    setStatus('admin-publish-status', '', '');
  }

  function showView(which) {
    var lv = gel('admin-login-view'), pv = gel('admin-panel-view');
    if (lv) lv.style.display = which === 'login' ? 'block' : 'none';
    if (pv) pv.style.display = which === 'panel' ? 'block' : 'none';
  }

  var closeBtn = gel('admin-modal-close'), backdrop = gel('admin-backdrop');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', function(e) {
    var m = gel('admin-modal');
    if (e.key === 'Escape' && m && m.style.display !== 'none') closeModal();
  });

  function doLogin() {
    var inp = gel('admin-pass-input');
    if (!inp) return;
    if (inp.value === ADMIN_PASS) {
      showEl('admin-pass-error', false); inp.classList.remove('error');
      showView('panel');
    } else {
      showEl('admin-pass-error', true); inp.classList.add('error');
      inp.value = ''; inp.focus();
    }
  }
  var passBtn = gel('admin-pass-btn'), passInp = gel('admin-pass-input');
  if (passBtn) passBtn.addEventListener('click', doLogin);
  if (passInp) passInp.addEventListener('keydown', function(e) { if (e.key === 'Enter') doLogin(); });

  var logoutBtn = gel('admin-logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', function() { showView('login'); });

  /* Abas Publicar / Gerenciar */
  document.querySelectorAll('.admin-nav-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.admin-nav-tab').forEach(function(t) { t.classList.remove('admin-nav-tab--active'); });
      tab.classList.add('admin-nav-tab--active');
      var p = tab.dataset.panel;
      showEl('admin-publish-panel', p === 'publish');
      showEl('admin-manage-panel',  p === 'manage');
      if (p === 'manage') loadManage('posts');
    });
  });

  /* Abas Blog / Projetos / Ambos */
  var currentDest = 'blog';
  document.querySelectorAll('.admin-dest-tab[data-dest]').forEach(function(tab) {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.admin-dest-tab[data-dest]').forEach(function(t) { t.classList.remove('admin-dest-tab--active'); });
      tab.classList.add('admin-dest-tab--active');
      currentDest = tab.dataset.dest;
      applyDestFields(currentDest);
    });
  });

  function applyDestFields(dest) {
    showEl('admin-project-fields',   dest === 'projects' || dest === 'both');
    showEl('admin-desc-field',       dest === 'projects' || dest === 'both');
    showEl('admin-editor-field',     dest === 'blog'     || dest === 'both');
    showEl('admin-blog-image-field', dest === 'blog'     || dest === 'both');
  }

  /* Upload imagem → base64 */
  var imageBase64 = null;
  var imgFile = gel('admin-post-image-file'), imgPreview = gel('admin-image-preview');
  if (imgFile) {
    imgFile.addEventListener('change', function() {
      var file = imgFile.files[0];
      if (!file) { imageBase64 = null; if (imgPreview) imgPreview.style.display = 'none'; return; }
      if (file.size > 800 * 1024) {
        alert('Imagem muito grande (' + Math.round(file.size/1024) + 'KB). Use menos de 800KB.');
        imgFile.value = ''; imageBase64 = null; return;
      }
      var reader = new FileReader();
      reader.onload = function(ev) {
        imageBase64 = ev.target.result;
        if (imgPreview) { imgPreview.src = imageBase64; imgPreview.style.display = 'block'; }
      };
      reader.readAsDataURL(file);
    });
  }

  /* Editor rich text */
  document.querySelectorAll('.editor-btn[data-acmd]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      var ed = gel('admin-post-content'); if (ed) ed.focus();
      var cmd = btn.dataset.acmd;
      if      (cmd === 'bold')       document.execCommand('bold');
      else if (cmd === 'italic')     document.execCommand('italic');
      else if (cmd === 'h2')         document.execCommand('formatBlock', false, 'h2');
      else if (cmd === 'h3')         document.execCommand('formatBlock', false, 'h3');
      else if (cmd === 'ul')         document.execCommand('insertUnorderedList');
      else if (cmd === 'blockquote') document.execCommand('formatBlock', false, 'blockquote');
      else if (cmd === 'code') {
        var sel = window.getSelection();
        if (sel && sel.toString()) document.execCommand('insertHTML', false, '<code>' + sel.toString() + '</code>');
      }
    });
  });

  /* Limpar */
  var clearBtn = gel('admin-clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      if (!confirm('Limpar formulário?')) return;
      ['admin-post-title','admin-post-tags','admin-post-author','admin-post-date',
       'admin-post-image-url','admin-proj-stack','admin-proj-data','admin-proj-github',
       'admin-proj-demo','admin-proj-imagem','admin-proj-desc'].forEach(function(id) {
        var el = gel(id); if (el) el.value = '';
      });
      var ae = gel('admin-post-author'); if (ae) ae.value = 'João Pedro';
      var dc = gel('admin-proj-destaque'); if (dc) dc.checked = false;
      var ed = gel('admin-post-content'); if (ed) ed.innerHTML = '';
      var fi = gel('admin-post-image-file'); if (fi) fi.value = '';
      if (imgPreview) imgPreview.style.display = 'none';
      imageBase64 = null;
      setStatus('admin-publish-status', '', '');
    });
  }

  /* === PUBLICAR === */
  var publishBtn = gel('admin-publish-btn');
  if (publishBtn) {
    publishBtn.addEventListener('click', function() {
      var title   = gval('admin-post-title');
      var edEl    = gel('admin-post-content');
      var content = edEl ? edEl.innerHTML.trim() : '';
      var author  = gval('admin-post-author') || 'João Pedro';
      var tags    = gval('admin-post-tags').split(',').map(function(t){return t.trim();}).filter(Boolean);
      var dv      = gval('admin-post-date');
      var postDate = dv ? new Date(dv + 'T12:00:00').toISOString() : new Date().toISOString();
      var image   = imageBase64 || gval('admin-post-image-url') || null;
      var descInp = gel('admin-proj-desc');

      var ok = true;
      if (!title) { showEl('admin-title-error', true); ok = false; } else { showEl('admin-title-error', false); }
      if ((currentDest === 'blog' || currentDest === 'both') && edEl && !edEl.textContent.trim()) {
        showEl('admin-content-error', true); ok = false;
      } else { showEl('admin-content-error', false); }
      if ((currentDest === 'projects' || currentDest === 'both') && descInp && !descInp.value.trim()) {
        showEl('admin-desc-error', true); ok = false;
      } else { showEl('admin-desc-error', false); }
      if (!ok) return;

      publishBtn.disabled = true; publishBtn.textContent = 'Publicando...';
      setStatus('admin-publish-status', 'Conectando...', 'info');

      ghRead()
        .then(function(r) {
          var d = r.data, sha = r.sha, newId = Date.now();
          if (currentDest === 'blog' || currentDest === 'both') {
            d.posts = [{ id: newId, title: title, content: content, tags: tags, date: postDate, author: author, image: image }]
              .concat(d.posts || []);
          }
          if (currentDest === 'projects' || currentDest === 'both') {
            d.projects = [{
              id: newId + 1, titulo: title,
              descricaoCurta: descInp ? descInp.value.trim() : '',
              stack: gval('admin-proj-stack').split(',').map(function(s){return s.trim();}).filter(Boolean),
              data: gval('admin-proj-data'),
              links: { github: gval('admin-proj-github') || null, demo: gval('admin-proj-demo') || null },
              imagem: gval('admin-proj-imagem') || null,
              tags: tags,
              destaque: gel('admin-proj-destaque') ? gel('admin-proj-destaque').checked : false
            }].concat(d.projects || []);
          }
          return ghWrite(d, sha);
        })
        .then(function() {
          setStatus('admin-publish-status', '✅ Publicado com sucesso!', 'success');
          ['admin-post-title','admin-post-tags','admin-post-date','admin-post-image-url',
           'admin-proj-stack','admin-proj-data','admin-proj-github','admin-proj-demo',
           'admin-proj-imagem','admin-proj-desc'].forEach(function(id) { var el = gel(id); if (el) el.value = ''; });
          var ae = gel('admin-post-author'); if (ae) ae.value = 'João Pedro';
          var dc = gel('admin-proj-destaque'); if (dc) dc.checked = false;
          var ed2 = gel('admin-post-content'); if (ed2) ed2.innerHTML = '';
          var fi = gel('admin-post-image-file'); if (fi) fi.value = '';
          if (imgPreview) imgPreview.style.display = 'none';
          imageBase64 = null;
        })
        .catch(function(err) { setStatus('admin-publish-status', '❌ ' + (err.message || 'Erro'), 'error'); })
        .finally(function() { publishBtn.disabled = false; publishBtn.textContent = 'Publicar →'; });
    });
  }

  /* === GERENCIAR === */
  var currentMTab = 'posts';

  function loadManage(type) {
    var loading = gel('admin-manage-loading'), items = gel('admin-manage-items');
    if (!items) return;
    if (loading) loading.style.display = 'flex';
    items.innerHTML = '';
    setStatus('admin-manage-status', '', '');

    ghRead()
      .then(function(r) {
        if (loading) loading.style.display = 'none';
        var list = type === 'posts' ? (r.data.posts || []) : (r.data.projects || []);
        if (!list.length) {
          items.innerHTML = '<p style="color:var(--text-muted);font-family:var(--font-mono);font-size:0.78rem;padding:12px 0;">Nenhum item.</p>';
          return;
        }
        list.forEach(function(item) {
          var label  = type === 'posts' ? item.title : item.titulo;
          var date   = type === 'posts' ? new Date(item.date).toLocaleDateString('pt-BR') : (item.data || '');
          var itemId = String(item.id);
          var row = document.createElement('div');
          row.className = 'admin-post-row';
          row.innerHTML =
            '<div class="admin-post-row__info">' +
              '<span class="admin-post-row__title">' + (label || '(sem título)') + '</span>' +
              '<span class="admin-post-row__date">' + date + '</span>' +
            '</div>' +
            '<button class="btn btn--outline btn--sm admin-post-row__del" style="color:var(--error);border-color:var(--error);">Excluir</button>';
          (function(tid, ttype) {
            row.querySelector('.admin-post-row__del').addEventListener('click', function() {
              doDelete(ttype, tid);
            });
          })(itemId, type);
          items.appendChild(row);
        });
      })
      .catch(function() {
        if (loading) loading.style.display = 'none';
        items.innerHTML = '<p style="color:var(--error);font-family:var(--font-mono);font-size:0.78rem;">Erro ao carregar.</p>';
      });
  }

  document.querySelectorAll('.admin-dest-tab[data-mtab]').forEach(function(tab) {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.admin-dest-tab[data-mtab]').forEach(function(t) { t.classList.remove('admin-dest-tab--active'); });
      tab.classList.add('admin-dest-tab--active');
      currentMTab = tab.dataset.mtab;
      loadManage(currentMTab);
    });
  });

  function doDelete(type, id) {
    if (!confirm('Excluir permanentemente?')) return;
    setStatus('admin-manage-status', '🔄 Excluindo...', 'info');

    ghRead()
      .then(function(r) {
        var d = r.data, sha = r.sha;
        var before, after;
        if (type === 'posts') {
          before = (d.posts || []).length;
          d.posts = (d.posts || []).filter(function(p) { return String(p.id) !== id; });
          after = d.posts.length;
        } else {
          before = (d.projects || []).length;
          d.projects = (d.projects || []).filter(function(p) { return String(p.id) !== id; });
          after = d.projects.length;
        }
        if (before === after) throw new Error('Item não encontrado. Recarregue a lista.');
        return ghWrite(d, sha);
      })
      .then(function() {
        setStatus('admin-manage-status', '✅ Excluído com sucesso!', 'success');
        loadManage(type);
      })
      .catch(function(err) {
        setStatus('admin-manage-status', '❌ ' + (err.message || 'Erro'), 'error');
      });
  }

});