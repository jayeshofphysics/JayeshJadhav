(() => {
  'use strict';

  const deck = document.querySelector('[data-project-deck]');
  const scene = deck.querySelector('.td-scene');
  const cards = [...scene.querySelectorAll('.td-card')];
  const collection = deck.closest('.demo-collection');
  const choices = [...collection.querySelectorAll('.demo-categories button')];
  const counter = collection.querySelector('.deck-index');
  const title = collection.querySelector('.deck-caption h3');
  const detail = collection.querySelector('.deck-caption p');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  let position = 0;
  let destination = 0;
  let currentProject = -1;
  let cardHeight = 0;
  let animationFrame = 0;
  let lastFrame = 0;
  let wheelTimer;
  let pointer;
  let ignoreClick = false;

  const modulo = (value, size) => ((value % size) + size) % size;
  const withinUnit = value => Math.min(1, Math.max(0, value));

  function showCaption(index) {
    if (index === currentProject) return;

    currentProject = index;
    counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(choices.length).padStart(2, '0')}`;
    title.textContent = choices[index].textContent;
    detail.textContent = choices[index].dataset.description;
    for (const [choiceIndex, choice] of choices.entries()) {
      choice.setAttribute('aria-pressed', String(choiceIndex === index));
    }
  }

  function paint() {
    const front = Math.floor(position);
    const first = front - 2;
    const fraction = position - front;
    const advance = withinUnit((fraction - 0.28) / 0.6);
    const easeAdvance = advance ** 2 * (3 - 2 * advance);

    for (const [slot, card] of cards.entries()) {
      const index = first + modulo(slot - first, cards.length);
      const elapsed = position - index;
      const depth = Math.max(0, index - front - easeAdvance);
      const folded = elapsed >= 1;
      const folding = elapsed > 0 && !folded;
      let tilt = folded ? -90 : 0;

      if (folding) {
        const bounce = withinUnit((elapsed - 0.78) / 0.22);
        tilt = -90 * withinUnit(elapsed / 0.78) ** 3 + 6 * Math.sin(Math.PI * bounce) * (1 - bounce);
      }

      const visible = folded ? Number(elapsed < 3) : withinUnit(6 - depth);
      const lift = elapsed > 0 ? (index - front + 3) * 0.6 : 0;
      card.style.transform = `translate3d(0, ${-lift}px, ${-depth * cardHeight * 0.24}px) rotateX(${tilt}deg)`;
      card.style.visibility = visible ? 'visible' : 'hidden';
      card.style.opacity = visible;
      card.style.setProperty('--td-shade', -tilt / 1500);
    }

    showCaption(modulo(Math.round(position), choices.length));
  }

  function sizeDeck() {
    const width = deck.clientWidth;
    const height = deck.clientHeight;
    const maximumWidth = width * (width < 420 ? 0.76 : 0.655);
    cardHeight = Math.max(60, Math.min(maximumWidth / 2.06, height * 0.42, 620));
    const top = height / 2 - 0.62 * cardHeight;
    scene.style.perspective = `${6 * cardHeight}px`;
    scene.style.perspectiveOrigin = `50% ${top - 1.66 * cardHeight}px`;
    deck.style.setProperty('--td-w', `${2.06 * cardHeight}px`);
    deck.style.setProperty('--td-h', `${cardHeight}px`);
    deck.style.setProperty('--td-top', `${top}px`);
    paint();
  }

  function animate(timestamp) {
    const delta = lastFrame ? Math.min((timestamp - lastFrame) / 1000, 0.05) : 1 / 60;
    lastFrame = timestamp;
    position += (destination - position) * (1 - Math.exp(-delta * 9));

    if (Math.abs(destination - position) < 0.002) {
      position = destination;
      animationFrame = 0;
      lastFrame = 0;
    } else {
      animationFrame = requestAnimationFrame(animate);
    }
    paint();
  }

  function goTo(next) {
    const current = Math.round(position);
    destination = Math.max(current - 3, Math.min(current + 3, next));
    if (reducedMotion.matches) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      lastFrame = 0;
      position = destination = Math.round(destination);
      paint();
    } else if (!animationFrame) {
      animationFrame = requestAnimationFrame(animate);
    }
  }

  function step(amount) {
    goTo(Math.round(destination) + amount);
  }

  function snap(direction) {
    goTo(direction > 0 ? Math.floor(destination + 0.7) :
      direction < 0 ? Math.ceil(destination - 0.7) : Math.round(destination));
  }

  for (const [index, choice] of choices.entries()) {
    choice.addEventListener('click', () => {
      const current = Math.round(destination);
      const forward = modulo(index - current, choices.length);
      const offset = forward > choices.length / 2 ? forward - choices.length : forward;
      goTo(current + offset);
    });
  }

  deck.addEventListener('keydown', event => {
    const keys = {
      ArrowRight: 1, ArrowDown: 1, ' ': 1, Enter: 1, ArrowLeft: -1, ArrowUp: -1
    };
    if (event.key in keys) {
      event.preventDefault();
      step(keys[event.key]);
    } else if (event.key === 'Escape') {
      deck.blur();
    }
  });

  deck.addEventListener('wheel', event => {
    if (document.activeElement !== deck || event.ctrlKey) return;
    event.preventDefault();
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    const distance = delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? deck.clientHeight : 1);
    if (!distance) return;
    const direction = Math.sign(distance);
    clearTimeout(wheelTimer);
    if (reducedMotion.matches) {
      wheelTimer = setTimeout(() => step(direction), 100);
    } else {
      goTo(destination + distance / 240);
      wheelTimer = setTimeout(() => snap(direction), 140);
    }
  }, { passive: false });

  deck.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary) return;
    pointer = { id: event.pointerId, y: event.clientY, distance: 0, direction: 0 };
    ignoreClick = false;
    clearTimeout(wheelTimer);
  });

  deck.addEventListener('pointermove', event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const delta = pointer.y - event.clientY;
    pointer.y = event.clientY;
    pointer.distance += Math.abs(delta);
    if (delta) pointer.direction = Math.sign(delta);
    if (pointer.distance > 6 && !ignoreClick) {
      ignoreClick = true;
      deck.setPointerCapture(event.pointerId);
    }
    if (ignoreClick && !reducedMotion.matches) {
      goTo(destination + delta / (cardHeight * 1.1));
    }
  });

  function releasePointer(event) {
    if (!pointer || pointer.id !== event.pointerId) return;
    if (ignoreClick) {
      if (reducedMotion.matches) step(pointer.direction);
      else snap(pointer.direction);
    }
    pointer = null;
  }

  deck.addEventListener('pointerup', releasePointer);
  deck.addEventListener('pointercancel', releasePointer);
  deck.addEventListener('click', () => {
    if (!ignoreClick) step(1);
    ignoreClick = false;
  });
  reducedMotion.addEventListener('change', () => goTo(Math.round(destination)));

  sizeDeck();
  deck.dataset.ready = 'true';
  if ('ResizeObserver' in window) {
    new ResizeObserver(sizeDeck).observe(deck);
  } else {
    window.addEventListener('resize', sizeDeck);
  }
})();
