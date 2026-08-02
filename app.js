const header = document.querySelector('.site-header');
const menu = document.querySelector('.menu');
const nav = document.querySelector('.nav');

if (header) {
  window.addEventListener(
    'scroll',
    () => header.classList.toggle('compact', window.scrollY > 20),
    { passive: true }
  );
}

if (menu && nav) {
  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
    });
  });
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const storedMotion = localStorage.getItem('portfolio-motion');

if (storedMotion === 'off' || (storedMotion === null && prefersReducedMotion.matches)) {
  document.body.classList.add('motion-off');
}

document.body.classList.add('enhanced-ready');

const motionToggle = document.createElement('button');
motionToggle.type = 'button';
motionToggle.className = 'motion-toggle';
motionToggle.setAttribute('aria-label', 'Toggle enhanced transitions');
document.body.appendChild(motionToggle);

const updateMotionToggle = () => {
  const motionOff = document.body.classList.contains('motion-off');
  motionToggle.textContent = motionOff ? 'Motion: off' : 'Motion: on';
  motionToggle.setAttribute('aria-pressed', String(!motionOff));
  motionToggle.title = motionOff
    ? 'Enable the optional interactive transitions'
    : 'Return to the simpler static presentation';
};

updateMotionToggle();

motionToggle.addEventListener('click', () => {
  const motionOff = document.body.classList.toggle('motion-off');
  localStorage.setItem('portfolio-motion', motionOff ? 'off' : 'on');
  document.querySelectorAll('.fade').forEach((element) => element.classList.add('visible'));
  document.querySelectorAll('[data-tilt]').forEach((element) => {
    element.style.removeProperty('transform');
  });
  updateMotionToggle();
});

const fadeElements = document.querySelectorAll('.fade');

if ('IntersectionObserver' in window && !document.body.classList.contains('motion-off')) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  fadeElements.forEach((element) => observer.observe(element));
} else {
  fadeElements.forEach((element) => element.classList.add('visible'));
}

const track = document.querySelector('.gallery-track');

if (track) {
  let index = 0;
  const cards = [...track.children];

  const move = () => {
    const card = cards[0];
    if (!card) return;

    const gap = 18;
    const step = card.getBoundingClientRect().width + gap;
    const visibleCards = Math.max(1, Math.floor(track.parentElement.clientWidth / step));
    const max = Math.max(0, cards.length - visibleCards);
    index = Math.min(index, max);
    track.style.transform = `translateX(${-index * step}px)`;
  };

  document.querySelector('[data-next]')?.addEventListener('click', () => {
    index = Math.min(index + 1, cards.length - 1);
    move();
  });

  document.querySelector('[data-prev]')?.addEventListener('click', () => {
    index = Math.max(0, index - 1);
    move();
  });

  window.addEventListener('resize', move);
}

const finePointer = window.matchMedia('(pointer: fine)');

if (finePointer.matches) {
  document.querySelectorAll('[data-tilt]:not(.cover-photo-stack)').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      if (document.body.classList.contains('motion-off')) return;

      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const parentSurface = element.closest('.interactive-surface');

      element.style.transform = `perspective(900px) rotateX(${-y * 2.2}deg) rotateY(${x * 2.2}deg)`;

      if (parentSurface) {
        parentSurface.style.setProperty('--pointer-x', `${(x + 0.5) * 100}%`);
        parentSurface.style.setProperty('--pointer-y', `${(y + 0.5) * 100}%`);
      }
    });

    element.addEventListener('pointerleave', () => {
      element.style.removeProperty('transform');
    });
  });
}

document.querySelectorAll('[data-year]').forEach((element) => {
  element.textContent = new Date().getFullYear();
});
