(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const nav = document.querySelector('.site-nav');
  const toggle = document.querySelector('.nav-toggle');
  const links = document.getElementById('site-navigation');
  const setOpen = (open) => {
    if (!toggle || !links) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.replaceChildren(document.createTextNode(open ? 'Cerrar' : 'Menú'));
    const icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = open ? '−' : '+';
    toggle.append(icon);
    links.classList.toggle('is-open', open);
  };
  toggle?.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  links?.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('click', e => { if (nav && !nav.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
  });
  matchMedia('(max-width: 900px)').addEventListener('change', () => setOpen(false));
  // All content remains visible without JavaScript or with reduced motion.
  const reveal = [...document.querySelectorAll('.eco-card-link, .format-card, .featured-card, .section-heading, .eco-header, .hero-stats')];
  if (!reduced.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, {threshold: .06, rootMargin: '0px 0px 40px 0px'});
    document.documentElement.classList.add('js-motion');
    reveal.forEach(item => { item.classList.add('fade-in'); observer.observe(item); });
    reduced.addEventListener('change', () => { if (reduced.matches) { document.documentElement.classList.remove('js-motion'); observer.disconnect(); } });
  }
  const navLinks = [...document.querySelectorAll('.nav-links a')];
  const sections = navLinks.map(link => {
    const url = new URL(link.href, location.href);
    return url.pathname === location.pathname && url.hash ? { link, element: document.getElementById(url.hash.slice(1)) } : null;
  }).filter(item => item?.element);
  let frame = 0;
  const updatePosition = () => {
    frame = 0;
    const total = document.documentElement.scrollHeight - innerHeight;
    document.documentElement.style.setProperty('--progress', String(total > 0 ? Math.max(0, Math.min(1, scrollY / total)) : 0));
    if (!sections.length) return;
    const passed = sections.filter(item => item.element.getBoundingClientRect().top <= innerHeight * .38);
    const current = passed.sort((a,b) => b.element.getBoundingClientRect().top - a.element.getBoundingClientRect().top)[0];
    sections.forEach(item => {
      if (item === current) item.link.setAttribute('aria-current', 'location');
      else item.link.removeAttribute('aria-current');
    });
  };
  addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(updatePosition); }, {passive:true});
  addEventListener('resize', updatePosition);
  updatePosition();
  // Details are progressively disclosed, with native buttons and complete keyboard support.
  document.querySelectorAll('.gc-services-grid > .gc-service-card').forEach((card, index) => {
    const heading = card.querySelector('h4');
    if (!heading) return;
    const details = document.createElement('div');
    details.id = `service-details-${index + 1}`;
    [...card.children].filter(child => child !== heading).forEach(child => details.append(child));
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'service-toggle';
    button.setAttribute('aria-controls', details.id);
    const label = document.createElement('span');
    label.className = 'service-label'; label.textContent = heading.textContent;
    const icon = document.createElement('span'); icon.setAttribute('aria-hidden','true');
    button.append(label,icon); heading.replaceChildren(button); card.append(details);
    const setExpanded = open => { button.setAttribute('aria-expanded', String(open)); details.hidden = !open; icon.textContent = open ? '−' : '+'; };
    setExpanded(index === 0);
    button.addEventListener('click', () => setExpanded(button.getAttribute('aria-expanded') !== 'true'));
  });
  // External destinations open safely; no event-based links or provisional live statuses.
  document.querySelectorAll('a[target="_blank"]').forEach(link => link.setAttribute('rel','noopener noreferrer'));
})();
