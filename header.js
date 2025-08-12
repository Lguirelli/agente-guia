// injeta o header e ativa o dropdown responsivo (agora também no desktop)
fetch('header.html')
  .then(r => r.text())
  .then(html => {
    const mount = document.getElementById('site-header');
    if (!mount) { console.error('Elemento #site-header não encontrado.'); return; }

    mount.innerHTML = html;

    const btn = mount.querySelector('.menu-toggle');
    const nav = mount.querySelector('#site-menu');
    if (!btn || !nav) { console.error('menu-toggle ou #site-menu não encontrados dentro do header.'); return; }

    // Mobile é até 860px — só para decidir bloquear scroll
    const mqMobile = window.matchMedia('(max-width: 860px)');

    const lockScroll = (on) => {
      const shouldLock = on && mqMobile.matches;
      document.documentElement.classList.toggle('no-scroll', shouldLock);
      document.body.classList.toggle('no-scroll', shouldLock);
    };

    const applyState = (isOpen) => {
      btn.classList.toggle('is-open', isOpen);
      btn.setAttribute('aria-expanded', String(isOpen));
      btn.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');

      nav.classList.toggle('open', isOpen);
      nav.hidden = !isOpen;

      lockScroll(isOpen);
    };

    const toggleMenu = () => applyState(!btn.classList.contains('is-open'));
    const closeMenu = () => applyState(false);

    btn.addEventListener('click', toggleMenu);

    // fecha ao clicar em link
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) closeMenu();
    });

    // fecha com ESC
    mount.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

    // clique fora fecha
    document.addEventListener('click', (e) => {
      const inside = e.target.closest('#site-menu, .menu-toggle');
      if (!inside && btn.classList.contains('is-open')) closeMenu();
    });

    // mudança de viewport: só reavalia bloqueio de scroll
    mqMobile.addEventListener('change', () => lockScroll(btn.classList.contains('is-open')));

    // começa fechado
    closeMenu();
  })
  .catch(err => console.error('Falha ao carregar header.html:', err));
