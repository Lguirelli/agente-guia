// injeta o header e ativa o dropdown responsivo
fetch('header.html')
  .then(r => r.text())
  .then(html => {
    const mount = document.getElementById('site-header');
    if (!mount) {
      console.error('Elemento #site-header não encontrado.');
      return;
    }

    mount.innerHTML = html;

    const btn = mount.querySelector('.menu-toggle');
    const nav = mount.querySelector('#site-menu');
    if (!btn || !nav) {
      console.error('menu-toggle ou #site-menu não encontrados dentro do header.');
      return;
    }

    // Breakpoint alinhado ao CSS: mobile <= 860px
    const mqDesktop = window.matchMedia('(min-width: 861px)');

    const lockScroll = (on) => {
      document.documentElement.classList.toggle('no-scroll', on);
      document.body.classList.toggle('no-scroll', on);
    };

    const applyState = (isOpen) => {
      // Alterna classe para animação do hambúrguer → X
      btn.classList.toggle('is-open', isOpen);
      btn.setAttribute('aria-expanded', String(isOpen));
      btn.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');

      if (mqDesktop.matches) {
        // No desktop o menu é sempre visível, sem .open
        nav.classList.remove('open');
        nav.hidden = false;
        lockScroll(false);
      } else {
        // No mobile controlamos via .open + hidden
        nav.classList.toggle('open', isOpen);
        nav.hidden = !isOpen;
        lockScroll(isOpen);
      }
    };

    const toggleMenu = () => {
      const isOpen = !btn.classList.contains('is-open');
      applyState(isOpen);
    };

    const closeMenu = () => applyState(false);

    // Evento clique no botão hamburguer
    btn.addEventListener('click', toggleMenu);

    // Fecha ao clicar em link (somente no mobile)
    nav.addEventListener('click', (e) => {
      if (!mqDesktop.matches && e.target.closest('a')) {
        closeMenu();
      }
    });

    // Fecha com tecla ESC
    mount.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    // Clique fora do menu no mobile fecha
    document.addEventListener('click', (e) => {
      if (mqDesktop.matches) return;
      const inside = e.target.closest('#site-menu, .menu-toggle');
      if (!inside && btn.classList.contains('is-open')) {
        closeMenu();
      }
    });

    // Reage à mudança de viewport
    mqDesktop.addEventListener('change', () => {
      if (mqDesktop.matches) {
        // Desktop: ícone fechado, menu visível
        btn.classList.remove('is-open');
        nav.hidden = false;
        lockScroll(false);
      } else {
        // Mobile: menu fechado inicialmente
        closeMenu();
      }
    });

    // Estado inicial conforme viewport
    if (mqDesktop.matches) {
      btn.classList.remove('is-open');
      nav.hidden = false;
      lockScroll(false);
    } else {
      closeMenu();
    }
  })
  .catch(err => console.error('Falha ao carregar header.html:', err));
