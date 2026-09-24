
// Magnify a stable row of logos with a smooth, distance-based falloff.
(() => {
  const dock = document.querySelector('.media-dock');
  if (!dock) return;
  const items = [...dock.querySelectorAll('a')];
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let pointer = null;
  const maximumScales = new WeakMap();
  const measureLogos = () => {
    const compact = matchMedia('(max-width: 900px)').matches;
    const boxes = items.map(item => item.getBoundingClientRect());
    // A common visible bounding size, excluding each PNG's transparent padding.
    const targetSize = Math.min(...boxes.map(box => Math.min(box.width, box.height))) * (compact ? 1.2 : 1.5);
    items.forEach((item, index) => {
      const img = item.querySelector('img');
      if (!img.naturalWidth || !img.naturalHeight || !img.clientWidth || !img.clientHeight) return;
      const fit = Math.min(img.clientWidth / img.naturalWidth, img.clientHeight / img.naturalHeight);
      const visibleSize = Math.max(Number(img.dataset.inkWidth), Number(img.dataset.inkHeight)) * fit;
      const maximumScale = Math.min(compact ? 1.18 : 1.32, Math.max(1.18, targetSize / visibleSize));
      maximumScales.set(item, maximumScale);
      item.style.setProperty('--dock-max-scale', maximumScale.toFixed(5));
      // Scale around the actual logo's center, not the center of its padding.
      const centerX = (img.clientWidth - img.naturalWidth * fit) / 2 + Number(img.dataset.inkX) * fit;
      const centerY = (img.clientHeight - img.naturalHeight * fit) / 2 + Number(img.dataset.inkY) * fit;
      img.style.transformOrigin = `${centerX}px ${centerY}px`;
    });
  };
  const reset = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    pointer = null;
    items.forEach(item => {
      item.style.removeProperty('--dock-scale');
      item.style.removeProperty('--dock-opacity');
      item.style.removeProperty('z-index');
    });
  };
  const render = () => {
    frame = 0;
    if (!pointer) return;
    const compact = matchMedia('(max-width: 900px)').matches;
    // Measure the unscaled links so magnification never moves its own target.
    const boxes = items.map(item => item.getBoundingClientRect());
    boxes.forEach((box, index) => {
      const dx = Math.max(box.left - pointer.x, 0, pointer.x - box.right);
      const dy = Math.max(box.top - pointer.y, 0, pointer.y - box.bottom);
      const radius = Math.max(80, box.width * 1.15);
      const distance = Math.hypot(dx, dy);
      const proximity = Math.max(0, 1 - distance / radius);
      const weight = proximity * proximity * (3 - 2 * proximity);
      items[index].style.setProperty('--dock-scale', (1 + ((maximumScales.get(items[index]) || 1) - 1) * weight).toFixed(5));
      items[index].style.setProperty('--dock-opacity', (0.85 + 0.15 * weight).toFixed(4));
      items[index].style.zIndex = String(Math.round(weight * 100));
    });
  };
  const surface = dock.closest('.media-slide-container') || dock;
  surface.addEventListener('pointermove', event => {
    if (!finePointer.matches || reducedMotion.matches || event.pointerType === 'touch') return;
    pointer = { x: event.clientX, y: event.clientY };
    if (!frame) frame = requestAnimationFrame(render);
  });
  surface.addEventListener('pointerleave', reset);
  surface.addEventListener('pointercancel', reset);
  window.addEventListener('blur', reset);
  window.addEventListener('resize', () => { reset(); measureLogos(); });
  window.addEventListener('scroll', reset, { passive: true });
  finePointer.addEventListener('change', reset);
  reducedMotion.addEventListener('change', reset);
  items.forEach(item => item.querySelector('img').addEventListener('load', measureLogos));
  new ResizeObserver(() => { reset(); measureLogos(); }).observe(dock);
  measureLogos();
})();
