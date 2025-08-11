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

    const closeMenu = () => {
      btn.setAttribute('aria-expanded', 'false');
      btn.classList.remove('is-open');                 // ⬅ animação: volta para 3 barras
      btn.setAttribute('aria-label', 'Abrir menu');    // ⬅ acessibilidade (opcional)

      document.documentElement.classList.remove('no-scroll');
      nav.classList.remove('open');
      // Se usar [hidden] no mobile:
      // nav.hidden = true;                             // ⬅ opcional
    };

    const toggleMenu = () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      const next = !open;

      btn.setAttribute('aria-expanded', String(next));
      btn.classList.toggle('is-open', next);           // ⬅ animação: 3 barras ↔ X
      btn.setAttribute('aria-label', next ? 'Fechar menu' : 'Abrir menu'); // ⬅ opcional

      nav.classList.toggle('open', next);
      document.documentElement.classList.toggle('no-scroll', next);
      // Se usar [hidden] no mobile:
      // nav.hidden = !next;                            // ⬅ opcional
    };

    btn.addEventListener('click', toggleMenu);

    // fecha ao clicar num link
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

    // fecha com ESC
    mount.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

    // se redimensionar para desktop, garante menu fechado
    window.addEventListener('resize', () => {
      if (window.innerWidth > 860) closeMenu();
    });

    // estado inicial (mobile começa fechado)
    closeMenu(); // ⬅ garante que o botão e o menu comecem coerentes
  })
  .catch(err => console.error('Falha ao carregar header.html:', err));
