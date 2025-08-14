// injeta o header e ativa o dropdown (mobile e desktop) + fade out no scroll
fetch('header.html')
  .then(r => r.text())
  .then(html => {
    const mount = document.getElementById('site-header');
    if (!mount) { console.error('Elemento #site-header não encontrado.'); return; }

    mount.innerHTML = html;

    const header = mount.querySelector('.site-header') || mount; // fallback
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

      // Mostrar/ocultar via classe .open em TODAS as larguras
      nav.classList.toggle('open', isOpen);

      // Usar [hidden] só no mobile (evita conflito no desktop)
      nav.hidden = mqMobile.matches ? !isOpen : false;

      lockScroll(isOpen);

      // Se o menu abrir, garantir header totalmente visível (usabilidade)
      if (isOpen) {
        setHeaderOpacity(1);           // força opacidade 1
      } else {
        scheduleFadeUpdate();          // recalcula com base no scroll atual
      }
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

    // reavaliar quando trocar de viewport
    mqMobile.addEventListener('change', () => {
      if (!mqMobile.matches) nav.hidden = false; // no desktop, garantir que o [hidden] fique falso
      lockScroll(btn.classList.contains('is-open'));
      scheduleFadeUpdate();
    });

    // ===== Fade out no scroll =====
    const FADE_START = 0;    // px a partir do topo onde começa a reduzir
    const FADE_END   = 240;  // px onde o header fica totalmente transparente
    const OP_THRESHOLD = 0.01; // tolerância para considerar "100% transparente"

    let ticking = false;

    function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

    function setHeaderOpacity(op) {
      if (!header) return;
      const clamped = clamp(op, 0, 1);
      header.style.opacity = String(clamped);

      // Quando chegar a 0 (ou muito próximo), desativa cliques; caso contrário, reativa
      const isHidden = clamped <= OP_THRESHOLD;

      // Importante: ao abrir o menu, não deixamos o header "hidden"
      const forceVisible = btn.classList.contains('is-open'); // em qualquer viewport
      header.classList.toggle('is-hidden', !forceVisible && isHidden);
    }

    function computeOpacity(scrollY) {
      // Se menu aberto (mobile ou desktop): header sempre visível
      if (btn.classList.contains('is-open')) return 1;

      const t = clamp((scrollY - FADE_START) / (FADE_END - FADE_START), 0, 1);
      return 1 - t; // 1 → 0 conforme rola
    }

    function updateFade() {
      const y = window.scrollY || window.pageYOffset || 0;
      const op = computeOpacity(y);
      setHeaderOpacity(op);
      ticking = false;
    }

    function scheduleFadeUpdate() {
      if (!ticking) {
        requestAnimationFrame(updateFade);
        ticking = true;
      }
    }

    // listeners de scroll/resize
    window.addEventListener('scroll', scheduleFadeUpdate, { passive: true });
    window.addEventListener('resize', scheduleFadeUpdate);

    // estado inicial: fechado (removendo hidden no desktop) + aplica fade inicial
    applyState(false);
    if (!mqMobile.matches) nav.hidden = false;
    scheduleFadeUpdate();
  })
  .catch(err => console.error('Falha ao carregar header.html:', err));
