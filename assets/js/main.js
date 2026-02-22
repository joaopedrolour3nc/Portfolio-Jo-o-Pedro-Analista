/* ============================================================
   main.js — Tema, menu mobile, admin modal
   ============================================================ */

/* ---- Tema: aplica antes do render para evitar flash ---- */
function updateToggleIcon(theme) {
  document.querySelectorAll('.theme-toggle__knob').forEach(function(k) {
    k.textContent = theme === 'dark' ? '🌙' : '☀️';
  });
}
var _savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', _savedTheme);

/* ============================================================
   CONFIG GLOBAL (usada pelo admin)
   ============================================================ */
var REPO_OWNER = 'joaopedrolour3nc';
var REPO_NAME  = 'Portfolio-Jo-o-Pedro-Analista';
var DATA_FILE  = 'data.json';
var BRANCH     = 'main';
var API_BASE   = 'https://api.github.com/repos/' + REPO_OWNER + '/' + REPO_NAME + '/contents/' + DATA_FILE;
var ADMIN_PASS = '121246';

document.addEventListener('DOMContentLoaded', function() {

  /* ---- Ícone do tema ---- */
  updateToggleIcon(_savedTheme);
  document.querySelectorAll('.theme-toggle').forEach(function(btn) {
    btn.addEventListener('click', function() {
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
    navToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      var isOpen = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
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

  /* ---- Link ativo no nav ---- */
  var currentFile = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(function(link) {
    if (link.getAttribute('href') === currentFile) link.classList.add('active');
  });

  /* ---- Copyright ---- */
  document.querySelectorAll('.footer__year').forEach(function(el) {
    el.textContent = new Date().getFullYear();
  });

  /* ============================================================
     ADMIN MODAL — 5 cliques no nome abre o painel
     ============================================================ */
  var logoName   = document.querySelector('.header__logo-name');
  var clickCount = 0, clickTimer = null;

  if (logoName) {
    logoName.style.userSelect = 'none';
    logoName.addEventListener('click', function(e) {
      e.preventDefault();
      clickCount++;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(function(){ clickCount = 0; }, 2000);
      if (clickCount >= 5) { clickCount = 0; openAdminModal(); }
    });
  }

  /* ---- Injeta o HTML da modal se ainda não existe ---- */
  function ensureModal() {
    if (document.getElementById('admin-modal')) return;
    var div = document.createElement('div');
    div.innerHTML = ADMIN_MODAL_HTML;
    document.body.appendChild(div.firstElementChild);
    bindModalEvents();
  }

  var ADMIN_MODAL_HTML = '<div id="admin-modal" class="admin-modal" role="dialog" aria-modal="true" style="display:none;">' +
    '<div class="admin-modal__backdrop" id="admin-backdrop"></div>' +
    '<div class="admin-modal__box">' +
      '<button class="admin-modal__close" id="admin-modal-close" aria-label="Fechar">✕</button>' +
      '<span class="section__label">// acesso restrito</span>' +
      '<h2 class="admin-modal__title">Publicar conteúdo</h2>' +

      /* Tela de senha */
      '<div id="admin-login-view">' +
        '<div class="form__group" style="margin-top:20px;">' +
          '<label class="form__label" for="admin-pass-input">Senha</label>' +
          '<input class="form__input" type="password" id="admin-pass-input" placeholder="••••••" autocomplete="off"/>' +
          '<span class="form__error" id="admin-pass-error">Senha incorreta.</span>' +
        '</div>' +
        '<button class="btn btn--primary" id="admin-pass-btn" style="width:100%;justify-content:center;margin-top:4px;">Entrar →</button>' +
      '</div>' +

      /* Painel pós-login */
      '<div id="admin-panel-view" style="display:none;">' +

        /* Token */
        '<div class="form__group" style="margin-top:20px;">' +
          '<label class="form__label" for="admin-gh-token">Token GitHub <span style="color:var(--text-muted);font-size:0.62rem;">(não salvo)</span></label>' +
          '<input class="form__input" type="password" id="admin-gh-token" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" autocomplete="off"/>' +
          '<span class="form__error" id="admin-token-error">Token inválido ou sem permissão.</span>' +
        '</div>' +

        /* Destino */
        '<div class="form__group">' +
          '<label class="form__label">Publicar em</label>' +
          '<div class="admin-dest-tabs">' +
            '<button type="button" class="admin-dest-tab admin-dest-tab--active" data-dest="blog">✍️ Blog</button>' +
            '<button type="button" class="admin-dest-tab" data-dest="projects">📁 Projetos</button>' +
            '<button type="button" class="admin-dest-tab" data-dest="both">✦ Ambos</button>' +
          '</div>' +
        '</div>' +

        /* Campos comuns */
        '<div class="form__group">' +
          '<label class="form__label" for="admin-post-title">Título *</label>' +
          '<input class="form__input" type="text" id="admin-post-title" placeholder="Título"/>' +
          '<span class="form__error" id="admin-title-error">Informe o título.</span>' +
        '</div>' +
        '<div class="form__group">' +
          '<label class="form__label" for="admin-post-tags">Tags <span style="color:var(--text-muted);font-size:0.62rem;">(vírgula)</span></label>' +
          '<input class="form__input" type="text" id="admin-post-tags" placeholder="SQL, Python, Power BI"/>' +
        '</div>' +

        /* Campos exclusivos de projetos */
        '<div id="admin-project-fields" style="display:none;">' +
          '<div class="form__row">' +
            '<div class="form__group">' +
              '<label class="form__label" for="admin-proj-stack">Stack <span style="color:var(--text-muted);font-size:0.62rem;">(vírgula)</span></label>' +
              '<input class="form__input" type="text" id="admin-proj-stack" placeholder="Python, SQL, Power BI"/>' +
            '</div>' +
            '<div class="form__group">' +
              '<label class="form__label" for="admin-proj-data">Data <span style="color:var(--text-muted);font-size:0.62rem;">(MM-AAAA ou DD-MM-AAAA)</span></label>' +
              '<input class="form__input" type="text" id="admin-proj-data" placeholder="02-2026"/>' +
            '</div>' +
          '</div>' +
          '<div class="form__row">' +
            '<div class="form__group">' +
              '<label class="form__label" for="admin-proj-github">Link GitHub</label>' +
              '<input class="form__input" type="url" id="admin-proj-github" placeholder="https://github.com/..."/>' +
            '</div>' +
            '<div class="form__group">' +
              '<label class="form__label" for="admin-proj-demo">Link Demo</label>' +
              '<input class="form__input" type="url" id="admin-proj-demo" placeholder="https://..."/>' +
            '</div>' +
          '</div>' +
          '<div class="form__row">' +
            '<div class="form__group">' +
              '<label class="form__label" for="admin-proj-imagem">Imagem <span style="color:var(--text-muted);font-size:0.62rem;">(emoji ou URL)</span></label>' +
              '<input class="form__input" type="text" id="admin-proj-imagem" placeholder="📊 ou https://..."/>' +
            '</div>' +
            '<div class="form__group" style="display:flex;align-items:flex-end;padding-bottom:2px;">' +
              '<label class="admin-check-label">' +
                '<input type="checkbox" id="admin-proj-destaque"/> Marcar como destaque' +
              '</label>' +
            '</div>' +
          '</div>' +
        '</div>' +

        /* Campo de descrição curta (só projetos) */
        '<div id="admin-desc-field" class="form__group" style="display:none;">' +
          '<label class="form__label" for="admin-proj-desc">Descrição curta *</label>' +
          '<textarea class="form__textarea" id="admin-proj-desc" placeholder="Resumo do projeto..." style="min-height:80px;"></textarea>' +
          '<span class="form__error" id="admin-desc-error">Informe a descrição.</span>' +
        '</div>' +

        /* Editor rico (blog / ambos) */
        '<div id="admin-editor-field" class="form__group">' +
          '<label class="form__label" for="admin-post-content">Conteúdo *</label>' +
          '<div class="editor-toolbar editor-toolbar--sm">' +
            '<button type="button" class="editor-btn" data-acmd="bold"><b>B</b></button>' +
            '<button type="button" class="editor-btn" data-acmd="italic"><i>I</i></button>' +
            '<button type="button" class="editor-btn" data-acmd="h2">H2</button>' +
            '<button type="button" class="editor-btn" data-acmd="h3">H3</button>' +
            '<button type="button" class="editor-btn" data-acmd="ul">• Lista</button>' +
            '<button type="button" class="editor-btn" data-acmd="code">&lt;/&gt;</button>' +
            '<button type="button" class="editor-btn" data-acmd="blockquote">❝</button>' +
          '</div>' +
          '<div id="admin-post-content" class="editor-area editor-area--sm" contenteditable="true" data-placeholder="Escreva o conteúdo aqui..."></div>' +
          '<span class="form__error" id="admin-content-error">Escreva o conteúdo.</span>' +
        '</div>' +

        '<div id="admin-publish-status" class="publish-status" style="display:none;margin-bottom:12px;"></div>' +

        '<div class="admin-actions">' +
          '<button class="btn btn--outline btn--sm" id="admin-clear-btn">Limpar</button>' +
          '<button class="btn btn--primary" id="admin-publish-btn">Publicar →</button>' +
        '</div>' +

        '<div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">' +
          '<a href="blog.html" class="btn btn--outline btn--sm">Ver blog →</a>' +
          '<button class="btn btn--outline btn--sm" id="admin-logout-btn" style="color:var(--text-muted);">Sair</button>' +
        '</div>' +
      '</div>' + /* /admin-panel-view */
    '</div>' + /* /admin-modal__box */
  '</div>'; /* /admin-modal */

  function openAdminModal() {
    ensureModal();
    var modal = document.getElementById('admin-modal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(function(){ var el = document.getElementById('admin-pass-input'); if(el) el.focus(); }, 100);
  }

  function closeAdminModal() {
    var modal = document.getElementById('admin-modal');
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
    showAdminView('login');
    var inp = document.getElementById('admin-pass-input');
    if (inp) inp.value = '';
    setAdminStatus('','');
  }

  function showAdminView(view) {
    var lv = document.getElementById('admin-login-view');
    var pv = document.getElementById('admin-panel-view');
    if (!lv || !pv) return;
    lv.style.display = view === 'login' ? 'block' : 'none';
    pv.style.display = view === 'panel' ? 'block' : 'none';
  }

  function bindModalEvents() {

    /* Close */
    document.getElementById('admin-modal-close').addEventListener('click', closeAdminModal);
    document.getElementById('admin-backdrop').addEventListener('click', closeAdminModal);

    /* Login */
    var passBtn = document.getElementById('admin-pass-btn');
    var passInp = document.getElementById('admin-pass-input');
    var passErr = document.getElementById('admin-pass-error');

    function doLogin() {
      if (passInp.value === ADMIN_PASS) {
        passErr.style.display = 'none';
        passInp.classList.remove('error');
        showAdminView('panel');
      } else {
        passErr.style.display = 'block';
        passInp.classList.add('error');
        passInp.value = '';
        passInp.focus();
      }
    }
    passBtn.addEventListener('click', doLogin);
    passInp.addEventListener('keydown', function(e){ if(e.key==='Enter') doLogin(); });

    document.getElementById('admin-logout-btn').addEventListener('click', function(){
      showAdminView('login');
      if(passInp) passInp.value='';
    });

    /* ---- Abas de destino ---- */
    var currentDest = 'blog';
    document.querySelectorAll('.admin-dest-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        document.querySelectorAll('.admin-dest-tab').forEach(function(t){ t.classList.remove('admin-dest-tab--active'); });
        tab.classList.add('admin-dest-tab--active');
        currentDest = tab.dataset.dest;
        updateDestinationFields(currentDest);
      });
    });

    function updateDestinationFields(dest) {
      var projFields  = document.getElementById('admin-project-fields');
      var descField   = document.getElementById('admin-desc-field');
      var editorField = document.getElementById('admin-editor-field');

      if (dest === 'blog') {
        projFields.style.display  = 'none';
        descField.style.display   = 'none';
        editorField.style.display = 'block';
      } else if (dest === 'projects') {
        projFields.style.display  = 'block';
        descField.style.display   = 'block';
        editorField.style.display = 'none';
      } else { /* both */
        projFields.style.display  = 'block';
        descField.style.display   = 'block';
        editorField.style.display = 'block';
      }
    }

    /* ---- Editor rich text ---- */
    var editorArea = document.getElementById('admin-post-content');
    document.querySelectorAll('.editor-btn[data-acmd]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        if (editorArea) editorArea.focus();
        var cmd = btn.dataset.acmd;
        if      (cmd==='bold')       document.execCommand('bold');
        else if (cmd==='italic')     document.execCommand('italic');
        else if (cmd==='h2')         document.execCommand('formatBlock',false,'h2');
        else if (cmd==='h3')         document.execCommand('formatBlock',false,'h3');
        else if (cmd==='ul')         document.execCommand('insertUnorderedList');
        else if (cmd==='blockquote') document.execCommand('formatBlock',false,'blockquote');
        else if (cmd==='code') {
          var sel = window.getSelection();
          if (sel && sel.toString()) document.execCommand('insertHTML',false,'<code>'+sel.toString()+'</code>');
        }
      });
    });

    /* ---- Limpar ---- */
    document.getElementById('admin-clear-btn').addEventListener('click', function() {
      if (!confirm('Limpar formulário?')) return;
      ['admin-post-title','admin-post-tags','admin-proj-stack','admin-proj-data',
       'admin-proj-github','admin-proj-demo','admin-proj-imagem','admin-proj-desc'].forEach(function(id){
        var el = document.getElementById(id); if(el) el.value='';
      });
      var dc = document.getElementById('admin-proj-destaque'); if(dc) dc.checked=false;
      if (editorArea) editorArea.innerHTML='';
      setAdminStatus('','');
    });

    /* ---- Status ---- */
    function setAdminStatus(msg, type) {
      var el = document.getElementById('admin-publish-status');
      if (!el) return;
      if (!msg) { el.style.display='none'; return; }
      el.style.display='block';
      el.className='publish-status publish-status--'+type;
      el.textContent=msg;
    }
    // expõe para uso externo
    window._setAdminStatus = setAdminStatus;

    /* ---- API GitHub ---- */
    function getToken(){ var el=document.getElementById('admin-gh-token'); return el?el.value.trim():''; }

    function fetchData(token) {
      var headers = { 'Accept':'application/vnd.github+json', 'Authorization':'Bearer '+token };
      return fetch(API_BASE+'?ref='+BRANCH+'&t='+Date.now(), {headers:headers})
        .then(function(r){ if(!r.ok) throw new Error('fetch'); return r.json(); })
        .then(function(d){
          var json = decodeURIComponent(escape(atob(d.content.replace(/\n/g,''))));
          return { data: JSON.parse(json), sha: d.sha };
        });
    }

    function saveData(data, sha, token) {
      var encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data,null,2))));
      return fetch(API_BASE, {
        method:'PUT',
        headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json','Accept':'application/vnd.github+json'},
        body: JSON.stringify({message:'update: '+new Date().toISOString(), content:encoded, sha:sha, branch:BRANCH})
      }).then(function(r){ if(!r.ok) throw new Error('save'); return r.json(); });
    }

    /* ---- Publicar ---- */
    document.getElementById('admin-publish-btn').addEventListener('click', function() {
      var token  = getToken();
      var title  = document.getElementById('admin-post-title').value.trim();
      var tagsEl = document.getElementById('admin-post-tags');
      var tags   = tagsEl && tagsEl.value ? tagsEl.value.split(',').map(function(t){return t.trim();}).filter(Boolean) : [];
      var content = editorArea ? editorArea.innerHTML.trim() : '';

      var ok = true;
      /* Validação token */
      var tokenErr = document.getElementById('admin-token-error');
      var tokenInp = document.getElementById('admin-gh-token');
      if (!token) { tokenErr.style.display='block'; tokenInp.classList.add('error'); ok=false; }
      else        { tokenErr.style.display='none';  tokenInp.classList.remove('error'); }
      /* Validação título */
      var titleErr = document.getElementById('admin-title-error');
      var titleInp = document.getElementById('admin-post-title');
      if (!title) { titleErr.style.display='block'; titleInp.classList.add('error'); ok=false; }
      else        { titleErr.style.display='none';  titleInp.classList.remove('error'); }
      /* Validação conteúdo (blog/both) */
      var contentErr = document.getElementById('admin-content-error');
      if ((currentDest==='blog'||currentDest==='both') && (!content || (editorArea&&editorArea.textContent.trim()===''))) {
        contentErr.style.display='block'; ok=false;
      } else { contentErr.style.display='none'; }
      /* Validação descrição (proj/both) */
      var descErr = document.getElementById('admin-desc-error');
      var descInp = document.getElementById('admin-proj-desc');
      if ((currentDest==='projects'||currentDest==='both') && descInp && !descInp.value.trim()) {
        descErr.style.display='block'; ok=false;
      } else if (descErr) { descErr.style.display='none'; }

      if (!ok) return;

      var publishBtn = document.getElementById('admin-publish-btn');
      publishBtn.textContent='Publicando...'; publishBtn.disabled=true;
      setAdminStatus('Conectando ao GitHub...','info');

      fetchData(token)
        .then(function(result) {
          var d = result.data; var sha = result.sha;

          if (currentDest==='blog'||currentDest==='both') {
            var post = { id:Date.now(), title:title, content:content, tags:tags, date:new Date().toISOString() };
            d.posts = [post].concat(d.posts||[]);
          }

          if (currentDest==='projects'||currentDest==='both') {
            var stackEl = document.getElementById('admin-proj-stack');
            var dataEl  = document.getElementById('admin-proj-data');
            var ghEl    = document.getElementById('admin-proj-github');
            var demoEl  = document.getElementById('admin-proj-demo');
            var imgEl   = document.getElementById('admin-proj-imagem');
            var destEl  = document.getElementById('admin-proj-destaque');
            var project = {
              id:           Date.now()+1,
              titulo:       title,
              descricaoCurta: descInp ? descInp.value.trim() : '',
              stack:        stackEl && stackEl.value ? stackEl.value.split(',').map(function(s){return s.trim();}).filter(Boolean) : [],
              data:         dataEl  ? dataEl.value.trim()  : '',
              links: {
                github: ghEl   && ghEl.value.trim()   ? ghEl.value.trim()   : null,
                demo:   demoEl && demoEl.value.trim()  ? demoEl.value.trim() : null,
              },
              imagem:   imgEl  ? imgEl.value.trim()   || null : null,
              tags:     tags,
              destaque: destEl ? destEl.checked : false,
            };
            d.projects = [project].concat(d.projects||[]);
          }

          return saveData(d, sha, token);
        })
        .then(function() {
          setAdminStatus('✅ Publicado com sucesso!','success');
          ['admin-post-title','admin-post-tags','admin-proj-stack','admin-proj-data',
           'admin-proj-github','admin-proj-demo','admin-proj-imagem','admin-proj-desc'].forEach(function(id){
            var el=document.getElementById(id); if(el) el.value='';
          });
          var dc=document.getElementById('admin-proj-destaque'); if(dc) dc.checked=false;
          if (editorArea) editorArea.innerHTML='';
        })
        .catch(function() {
          setAdminStatus('❌ Erro ao publicar. Verifique o token.','error');
          document.getElementById('admin-token-error').style.display='block';
          document.getElementById('admin-gh-token').classList.add('error');
        })
        .finally(function() {
          publishBtn.textContent='Publicar →'; publishBtn.disabled=false;
        });
    });
  }

  /* Fechar com Escape */
  document.addEventListener('keydown', function(e) {
    var modal=document.getElementById('admin-modal');
    if (e.key==='Escape' && modal && modal.style.display!=='none') closeAdminModal();
  });

});
