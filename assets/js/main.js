/* ============================================================
   main.js — Menu mobile, tema, utilidades
   ============================================================ */

/* ---- Aplica tema salvo antes de qualquer render ---- */
var _savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', _savedTheme);

/* ---- Tudo o mais só roda com DOM pronto ---- */
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- TEMA ---------- */
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    document.querySelectorAll('.theme-toggle__knob').forEach(function (k) {
      k.textContent = theme === 'dark' ? '🌙' : '☀️';
    });
  }

  // Sincroniza só o ícone — NÃO chama setTheme() para não re-gravar no localStorage
  // nem disparar a transição de tema ao trocar de página
  document.querySelectorAll('.theme-toggle__knob').forEach(function (k) {
    k.textContent = _savedTheme === 'dark' ? '🌙' : '☀️';
  });

  // Clique no toggle
  document.querySelectorAll('.theme-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  });

  /* ---------- MENU MOBILE ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var nav       = document.querySelector('.nav');

  if (navToggle && nav) {

    navToggle.addEventListener('click', function (e) {
      e.stopPropagation(); // evita que o click-outside feche antes de abrir
      var willOpen = !nav.classList.contains('open');
      nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });

    // Fecha ao clicar num link
    nav.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Fecha ao clicar fora
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !nav.contains(e.target)) {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- LINK ATIVO ---------- */
  var currentFile = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(function (link) {
    if (link.getAttribute('href') === currentFile) {
      link.classList.add('active');
    }
  });

  /* ---------- COPYRIGHT ---------- */
  document.querySelectorAll('.footer__year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- TOAST ---------- */
  window.showToast = function (opts) {
    opts = opts || {};
    var icon     = opts.icon     || '✅';
    var title    = opts.title    || 'Sucesso!';
    var body     = opts.body     || '';
    var type     = opts.type     || 'success';
    var duration = opts.duration || 4000;

    var toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      document.body.appendChild(toast);
    }
    toast.className = 'toast toast--' + type;
    toast.innerHTML =
      '<div class="toast__icon">' + icon + '</div>' +
      '<div><div class="toast__title">' + title + '</div>' +
      '<div class="toast__body">' + body + '</div></div>';

    toast.classList.add('show');
    clearTimeout(toast._tid);
    toast._tid = setTimeout(function () { toast.classList.remove('show'); }, duration);
  };

});

/* ============================================================
   ADMIN MODAL — ativado clicando 5x no nome do header
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {

  var ADMIN_PASS = '121246';
  var REPO_OWNER = 'joaopedrolour3nc';
  var REPO_NAME  = 'Portfolio-Jo-o-Pedro-Analista';
  var POSTS_FILE = 'posts.json';
  var BRANCH     = 'main';
  var API_BASE   = 'https://api.github.com/repos/' + REPO_OWNER + '/' + REPO_NAME + '/contents/' + POSTS_FILE;

  /* ---- Gatilho: 5 cliques no nome ---- */
  var logoName   = document.querySelector('.header__logo-name');
  var clickCount = 0;
  var clickTimer = null;

  if (logoName) {
    logoName.style.cursor = 'default';
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

  /* ---- Abrir / fechar modal ---- */
  function openAdminModal() {
    var modal = document.getElementById('admin-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      var inp = document.getElementById('admin-pass-input');
      if (inp) inp.focus();
    }, 100);
  }

  function closeAdminModal() {
    var modal = document.getElementById('admin-modal');
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
    // Volta para tela de senha
    showView('login');
    var inp = document.getElementById('admin-pass-input');
    if (inp) inp.value = '';
    clearStatus();
  }

  function showView(view) {
    var loginView = document.getElementById('admin-login-view');
    var panelView = document.getElementById('admin-panel-view');
    if (!loginView || !panelView) return;
    if (view === 'login') {
      loginView.style.display = 'block';
      panelView.style.display = 'none';
    } else {
      loginView.style.display = 'none';
      panelView.style.display = 'block';
    }
  }

  var closeBtn   = document.getElementById('admin-modal-close');
  var backdrop   = document.getElementById('admin-backdrop');
  if (closeBtn)  closeBtn.addEventListener('click', closeAdminModal);
  if (backdrop)  backdrop.addEventListener('click', closeAdminModal);
  document.addEventListener('keydown', function (e) {
    var modal = document.getElementById('admin-modal');
    if (e.key === 'Escape' && modal && modal.style.display !== 'none') closeAdminModal();
  });

  /* ---- Login ---- */
  var passBtn   = document.getElementById('admin-pass-btn');
  var passInput = document.getElementById('admin-pass-input');
  var passError = document.getElementById('admin-pass-error');

  function doLogin() {
    if (!passInput) return;
    if (passInput.value === ADMIN_PASS) {
      if (passError) passError.style.display = 'none';
      passInput.classList.remove('error');
      showView('panel');
    } else {
      if (passError) passError.style.display = 'block';
      passInput.classList.add('error');
      passInput.value = '';
      passInput.focus();
    }
  }

  if (passBtn)   passBtn.addEventListener('click', doLogin);
  if (passInput) passInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') doLogin();
  });

  var logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', function () {
    showView('login');
    if (passInput) passInput.value = '';
  });

  /* ---- Editor de rich text ---- */
  var editorArea = document.getElementById('admin-post-content');

  document.querySelectorAll('.editor-btn[data-acmd]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (editorArea) editorArea.focus();
      var cmd = btn.dataset.acmd;
      if      (cmd === 'bold')       document.execCommand('bold');
      else if (cmd === 'italic')     document.execCommand('italic');
      else if (cmd === 'h2')         document.execCommand('formatBlock', false, 'h2');
      else if (cmd === 'h3')         document.execCommand('formatBlock', false, 'h3');
      else if (cmd === 'ul')         document.execCommand('insertUnorderedList');
      else if (cmd === 'blockquote') document.execCommand('formatBlock', false, 'blockquote');
      else if (cmd === 'code') {
        var sel = window.getSelection();
        if (sel && sel.toString()) {
          document.execCommand('insertHTML', false, '<code>' + sel.toString() + '</code>');
        }
      }
    });
  });

  /* ---- Limpar ---- */
  var clearBtn = document.getElementById('admin-clear-btn');
  if (clearBtn) clearBtn.addEventListener('click', function () {
    if (!confirm('Limpar formulário?')) return;
    var t = document.getElementById('admin-post-title');
    var g = document.getElementById('admin-post-tags');
    if (t) t.value = '';
    if (g) g.value = '';
    if (editorArea) editorArea.innerHTML = '';
    clearStatus();
  });

  /* ---- Status ---- */
  function setStatus(msg, type) {
    var el = document.getElementById('admin-publish-status');
    if (!el) return;
    if (!msg) { el.style.display = 'none'; return; }
    el.style.display = 'block';
    el.className = 'publish-status publish-status--' + type;
    el.textContent = msg;
  }
  function clearStatus() { setStatus('', ''); }

  /* ---- API GitHub ---- */
  function getToken() {
    var el = document.getElementById('admin-gh-token');
    return el ? el.value.trim() : '';
  }

  function fetchPosts(token) {
    var headers = { 'Accept': 'application/vnd.github+json', 'Authorization': 'Bearer ' + token };
    return fetch(API_BASE + '?ref=' + BRANCH + '&t=' + Date.now(), { headers: headers })
      .then(function (res) { if (!res.ok) throw new Error('fetch'); return res.json(); })
      .then(function (data) {
        var json = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))));
        return { posts: JSON.parse(json), sha: data.sha };
      });
  }

  function savePosts(posts, sha, token) {
    var encoded = btoa(unescape(encodeURIComponent(JSON.stringify(posts, null, 2))));
    return fetch(API_BASE, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type':  'application/json',
        'Accept':        'application/vnd.github+json',
      },
      body: JSON.stringify({ message: 'post: ' + new Date().toISOString(), content: encoded, sha: sha, branch: BRANCH }),
    }).then(function (res) { if (!res.ok) throw new Error('save'); return res.json(); });
  }

  /* ---- Publicar ---- */
  var publishBtn = document.getElementById('admin-publish-btn');
  if (publishBtn) publishBtn.addEventListener('click', function () {
    var token   = getToken();
    var titleEl = document.getElementById('admin-post-title');
    var tagsEl  = document.getElementById('admin-post-tags');
    var title   = titleEl ? titleEl.value.trim() : '';
    var content = editorArea ? editorArea.innerHTML.trim() : '';
    var tags    = tagsEl && tagsEl.value
      ? tagsEl.value.split(',').map(function(t){return t.trim();}).filter(Boolean)
      : [];

    var ok = true;
    var titleErr   = document.getElementById('admin-title-error');
    var contentErr = document.getElementById('admin-content-error');
    var tokenErr   = document.getElementById('admin-token-error');
    var tokenInput = document.getElementById('admin-gh-token');

    if (!title) {
      if (titleErr) titleErr.style.display = 'block';
      if (titleEl)  titleEl.classList.add('error');
      ok = false;
    } else {
      if (titleErr) titleErr.style.display = 'none';
      if (titleEl)  titleEl.classList.remove('error');
    }

    if (!content || (editorArea && editorArea.textContent.trim() === '')) {
      if (contentErr) contentErr.style.display = 'block';
      ok = false;
    } else {
      if (contentErr) contentErr.style.display = 'none';
    }

    if (!token) {
      if (tokenErr)   tokenErr.style.display = 'block';
      if (tokenInput) tokenInput.classList.add('error');
      ok = false;
    } else {
      if (tokenErr)   tokenErr.style.display = 'none';
      if (tokenInput) tokenInput.classList.remove('error');
    }

    if (!ok) return;

    publishBtn.textContent = 'Publicando...';
    publishBtn.disabled    = true;
    setStatus('Conectando ao GitHub...', 'info');

    fetchPosts(token)
      .then(function (data) {
        var newPost = { id: Date.now(), title: title, content: content, tags: tags, date: new Date().toISOString() };
        return savePosts([newPost].concat(data.posts), data.sha, token);
      })
      .then(function () {
        setStatus('✅ Post publicado com sucesso!', 'success');
        if (titleEl)  titleEl.value = '';
        if (tagsEl)   tagsEl.value  = '';
        if (editorArea) editorArea.innerHTML = '';
      })
      .catch(function () {
        setStatus('❌ Erro ao publicar. Verifique o token.', 'error');
        if (tokenErr)   tokenErr.style.display = 'block';
        if (tokenInput) tokenInput.classList.add('error');
      })
      .finally(function () {
        publishBtn.textContent = 'Publicar →';
        publishBtn.disabled    = false;
      });
  });

});
