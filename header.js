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
      document.documentElement.classList.remove('no-scroll');
      nav.classList.remove('open');
    };

    const toggleMenu = () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('open', !open);
      document.documentElement.classList.toggle('no-scroll', !open);
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
  })
  .catch(err => console.error('Falha ao carregar header.html:', err));
