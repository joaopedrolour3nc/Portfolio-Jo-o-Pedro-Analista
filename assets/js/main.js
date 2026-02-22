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
