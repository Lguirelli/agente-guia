// injeta o header e ativa o dropdown responsivo
fetch('header.html')
  .then(r => r.text())
  .then(html => {
    const mount = document.getElementById('site-header');
    if (!mount) { console.error('Elemento #site-header não encontrado.'); return; }

    mount.innerHTML = html;

    const btn = mount.querySelector('.menu-toggle');
    const nav = mount.querySelector('#site-menu');
    if (!btn || !nav) { console.error('menu-toggle ou #site-menu não encontrados dentro do header.'); return; }

    // Breakpoint alinhado ao CSS: mobile <= 860px
    const mqDesktop = window.matchMedia('(min-width: 861px)');

    const lockScroll = (on) => {
      document.documentElement.classList.toggle('no-scroll', on);
      document.body.classList.toggle('no-scroll', on);
    };

    const applyState = (isOpen) => {
      // Ícone (3 barras ↔ X)
      btn.classList.toggle('is-open', isOpen);
      btn.setAttribute('aria-expanded', String(isOpen));
      btn.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');

      // Menu (no mobile, usamos a classe .open do seu CSS)
      if (mqDesktop.matches) {
        nav.classList.remove('open'); // desktop: menu já é visível pelo CSS
        lockScroll(false);
      } else {
        nav.classList.toggle('open', isOpen);
        lockScroll(isOpen);
      }
    };

    const toggleMenu = () => {
      const isOpen = !btn.classList.contains('is-open');
      applyState(isOpen);
    };

    const closeMenu = () => applyState(false);

    // Eventos
    btn.addEventListener('click', toggleMenu);

    // fecha ao clicar em link (somente no mobile)
    nav.addEventListener('click', (e) => {
      if (!mqDesktop.matches && e.target.closest('a')) closeMenu();
    });

    // fecha com ESC
    mount.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

    // clique fora fecha (mobile)
    document.addEventListener('click', (e) => {
      if (mqDesktop.matches) return;
      const inside = e.target.closest('#site-menu, .menu-toggle');
      if (!inside && btn.classList.contains('is-open')) closeMenu();
    });

    // reage à mudança de viewport
    mqDesktop.addEventListener('change', () => {
      // ao entrar no desktop, garante menu “normal” e ícone fechado
      if (mqDesktop.matches) { btn.classList.remove('is-open'); applyState(false); }
    });

    // estado inicial: desktop “normal”, mobile fechado
    if (mqDesktop.matches) { btn.classList.remove('is-open'); applyState(false); }
    else { closeMenu(); }
  })
  .catch(err => console.error('Falha ao carregar header.html:', err));
