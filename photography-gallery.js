(() => {
  const gallery = document.querySelector('#photography-gallery');
  const previous = document.querySelector('[data-photo-prev]');
  const next = document.querySelector('[data-photo-next]');

  if (!gallery) return;

  const step = () => {
    const card = gallery.querySelector('.photography-card');
    if (!card) return gallery.clientWidth * 0.82;
    const styles = getComputedStyle(gallery);
    const gap = parseFloat(styles.columnGap || styles.gap || '20');
    return card.getBoundingClientRect().width + gap;
  };

  const move = (direction) => {
    gallery.scrollBy({
      left: step() * direction,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
  };

  previous?.addEventListener('click', () => move(-1));
  next?.addEventListener('click', () => move(1));

  gallery.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      move(-1);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      move(1);
    }
  });

  let dragging = false;
  let startX = 0;
  let startScroll = 0;

  gallery.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragging = true;
    startX = event.clientX;
    startScroll = gallery.scrollLeft;
    gallery.classList.add('is-dragging');
    gallery.setPointerCapture(event.pointerId);
  });

  gallery.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    gallery.scrollLeft = startScroll - (event.clientX - startX) * 1.1;
  });

  const stop = (event) => {
    if (!dragging) return;
    dragging = false;
    gallery.classList.remove('is-dragging');
    if (gallery.hasPointerCapture(event.pointerId)) gallery.releasePointerCapture(event.pointerId);
  };

  gallery.addEventListener('pointerup', stop);
  gallery.addEventListener('pointercancel', stop);
  gallery.addEventListener('lostpointercapture', () => {
    dragging = false;
    gallery.classList.remove('is-dragging');
  });
})();
