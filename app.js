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

if (prefersReducedMotion.matches) {
  document.body.classList.add('motion-off');
}

document.body.classList.add('enhanced-ready');

const fadeElements = document.querySelectorAll('.fade');

if ('IntersectionObserver' in window && !prefersReducedMotion.matches) {
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

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);

    if (existing) {
      if (existing.dataset.loaded === 'true') resolve();
      else existing.addEventListener('load', resolve, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true';
        resolve();
      },
      { once: true }
    );
    script.addEventListener('error', reject, { once: true });
    document.head.appendChild(script);
  });

const splitHeadingIntoCharacters = (heading) => {
  if (heading.dataset.scrollFloatReady === 'true') return;

  const accessibleText = heading.textContent.replace(/\s+/g, ' ').trim();
  if (accessibleText && !heading.hasAttribute('aria-label')) {
    heading.setAttribute('aria-label', accessibleText);
  }

  const textNodes = [];
  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node) {
    textNodes.push(node);
    node = walker.nextNode();
  }

  textNodes.forEach((textNode) => {
    if (!textNode.nodeValue) return;

    const fragment = document.createDocumentFragment();

    [...textNode.nodeValue].forEach((character) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = character === ' ' ? '\u00A0' : character;
      fragment.appendChild(span);
    });

    textNode.replaceWith(fragment);
  });

  heading.classList.add('scroll-float');
  heading.dataset.scrollFloatReady = 'true';
};

const initialiseScrollFloat = async () => {
  if (prefersReducedMotion.matches) return;

  const headings = document.querySelectorAll('.display-title, .section-title');
  if (!headings.length) return;

  try {
    await loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js');
    await loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js');

    const { gsap, ScrollTrigger } = window;
    if (!gsap || !ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    headings.forEach((heading) => {
      splitHeadingIntoCharacters(heading);
      const characters = heading.querySelectorAll('.char');

      gsap.fromTo(
        characters,
        {
          willChange: 'opacity, transform',
          opacity: 0,
          yPercent: 120,
          scaleY: 2.3,
          scaleX: 0.7,
          transformOrigin: '50% 0%'
        },
        {
          duration: 1,
          ease: 'back.inOut(2)',
          opacity: 1,
          yPercent: 0,
          scaleY: 1,
          scaleX: 1,
          stagger: 0.03,
          scrollTrigger: {
            trigger: heading,
            start: 'center bottom+=50%',
            end: 'bottom bottom-=40%',
            scrub: true
          }
        }
      );
    });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  } catch (error) {
    console.warn('ScrollFloat animation could not be loaded.', error);
  }
};

initialiseScrollFloat();

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

if (finePointer.matches && !prefersReducedMotion.matches) {
  document.querySelectorAll('[data-tilt]:not(.cover-photo-stack)').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
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
