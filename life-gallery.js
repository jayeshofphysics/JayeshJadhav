(() => {
  const gallery = document.querySelector('#life-gallery');
  const previous = document.querySelector('[data-life-prev]');
  const next = document.querySelector('[data-life-next]');

  if (!gallery) return;

  const loadGalleryImage = async () => {
    try {
      const response = await fetch('assets/life/life-sprite.jpg', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Image data request failed: ${response.status}`);

      const encoded = (await response.text()).replace(/\s+/g, '');
      const binary = atob(encoded);
      const bytes = new Uint8Array(binary.length);

      for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
      }

      const imageUrl = URL.createObjectURL(new Blob([bytes], { type: 'image/jpeg' }));
      gallery.querySelectorAll('.life-photo').forEach((photo) => {
        photo.style.backgroundImage = `url("${imageUrl}")`;
      });

      gallery.classList.add('images-ready');
      window.addEventListener('pagehide', () => URL.revokeObjectURL(imageUrl), { once: true });
    } catch (error) {
      console.error('Personal gallery photographs could not be loaded.', error);
      gallery.classList.add('images-failed');
    }
  };

  loadGalleryImage();

  const cardStep = () => {
    const card = gallery.querySelector('.life-card');
    if (!card) return gallery.clientWidth * 0.8;
    const styles = getComputedStyle(gallery);
    const gap = parseFloat(styles.columnGap || styles.gap || '18');
    return card.getBoundingClientRect().width + gap;
  };

  const move = (direction) => {
    gallery.scrollBy({
      left: cardStep() * direction,
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
    gallery.scrollLeft = startScroll - (event.clientX - startX) * 1.12;
  });

  const stopDragging = (event) => {
    if (!dragging) return;
    dragging = false;
    gallery.classList.remove('is-dragging');
    if (gallery.hasPointerCapture(event.pointerId)) gallery.releasePointerCapture(event.pointerId);
  };

  gallery.addEventListener('pointerup', stopDragging);
  gallery.addEventListener('pointercancel', stopDragging);
  gallery.addEventListener('lostpointercapture', () => {
    dragging = false;
    gallery.classList.remove('is-dragging');
  });
})();
