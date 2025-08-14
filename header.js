// injeta o header e ativa o dropdown (mobile e desktop)
fetch('header.html')
  .then(r => r.text())
  .then(html => {
    const mount = document.getElementById('site-header');
    if (!mount) { console.error('Elemento #site-header não encontrado.'); return; }

    mount.innerHTML = html;

    const btn = mount.querySelector('.menu-toggle');
    const nav = mount.querySelector('#site-menu');
    if (!btn || !nav) { console.error('menu-toggle ou #site-menu não encontrados dentro do header.'); return; }

    const mqMobile = window.matchMedia('(max-width: 860px)');

    const lockScroll = (on) => {
      const shouldLock = on && mqMobile.matches;
      document.documentElement.classList.toggle('no-scroll', shouldLock);
      document.body.classList.toggle('no-scroll', shouldLock);
    };

    function applyState(isOpen) {
      // Ícone (3 barras ↔ X)
      btn.classList.toggle('is-open', isOpen);
      btn.setAttribute('aria-expanded', String(isOpen));
      btn.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');

      // Mostrar/ocultar menu
      nav.classList.toggle('open', isOpen);

      // [hidden] só no mobile
      nav.hidden = mqMobile.matches ? !isOpen : false;

      lockScroll(isOpen);
    }

    const toggleMenu = () => applyState(!btn.classList.contains('is-open'));
    const closeMenu  = () => applyState(false);

    // eventos
    btn.addEventListener('click', toggleMenu);
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
    mount.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
    document.addEventListener('click', (e) => {
      const inside = e.target.closest('#site-menu, .menu-toggle');
      if (!inside && btn.classList.contains('is-open')) closeMenu();
    });

    // Reavaliar no resize
    mqMobile.addEventListener('change', () => {
      if (!mqMobile.matches) nav.hidden = false;
      lockScroll(btn.classList.contains('is-open'));
    });

    // Estado inicial
    applyState(false);
    if (!mqMobile.matches) nav.hidden = false;
  })
  .catch(err => console.error('Falha ao carregar header.html:', err));
