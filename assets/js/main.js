/* ============================================================
   main.js — Tema, menu mobile, admin modal
   ============================================================ */

/* ---- Tema: aplica antes do render para evitar flash ---- */
(function () {
  var t = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', t);
})();

function updateToggleIcon(theme) {
  document.querySelectorAll('.theme-toggle__knob').forEach(function (k) {
    k.textContent = theme === 'dark' ? '🌙' : '☀️';
  });
}

/* ============================================================
   CONFIG GLOBAL
   ============================================================ */
var REPO_OWNER = 'joaopedrolour3nc';
var REPO_NAME  = 'Portfolio-Jo-o-Pedro-Analista';
var DATA_FILE  = 'data.json';
var BRANCH     = 'main';
var API_BASE   = 'https://api.github.com/repos/' + REPO_OWNER + '/' + REPO_NAME + '/contents/' + DATA_FILE;
var ADMIN_PASS = '121246';

document.addEventListener('DOMContentLoaded', function () {

  /* ---- Tema toggle ---- */
  var savedTheme = localStorage.getItem('theme') || 'dark';
  updateToggleIcon(savedTheme);

  document.querySelectorAll('.theme-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateToggleIcon(next);
    });
  });

  /* ---- Menu mobile ---- */
  var navToggle = document.querySelector('.nav-toggle');
  var nav       = document.querySelector('.nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    nav.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !nav.contains(e.target)) {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- Link ativo no nav ---- */
  var currentFile = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(function (link) {
    if (link.getAttribute('href') === currentFile) link.classList.add('active');
  });

  /* ---- Copyright ---- */
  document.querySelectorAll('.footer__year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ============================================================
     ADMIN — gatilho: 5 cliques no nome
     ============================================================ */
  var logoName   = document.querySelector('.header__logo-name');
  var clickCount = 0;
  var clickTimer = null;

  if (logoName) {
    logoName.style.userSelect = 'none';
    logoName.addEventListener('click', function (e) {
      e.preventDefault();
      clickCount++;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(function () { clickCount = 0; }, 2000);
      if (clickCount >= 5) {
        clickCount = 0;
        openAdminModal();
      }
    });
  }

  /* ---- Helpers de modal ---- */
  function openAdminModal() {
    var modal = document.getElementById('admin-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      var el = document.getElementById('admin-pass-input');
      if (el) el.focus();
    }, 80);
  }

  function closeAdminModal() {
    var modal = document.getElementById('admin-modal');
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
    showView('login');
    var inp = document.getElementById('admin-pass-input');
    if (inp) { inp.value = ''; inp.classList.remove('error'); }
    setStatus('', '');
  }

  function showView(which) {
    var lv = document.getElementById('admin-login-view');
    var pv = document.getElementById('admin-panel-view');
    if (!lv || !pv) return;
    lv.style.display = (which === 'login') ? 'block' : 'none';
    pv.style.display = (which === 'panel') ? 'block' : 'none';
  }

  function showError(id, show) {
    var el = document.getElementById(id);
    if (!el) return;
    el.style.display = show ? 'block' : 'none';
  }

  function setStatus(msg, type) {
    var el = document.getElementById('admin-publish-status');
    if (!el) return;
    if (!msg) { el.style.display = 'none'; return; }
    el.style.display = 'block';
    el.className = 'publish-status publish-status--' + type;
    el.textContent = msg;
  }

  /* ---- Fechar ---- */
  var closeBtn = document.getElementById('admin-modal-close');
  var backdrop = document.getElementById('admin-backdrop');
  if (closeBtn) closeBtn.addEventListener('click', closeAdminModal);
  if (backdrop) backdrop.addEventListener('click', closeAdminModal);
  document.addEventListener('keydown', function (e) {
    var modal = document.getElementById('admin-modal');
    if (e.key === 'Escape' && modal && modal.style.display !== 'none') closeAdminModal();
  });

  /* ---- Login ---- */
  function doLogin() {
    var inp = document.getElementById('admin-pass-input');
    if (!inp) return;
    if (inp.value === ADMIN_PASS) {
      showError('admin-pass-error', false);
      inp.classList.remove('error');
      showView('panel');
    } else {
      showError('admin-pass-error', true);
      inp.classList.add('error');
      inp.value = '';
      inp.focus();
    }
  }

  var passBtn = document.getElementById('admin-pass-btn');
  var passInp = document.getElementById('admin-pass-input');
  if (passBtn) passBtn.addEventListener('click', doLogin);
  if (passInp) passInp.addEventListener('keydown', function (e) { if (e.key === 'Enter') doLogin(); });

  var logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', function () { showView('login'); });

  /* ---- Abas de destino ---- */
  var currentDest = 'blog';

  document.querySelectorAll('.admin-dest-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.admin-dest-tab').forEach(function (t) { t.classList.remove('admin-dest-tab--active'); });
      tab.classList.add('admin-dest-tab--active');
      currentDest = tab.dataset.dest;
      applyDestFields(currentDest);
    });
  });

  function applyDestFields(dest) {
    var projFields  = document.getElementById('admin-project-fields');
    var descField   = document.getElementById('admin-desc-field');
    var editorField = document.getElementById('admin-editor-field');
    if (!projFields || !descField || !editorField) return;

    projFields.style.display  = (dest === 'projects' || dest === 'both') ? 'block' : 'none';
    descField.style.display   = (dest === 'projects' || dest === 'both') ? 'block' : 'none';
    editorField.style.display = (dest === 'blog'     || dest === 'both') ? 'block' : 'none';
  }

  /* ---- Editor rich text ---- */
  document.querySelectorAll('.editor-btn[data-acmd]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var editor = document.getElementById('admin-post-content');
      if (editor) editor.focus();
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

  /* ---- Limpar formulário ---- */
  var clearBtn = document.getElementById('admin-clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      if (!confirm('Limpar formulário?')) return;
      ['admin-post-title','admin-post-tags','admin-proj-stack','admin-proj-data',
       'admin-proj-github','admin-proj-demo','admin-proj-imagem','admin-proj-desc'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.value = '';
      });
      var dc = document.getElementById('admin-proj-destaque');
      if (dc) dc.checked = false;
      var editor = document.getElementById('admin-post-content');
      if (editor) editor.innerHTML = '';
      setStatus('', '');
    });
  }

  /* ---- API GitHub ---- */
  function getToken() {
    var el = document.getElementById('admin-gh-token');
    return el ? el.value.trim() : '';
  }

  function fetchData(token) {
    return fetch(API_BASE + '?ref=' + BRANCH + '&t=' + Date.now(), {
      headers: { 'Accept': 'application/vnd.github+json', 'Authorization': 'Bearer ' + token }
    })
      .then(function (r) { if (!r.ok) throw new Error('fetch'); return r.json(); })
      .then(function (d) {
        var json = decodeURIComponent(escape(atob(d.content.replace(/\n/g, ''))));
        return { data: JSON.parse(json), sha: d.sha };
      });
  }

  function saveData(data, sha, token) {
    var encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
    return fetch(API_BASE, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github+json'
      },
      body: JSON.stringify({ message: 'update: ' + new Date().toISOString(), content: encoded, sha: sha, branch: BRANCH })
    }).then(function (r) { if (!r.ok) throw new Error('save'); return r.json(); });
  }

  /* ---- Publicar ---- */
  var publishBtn = document.getElementById('admin-publish-btn');
  if (publishBtn) {
    publishBtn.addEventListener('click', function () {
      var token   = getToken();
      var titleEl = document.getElementById('admin-post-title');
      var tagsEl  = document.getElementById('admin-post-tags');
      var editor  = document.getElementById('admin-post-content');
      var descInp = document.getElementById('admin-proj-desc');

      var title   = titleEl ? titleEl.value.trim() : '';
      var content = editor  ? editor.innerHTML.trim() : '';
      var tags    = tagsEl && tagsEl.value
        ? tagsEl.value.split(',').map(function (t) { return t.trim(); }).filter(Boolean)
        : [];

      var ok = true;

      if (!token) { showError('admin-token-error', true); document.getElementById('admin-gh-token').classList.add('error'); ok = false; }
      else        { showError('admin-token-error', false); document.getElementById('admin-gh-token').classList.remove('error'); }

      if (!title) { showError('admin-title-error', true); titleEl.classList.add('error'); ok = false; }
      else        { showError('admin-title-error', false); if (titleEl) titleEl.classList.remove('error'); }

      if ((currentDest === 'blog' || currentDest === 'both') && (!content || (editor && editor.textContent.trim() === ''))) {
        showError('admin-content-error', true); ok = false;
      } else { showError('admin-content-error', false); }

      if ((currentDest === 'projects' || currentDest === 'both') && descInp && !descInp.value.trim()) {
        showError('admin-desc-error', true); ok = false;
      } else { showError('admin-desc-error', false); }

      if (!ok) return;

      publishBtn.textContent = 'Publicando...';
      publishBtn.disabled    = true;
      setStatus('Conectando ao GitHub...', 'info');

      fetchData(token)
        .then(function (result) {
          var d   = result.data;
          var sha = result.sha;

          if (currentDest === 'blog' || currentDest === 'both') {
            var post = { id: Date.now(), title: title, content: content, tags: tags, date: new Date().toISOString() };
            d.posts = [post].concat(d.posts || []);
          }

          if (currentDest === 'projects' || currentDest === 'both') {
            var stackEl = document.getElementById('admin-proj-stack');
            var dataEl  = document.getElementById('admin-proj-data');
            var ghEl    = document.getElementById('admin-proj-github');
            var demoEl  = document.getElementById('admin-proj-demo');
            var imgEl   = document.getElementById('admin-proj-imagem');
            var destEl  = document.getElementById('admin-proj-destaque');
            var project = {
              id:             Date.now() + 1,
              titulo:         title,
              descricaoCurta: descInp ? descInp.value.trim() : '',
              stack:          stackEl && stackEl.value ? stackEl.value.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : [],
              data:           dataEl ? dataEl.value.trim() : '',
              links: {
                github: ghEl   && ghEl.value.trim()  ? ghEl.value.trim()  : null,
                demo:   demoEl && demoEl.value.trim() ? demoEl.value.trim() : null
              },
              imagem:   imgEl  ? (imgEl.value.trim()  || null) : null,
              tags:     tags,
              destaque: destEl ? destEl.checked : false
            };
            d.projects = [project].concat(d.projects || []);
          }

          return saveData(d, sha, token);
        })
        .then(function () {
          setStatus('✅ Publicado com sucesso!', 'success');
          ['admin-post-title','admin-post-tags','admin-proj-stack','admin-proj-data',
           'admin-proj-github','admin-proj-demo','admin-proj-imagem','admin-proj-desc'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.value = '';
          });
          var dc = document.getElementById('admin-proj-destaque');
          if (dc) dc.checked = false;
          var ed = document.getElementById('admin-post-content');
          if (ed) ed.innerHTML = '';
        })
        .catch(function () {
          setStatus('❌ Erro ao publicar. Verifique o token.', 'error');
          showError('admin-token-error', true);
          var ti = document.getElementById('admin-gh-token');
          if (ti) ti.classList.add('error');
        })
        .finally(function () {
          publishBtn.textContent = 'Publicar →';
          publishBtn.disabled    = false;
        });
    });
  }

});
