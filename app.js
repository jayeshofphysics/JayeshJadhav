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

const makeGalleryPlaceholder = (start, end, label) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${start}"/><stop offset="1" stop-color="${end}"/></linearGradient><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .13"/></feComponentTransfer></filter></defs><rect width="900" height="1200" fill="url(#g)"/><circle cx="650" cy="330" r="230" fill="rgba(255,255,255,.12)"/><rect width="900" height="1200" filter="url(#grain)" opacity=".5"/><text x="70" y="1080" fill="rgba(255,255,255,.82)" font-family="Arial,sans-serif" font-size="38" letter-spacing="7">${label.toUpperCase()}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const initialiseCurvedGallery = async () => {
  const container = document.querySelector('#hobby-gallery');
  if (!container || prefersReducedMotion.matches) return;

  try {
    const { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } = await import(
      'https://cdn.jsdelivr.net/npm/ogl@1.0.11/+esm'
    );

    const items = [
      {
        image: 'assets/photos/photo-01.jpg',
        fallback: makeGalleryPlaceholder('#48130f', '#ef6b3b', 'Notes on light'),
        text: 'Notes on light'
      },
      {
        image: 'assets/photos/photo-02.jpg',
        fallback: makeGalleryPlaceholder('#0d1837', '#557cff', 'Blue hour'),
        text: 'Blue hour'
      },
      {
        image: 'assets/photos/photo-03.jpg',
        fallback: makeGalleryPlaceholder('#11362e', '#85cba7', 'Quiet geometry'),
        text: 'Quiet geometry'
      },
      {
        image: 'assets/photos/photo-04.jpg',
        fallback: makeGalleryPlaceholder('#432e0b', '#dfb348', 'Human motion'),
        text: 'Human motion'
      },
      {
        image: 'assets/photos/photo-05.jpg',
        fallback: makeGalleryPlaceholder('#281536', '#a769e7', 'After colour'),
        text: 'After colour'
      },
      {
        image: 'assets/photos/photo-06.jpg',
        fallback: makeGalleryPlaceholder('#17212c', '#8096ad', 'Monsoon texture'),
        text: 'Monsoon texture'
      }
    ];

    const createTextTexture = (gl, text) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const font = '500 30px "Avenir Next", Avenir, "Helvetica Neue", Arial, sans-serif';
      context.font = font;
      const width = Math.ceil(context.measureText(text.toUpperCase()).width) + 54;
      canvas.width = width;
      canvas.height = 72;
      context.font = font;
      context.fillStyle = '#f4f2ed';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text.toUpperCase(), width / 2, 36);
      const texture = new Texture(gl, { generateMipmaps: false });
      texture.image = canvas;
      return { texture, width, height: canvas.height };
    };

    class GalleryMedia {
      constructor({ gl, geometry, scene, renderer, camera, data, index, length }) {
        this.gl = gl;
        this.geometry = geometry;
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;
        this.data = data;
        this.index = index;
        this.length = length;
        this.extra = 0;
        this.createImage();
      }

      createImage() {
        const texture = new Texture(this.gl, { generateMipmaps: true });
        const program = new Program(this.gl, {
          depthTest: false,
          depthWrite: false,
          transparent: true,
          vertex: `
            precision highp float;
            attribute vec3 position;
            attribute vec2 uv;
            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;
            uniform float uTime;
            uniform float uSpeed;
            varying vec2 vUv;
            void main() {
              vUv = uv;
              vec3 p = position;
              p.z += (sin(p.x * 3.5 + uTime) + cos(p.y * 2.0 + uTime)) * (0.045 + abs(uSpeed) * 0.13);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
            }
          `,
          fragment: `
            precision highp float;
            uniform vec2 uImageSizes;
            uniform vec2 uPlaneSizes;
            uniform sampler2D tMap;
            varying vec2 vUv;
            void main() {
              vec2 ratio = vec2(
                min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
                min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
              );
              vec2 uv = vec2(
                vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
                vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
              );
              gl_FragColor = texture2D(tMap, uv);
            }
          `,
          uniforms: {
            tMap: { value: texture },
            uPlaneSizes: { value: [1, 1] },
            uImageSizes: { value: [1, 1] },
            uSpeed: { value: 0 },
            uTime: { value: Math.random() * 100 }
          }
        });

        this.program = program;
        this.plane = new Mesh(this.gl, { geometry: this.geometry, program });
        this.plane.setParent(this.scene);

        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => {
          texture.image = image;
          program.uniforms.uImageSizes.value = [image.naturalWidth, image.naturalHeight];
        };
        image.onerror = () => {
          if (image.src !== this.data.fallback) image.src = this.data.fallback;
        };
        image.src = this.data.image;

        const titleData = createTextTexture(this.gl, this.data.text);
        const titleProgram = new Program(this.gl, {
          transparent: true,
          vertex: `
            attribute vec3 position;
            attribute vec2 uv;
            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragment: `
            precision highp float;
            uniform sampler2D tMap;
            varying vec2 vUv;
            void main() {
              vec4 colour = texture2D(tMap, vUv);
              if (colour.a < 0.08) discard;
              gl_FragColor = colour;
            }
          `,
          uniforms: { tMap: { value: titleData.texture } }
        });

        this.title = new Mesh(this.gl, { geometry: new Plane(this.gl), program: titleProgram });
        this.title.setParent(this.plane);
        this.titleAspect = titleData.width / titleData.height;
      }

      resize(screen, viewport) {
        this.screen = screen;
        this.viewport = viewport;
        const mobile = screen.width < 720;
        this.plane.scale.y = viewport.height * (mobile ? 0.50 : 0.61);
        this.plane.scale.x = this.plane.scale.y * (mobile ? 0.72 : 0.69);
        this.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
        this.title.scale.y = this.plane.scale.y * 0.095;
        this.title.scale.x = this.title.scale.y * this.titleAspect;
        this.title.position.y = -this.plane.scale.y * 0.5 - this.title.scale.y * 0.78;
        this.width = this.plane.scale.x + (mobile ? 1.0 : 1.35);
        this.widthTotal = this.width * this.length;
        this.x = this.width * this.index;
      }

      update(scroll, direction) {
        this.plane.position.x = this.x - scroll.current - this.extra;
        const x = this.plane.position.x;
        const halfWidth = this.viewport.width / 2;
        const bend = 1.35;
        const radius = (halfWidth * halfWidth + bend * bend) / (2 * bend);
        const effectiveX = Math.min(Math.abs(x), halfWidth);
        const arc = radius - Math.sqrt(Math.max(0, radius * radius - effectiveX * effectiveX));
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / radius);

        const speed = scroll.current - scroll.last;
        this.program.uniforms.uTime.value += 0.035;
        this.program.uniforms.uSpeed.value = speed;

        const planeOffset = this.plane.scale.x / 2;
        const viewportOffset = this.viewport.width / 2;
        const isBefore = this.plane.position.x + planeOffset < -viewportOffset;
        const isAfter = this.plane.position.x - planeOffset > viewportOffset;

        if (direction === 'right' && isBefore) this.extra -= this.widthTotal;
        if (direction === 'left' && isAfter) this.extra += this.widthTotal;
      }
    }

    class CurvedGallery {
      constructor(element) {
        this.element = element;
        this.scroll = { ease: 0.055, current: 0, target: 0, last: 0 };
        this.scrollSpeed = 1.8;
        this.isDown = false;
        this.snapTimer = null;
        this.createScene();
        this.createMedia();
        this.resize();
        this.addEvents();
        this.update();
        this.element.classList.add('is-ready');
      }

      createScene() {
        this.renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(devicePixelRatio || 1, 2) });
        this.gl = this.renderer.gl;
        this.gl.clearColor(0, 0, 0, 0);
        this.element.appendChild(this.gl.canvas);
        this.camera = new Camera(this.gl);
        this.camera.fov = 45;
        this.camera.position.z = 20;
        this.scene = new Transform();
        this.geometry = new Plane(this.gl, { widthSegments: 80, heightSegments: 50 });
      }

      createMedia() {
        const repeated = items.concat(items);
        this.media = repeated.map(
          (data, index) =>
            new GalleryMedia({
              gl: this.gl,
              geometry: this.geometry,
              scene: this.scene,
              renderer: this.renderer,
              camera: this.camera,
              data,
              index,
              length: repeated.length
            })
        );
      }

      resize = () => {
        this.screen = { width: this.element.clientWidth, height: this.element.clientHeight };
        this.renderer.setSize(this.screen.width, this.screen.height);
        this.camera.perspective({ aspect: this.screen.width / this.screen.height });
        const fov = (this.camera.fov * Math.PI) / 180;
        const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
        this.viewport = { width: height * this.camera.aspect, height };
        this.media.forEach((item) => item.resize(this.screen, this.viewport));
      };

      snap = () => {
        const width = this.media[0]?.width;
        if (!width) return;
        const nearest = Math.round(Math.abs(this.scroll.target) / width) * width;
        this.scroll.target = this.scroll.target < 0 ? -nearest : nearest;
      };

      scheduleSnap = () => {
        window.clearTimeout(this.snapTimer);
        this.snapTimer = window.setTimeout(this.snap, 180);
      };

      onWheel = (event) => {
        const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
        this.scroll.target += Math.sign(delta || 1) * this.scrollSpeed * 0.55;
        this.scheduleSnap();
      };

      onPointerDown = (event) => {
        this.isDown = true;
        this.startX = event.clientX;
        this.startScroll = this.scroll.target;
        this.element.setPointerCapture?.(event.pointerId);
        this.element.classList.add('is-dragging');
      };

      onPointerMove = (event) => {
        if (!this.isDown) return;
        const distance = (this.startX - event.clientX) * 0.035;
        this.scroll.target = this.startScroll + distance;
      };

      onPointerUp = (event) => {
        if (!this.isDown) return;
        this.isDown = false;
        this.element.releasePointerCapture?.(event.pointerId);
        this.element.classList.remove('is-dragging');
        this.snap();
      };

      onKeyDown = (event) => {
        const width = this.media[0]?.width || 4;
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          this.scroll.target += width;
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          this.scroll.target -= width;
        } else if (event.key === 'Home') {
          event.preventDefault();
          this.scroll.target = 0;
        } else {
          return;
        }
        this.scheduleSnap();
      };

      addEvents() {
        window.addEventListener('resize', this.resize);
        this.element.addEventListener('wheel', this.onWheel, { passive: true });
        this.element.addEventListener('pointerdown', this.onPointerDown);
        this.element.addEventListener('pointermove', this.onPointerMove);
        this.element.addEventListener('pointerup', this.onPointerUp);
        this.element.addEventListener('pointercancel', this.onPointerUp);
        this.element.addEventListener('keydown', this.onKeyDown);
      }

      update = () => {
        this.scroll.current += (this.scroll.target - this.scroll.current) * this.scroll.ease;
        const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
        this.media.forEach((item) => item.update(this.scroll, direction));
        this.renderer.render({ scene: this.scene, camera: this.camera });
        this.scroll.last = this.scroll.current;
        this.raf = requestAnimationFrame(this.update);
      };
    }

    new CurvedGallery(container);
  } catch (error) {
    console.warn('The curved photography gallery could not be loaded.', error);
  }
};

initialiseCurvedGallery();

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
