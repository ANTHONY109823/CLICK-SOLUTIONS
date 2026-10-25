/**
 * Carruseles accesibles y reutilizables.
 *
 * El contenido sigue siendo HTML normal (visible sin JavaScript). Cuando el navegador
 * carga, los controles mueven la pista con suavidad y el avance automático se pausa
 * al interactuar, cambiar de pestaña o preferir movimiento reducido.
 */
export function initCarousels() {
  document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((carousel) => {
    if (carousel.dataset.carouselReady === 'true') return;

    const track = carousel.querySelector<HTMLElement>('[data-carousel-track]');
    const previous = carousel.querySelector<HTMLButtonElement>('[data-carousel-prev]');
    const next = carousel.querySelector<HTMLButtonElement>('[data-carousel-next]');
    const status = carousel.querySelector<HTMLElement>('[data-carousel-status]');
    if (!track || !previous || !next) return;

    carousel.dataset.carouselReady = 'true';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const autoplayDelay = Number(carousel.dataset.carouselAutoplay || 0);
    let activeIndex = 0;
    let timer: number | undefined;
    let scrollFrame = 0;

    const items = () =>
      [...track.querySelectorAll<HTMLElement>('[data-carousel-item]')].filter((item) => !item.hidden);

    const hasOverflow = () => track.scrollWidth > track.clientWidth + 4;

    const update = () => {
      const visibleItems = items();
      if (visibleItems.length === 0) {
        previous.disabled = true;
        next.disabled = true;
        if (status) status.textContent = 'Sin resultados';
        return;
      }

      const nearest = visibleItems.reduce((best, item, index) => {
        const distance = Math.abs(item.offsetLeft - track.offsetLeft - track.scrollLeft);
        return distance < best.distance ? { index, distance } : best;
      }, { index: 0, distance: Number.POSITIVE_INFINITY });

      activeIndex = nearest.index;
      const movable = hasOverflow() && visibleItems.length > 1;
      previous.disabled = !movable;
      next.disabled = !movable;
      if (status) status.textContent = movable
        ? `${activeIndex + 1} de ${visibleItems.length}`
        : `${visibleItems.length} ${visibleItems.length === 1 ? 'opción' : 'opciones'}`;
    };

    const goTo = (index: number) => {
      const visibleItems = items();
      if (!visibleItems.length || !hasOverflow()) return;
      activeIndex = (index + visibleItems.length) % visibleItems.length;
      const target = visibleItems[activeIndex];
      track.scrollTo({
        left: target.offsetLeft - track.offsetLeft,
        behavior: reducedMotion.matches ? 'auto' : 'smooth',
      });
      if (status) status.textContent = `${activeIndex + 1} de ${visibleItems.length}`;
    };

    const stop = () => {
      if (timer !== undefined) window.clearInterval(timer);
      timer = undefined;
    };

    const start = () => {
      stop();
      if (!autoplayDelay || reducedMotion.matches || document.hidden || !hasOverflow()) return;
      timer = window.setInterval(() => goTo(activeIndex + 1), autoplayDelay);
    };

    previous.addEventListener('click', () => {
      goTo(activeIndex - 1);
      start();
    });
    next.addEventListener('click', () => {
      goTo(activeIndex + 1);
      start();
    });
    track.addEventListener('scroll', () => {
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = window.requestAnimationFrame(update);
    }, { passive: true });
    carousel.addEventListener('pointerenter', stop);
    carousel.addEventListener('pointerleave', start);
    carousel.addEventListener('focusin', stop);
    carousel.addEventListener('focusout', start);
    carousel.addEventListener('carousel:refresh', () => {
      activeIndex = 0;
      track.scrollTo({ left: 0, behavior: 'auto' });
      update();
      start();
    });
    window.addEventListener('resize', () => {
      update();
      start();
    }, { passive: true });
    document.addEventListener('visibilitychange', start);
    reducedMotion.addEventListener('change', start);

    update();
    start();
  });
}
