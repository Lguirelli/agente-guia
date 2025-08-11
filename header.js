// injeta o header
fetch('header.html')
  .then(r => r.text())
  .then(html => {
    const mount = document.getElementById('site-header');
    mount.innerHTML = html;

    // ativa o hamburguer
    const btn = mount.querySelector('.menu-toggle');
    const nav = mount.querySelector('#site-menu');

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
  });
