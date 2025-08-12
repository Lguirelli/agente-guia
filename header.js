// injeta o header e ativa o dropdown responsivo + acessibilidade
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

    // Elementos focáveis dentro do menu (para trap de foco)
    const getFocusable = () =>
      Array.from(nav.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])'))
        .filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));

    const lockScroll = (on) => {
      document.documentElement.classList.toggle('no-scroll', on);
      document.body.classList.toggle('no-scroll', on);
    };

    let trapHandler = null;

    const enableFocusTrap = () => {
      const focusables = getFocusable();
      if (focusables.length === 0) return;

      // Garante foco inicial no primeiro link do menu
      requestAnimationFrame(() => focusables[0].focus());

      trapHandler = (e) => {
        if (e.key !== 'Tab') return;
        const items = getFocusable();
        if (items.length === 0) return;

        const first = items[0];
        const last = items[items.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      };

      mount.addEventListener('keydown', trapHandler);
    };

    const disableFocusTrap = () => {
      if (trapHandler) {
        mount.removeEventListener('keydown', trapHandler);
        trapHandler = null;
      }
    };

    const applyState = (isOpen) => {
      // Alterna estado visual/ARIA do botão
      btn.classList.toggle('is-open', isOpen);
      btn.setAttribute('aria-expanded', String(isOpen));
      btn.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');

      if (mqDesktop.matches) {
        // Desktop: menu sempre visível
        nav.classList.remove('open');
        nav.hidden = false;
        lockScroll(false);
        disableFocusTrap();
      } else {
        // Mobile: controla visibilidade
        nav.classList.toggle('open', isOpen);
        nav.hidden = !isOpen;
        lockScroll(isOpen);
        if (isOpen) enableFocusTrap(); else disableFocusTrap();
      }
    };

    const toggleMenu = () => applyState(!btn.classList.contains('is-open'));
    const closeMenu = () => applyState(false);

    // Clique no botão hamburguer
    btn.addEventListener('click', toggleMenu);

    // Fecha ao clicar em link (somente no mobile)
    nav.addEventListener('click', (e) => {
      if (!mqDesktop.matches && e.target.closest('a')) closeMenu();
    });

    // Fecha com tecla ESC
    mount.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    // Clique fora do menu no mobile fecha
    document.addEventListener('click', (e) => {
      if (mqDesktop.matches) return;
      const inside = e.target.closest('#site-menu, .menu-toggle');
      if (!inside && btn.classList.contains('is-open')) closeMenu();
    });

    // Reage à mudança de viewport
    mqDesktop.addEventListener('change', () => {
      if (mqDesktop.matches) {
        // Desktop: ícone fechado, menu visível
        btn.classList.remove('is-open');
        nav.hidden = false;
        lockScroll(false);
        disableFocusTrap();
      } else {
        // Mobile: menu fechado inicialmente
        closeMenu();
      }
    });

    // Fecha quando trocar o hash (ex.: navegação de âncoras)
    window.addEventListener('hashchange', () => {
      if (!mqDesktop.matches && btn.classList.contains('is-open')) closeMenu();
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
