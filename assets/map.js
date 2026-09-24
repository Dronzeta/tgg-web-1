(() => {
  const tggData = {
      'AR-B': { media: 'Canal 8 · Ahora MDP · Mi8 · Canal 8 Stream · Vía Pública', section: 'ecosistema' },
      'AR-C': { media: 'Ahora Play · Streaming Nacional', section: 'ecosistema' },
      'AR-S': { media: 'Canal 9 · Ahora Litoral · Mi9 · El Heraldo · Radios', section: 'ecosistema' },
      'AR-E': { media: 'Canal 9 · El Día · Radio Plaza', section: 'ecosistema' },
      'AR-Q': { media: 'Canal 7 · Radio 7 · Stream 7 · Noticias 7', section: 'ecosistema' },
      'AR-R': { media: 'Canal 7 · C7 Neuquén · Noticias 7', section: 'ecosistema' }
    };
  const container = document.getElementById('argMap');
  const tooltip = document.getElementById('mapTooltip');
  if (!container || !tooltip) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const nodes = [...container.querySelectorAll('#argSvg path[id], .tgg-marker')];
  function show(node, event) {
    const id = node.dataset.id || node.id;
    const province = document.getElementById(id);
    const title = province?.getAttribute('title') || id;
    const data = tggData[id];
    const name = document.createElement('div'); name.className = 'tooltip-name'; name.textContent = title;
    tooltip.replaceChildren(name);
    if (data) { const detail = document.createElement('div'); detail.className = 'tooltip-media'; detail.textContent = data.media; tooltip.append(detail); }
    tooltip.classList.add('visible');
    const bounds = container.getBoundingClientRect();
    const nodeBounds = node.getBoundingClientRect();
    const x = event && Number.isFinite(event.clientX) ? event.clientX - bounds.left + 14 : nodeBounds.left - bounds.left;
    const y = event && Number.isFinite(event.clientY) ? event.clientY - bounds.top - 8 : nodeBounds.bottom - bounds.top + 8;
    tooltip.style.left = Math.max(0, Math.min(x, bounds.width - tooltip.offsetWidth)) + 'px';
    tooltip.style.top = Math.max(0, Math.min(y, bounds.height - tooltip.offsetHeight)) + 'px';
  }
  nodes.forEach(node => {
    const id = node.dataset.id || node.id;
    const data = tggData[id];
    node.addEventListener('mouseenter', e => show(node,e));
    node.addEventListener('mousemove', e => show(node,e));
    node.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
    if (!data) return;
    const name = document.getElementById(id)?.getAttribute('title') || id;
    node.setAttribute('tabindex','0'); node.setAttribute('role','link');
    node.setAttribute('aria-label',name + ': ' + data.media + '. Ver ecosistema');
    node.addEventListener('focus', () => show(node));
    node.addEventListener('blur', () => tooltip.classList.remove('visible'));
    const go = () => { document.getElementById(data.section)?.scrollIntoView({behavior: reduced.matches ? 'auto' : 'smooth', block:'start'}); tooltip.classList.remove('visible'); };
    node.addEventListener('click',go);
    node.addEventListener('keydown',e => { if (e.key==='Enter' || e.key===' ') { e.preventDefault(); go(); } });
  });
  document.addEventListener('keydown', e => { if(e.key==='Escape') tooltip.classList.remove('visible'); });
})();
