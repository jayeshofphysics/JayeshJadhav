(() => {
  'use strict';

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const clampUnit = value => Math.max(0, Math.min(1, value));

  function initializeHeadline(hero) {
    const title = hero.querySelector('.hero-display-title');
    const composition = hero.querySelector('.hero-heading-composition');
    if (!title || !composition) return;

    const words = [...title.querySelectorAll('.hero-word')];
    const letters = [...title.querySelectorAll('.hero-letter')];
    const marks = [...title.querySelectorAll('.hero-code-mark svg')];
    const targets = [...letters, ...marks];
    let animations = [];
    let inView = false;

    function fitHeadline() {
      const availableWidth = composition.clientWidth;
      for (const word of words) {
        const mark = word.querySelector('.hero-code-mark');
        if (!mark || !availableWidth) continue;
        // Reserve room for the flanking code mark while keeping the word centered.
        const placement = getComputedStyle(mark);
        const flank = Math.max(parseFloat(placement.left) || 0, parseFloat(placement.right) || 0)
          - word.offsetWidth + mark.offsetWidth;
        const neededWidth = word.offsetWidth + 2 * Math.max(0, flank);
        const scale = Math.min(1, Math.max(1, availableWidth - 4) / neededWidth);
        word.style.transform = scale < 1 ? `scaleX(${scale})` : '';
      }
    }

    function clearAnimations() {
      for (const animation of animations) animation.cancel();
      animations = [];
      for (const target of targets) target.style.removeProperty('will-change');
    }

    function settle() {
      hero.dataset.heroIntro = 'done';
      title.dataset.motion = 'settled';
      clearAnimations();
    }

    function prepare() {
      clearAnimations();
      hero.dataset.heroIntro = 'pending';
      title.dataset.motion = 'ready';
    }

    function play() {
      if (reducedMotion.matches) return;
      prepare();
      title.dataset.motion = 'entering';
      title.dataset.introPlays = String(Number(title.dataset.introPlays || 0) + 1);
      for (const target of targets) target.style.willChange = 'transform, opacity';

      // Power3.out follows 1 − (1 − t)⁴. Sampling preserves the reference curve.
      const frames = transform => Array.from({ length: 21 }, (_, index) => {
        const offset = index / 20;
        const remaining = (1 - offset) ** 4;
        return { offset, opacity: 1 - remaining, transform: transform(remaining) };
      });
      for (const [index, mark] of marks.entries()) {
        const angle = index === 0 ? -45 : 45;
        animations.push(mark.animate(
          frames(value => `rotate(${angle * value}deg) scale(${1 - 0.04 * value})`),
          { duration: 950, delay: 60 + 80 * index, fill: 'both' },
        ));
      }
      for (const [lineIndex, word] of words.entries()) {
        const line = [...word.querySelectorAll('.hero-letter')];
        const direction = lineIndex === 0 ? 1 : -1;
        for (const [index, letter] of line.entries()) {
          const stagger = lineIndex === 0 ? index : line.length - 1 - index;
          const keyframes = frames(value => `translateY(${105 * direction * value}%) rotateX(${-80 * direction * value}deg) scaleY(${1 - 0.35 * value})`);
          for (const frame of keyframes) frame.transformOrigin = `50% ${lineIndex === 0 ? '100%' : '0%'}`;
          animations.push(letter.animate(keyframes, { duration: 820, delay: 100 * lineIndex + 35 * stagger, fill: 'both' }));
        }
      }

      const sequence = animations;
      Promise.allSettled(sequence.map(animation => animation.finished)).then(() => {
        if (animations === sequence) settle();
      });
    }

    function applyPreference() {
      if (reducedMotion.matches || !title.animate) return settle();
      const rect = title.getBoundingClientRect();
      inView = Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0) >= 0.4 * rect.height;
      if (inView) play();
      else prepare();
    }

    if ('IntersectionObserver' in window && title.animate) {
      new IntersectionObserver(([entry]) => {
        if (reducedMotion.matches) return;
        if (!entry.isIntersecting) {
          inView = false;
          prepare();
        } else if (entry.intersectionRatio >= 0.4 && !inView) {
          inView = true;
          play();
        }
      }, { threshold: [0, 0.4] }).observe(title);
    }
    window.addEventListener('portfolio:hero-return', applyPreference);
    window.addEventListener('pageshow', event => {
      if (event.persisted) applyPreference();
    });
    window.addEventListener('resize', fitHeadline, { passive: true });
    reducedMotion.addEventListener('change', applyPreference);
    document.fonts?.ready.then(fitHeadline);
    fitHeadline();
    applyPreference();
  }

  function initializePortrait(about) {
    const journey = about.querySelector('.portrait-journey');
    const stage = journey?.querySelector('.portrait-sticky-stage');
    const card = journey?.querySelector('.portrait-card');
    const heroPortrait = about.querySelector('.hero-portrait-link');
    const bioPortrait = about.querySelector('.bio-portrait');
    if (!stage || !card || !heroPortrait || !bioPortrait) return;

    const coarseMobile = matchMedia('(max-width: 700px) and (pointer: coarse)');
    let geometry;
    let progress = 0;
    let destination = 0;
    let previousTime = 0;
    let animationFrame = 0;
    let lastViewportWidth = innerWidth;

    function positionCard() {
      const inverse = 1 - progress;
      const scaleX = geometry.scaleX + (1 - geometry.scaleX) * progress;
      const scaleY = geometry.scaleY + (1 - geometry.scaleY) * progress;
      const rotation = 180 * progress * progress * (3 - 2 * progress);
      card.style.transform = `perspective(1200px) translate(${geometry.offsetX * inverse}px, ${geometry.offsetY * inverse}px) scale(${scaleX}, ${scaleY}) rotateY(${rotation}deg)`;
      card.style.borderRadius = `${geometry.startRadius + (geometry.endRadius - geometry.startRadius) * progress}px`;
      card.style.willChange = progress > 0 && progress < 1 ? 'transform' : 'auto';
      about.classList.toggle('portrait-motion-active', destination > 0 || progress > 0);
    }

    function animatePortrait(time) {
      const elapsed = previousTime ? Math.min(time - previousTime, 64) : 16.67;
      previousTime = time;
      const damping = coarseMobile.matches ? 100 : 65;
      progress += (destination - progress) * (1 - Math.exp(-elapsed / damping));
      if (Math.abs(destination - progress) < 0.0001) {
        progress = destination;
        previousTime = 0;
        animationFrame = 0;
      } else {
        animationFrame = requestAnimationFrame(animatePortrait);
      }
      positionCard();
    }

    function scrollPortrait() {
      if (!geometry || reducedMotion.matches) return;
      destination = clampUnit((scrollY - geometry.start) / geometry.distance);
      about.classList.toggle('portrait-motion-active', destination > 0 || progress > 0);
      if (!animationFrame && destination !== progress) animationFrame = requestAnimationFrame(animatePortrait);
    }

    function measurePortrait() {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      previousTime = 0;
      geometry = undefined;
      about.classList.toggle('portrait-motion-ready', !reducedMotion.matches);
      if (reducedMotion.matches) {
        about.classList.remove('portrait-motion-active');
        return;
      }

      const section = about.getBoundingClientRect();
      const from = heroPortrait.getBoundingClientRect();
      const to = bioPortrait.getBoundingClientRect();
      const viewportHeight = coarseMobile.matches ? stage.clientHeight : document.documentElement.clientHeight;
      const cardTop = viewportHeight - 20 - to.height;
      const distance = to.top - section.top - cardTop;
      if (distance <= 0 || !to.width || !to.height) {
        about.classList.remove('portrait-motion-ready', 'portrait-motion-active');
        return;
      }

      const scaleX = from.width / to.width;
      const scaleY = from.height / to.height;
      geometry = {
        start: section.top + scrollY,
        distance,
        scaleX,
        scaleY,
        offsetX: from.left + from.width / 2 - (to.left + to.width / 2),
        offsetY: from.top - section.top - cardTop - (to.height - from.height) / 2,
        startRadius: parseFloat(getComputedStyle(heroPortrait).borderTopLeftRadius) / Math.min(scaleX, scaleY),
        endRadius: parseFloat(getComputedStyle(bioPortrait).borderTopLeftRadius),
      };
      journey.style.height = `${distance + viewportHeight}px`;
      card.style.width = `${to.width}px`;
      card.style.height = `${to.height}px`;
      card.style.left = `${to.left - section.left}px`;
      card.style.top = `${cardTop}px`;
      progress = destination = clampUnit((scrollY - geometry.start) / distance);
      positionCard();
    }

    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(measurePortrait);
      observer.observe(heroPortrait);
      observer.observe(bioPortrait);
    }
    window.addEventListener('scroll', scrollPortrait, { passive: true });
    window.addEventListener('resize', () => {
      if (coarseMobile.matches && innerWidth === lastViewportWidth) return;
      lastViewportWidth = innerWidth;
      measurePortrait();
    }, { passive: true });
    window.addEventListener('pageshow', measurePortrait);
    reducedMotion.addEventListener('change', measurePortrait);
    document.fonts?.ready.then(measurePortrait);
    measurePortrait();
  }

  function initializeSectionFades(portfolio) {
    const sections = [...portfolio.querySelectorAll('.bio-introduction, .bio-description, #skills, #projects, #experience, #contact, .footer-top')];
    const complete = new WeakSet();
    const animations = new Map();
    let observer;

    function reveal(section) {
      complete.add(section);
      observer?.unobserve(section);
      section.style.removeProperty('opacity');
      section.dataset.textReveal = 'done';
    }

    function prepareSections() {
      observer?.disconnect();
      for (const animation of animations.values()) animation.cancel();
      animations.clear();
      const disableAnimation = reducedMotion.matches || !('IntersectionObserver' in window) || !portfolio.animate;
      portfolio.dataset.textMotion = disableAnimation ? 'static' : 'section-fade';
      if (disableAnimation) {
        for (const section of sections) section.style.removeProperty('opacity');
        return;
      }

      observer = new IntersectionObserver(entries => {
        for (const { target, isIntersecting } of entries) {
          if (!isIntersecting || complete.has(target)) continue;
          reveal(target);
          if (target.contains(document.activeElement)) continue;
          target.dataset.textReveal = 'playing';
          const animation = target.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 1400,
            easing: 'cubic-bezier(.33, 0, .2, 1)',
            fill: 'both',
          });
          animations.set(target, animation);
          animation.onfinish = () => {
            animations.delete(target);
            reveal(target);
            animation.cancel();
          };
        }
      }, { rootMargin: '0px 0px 48px 0px', threshold: 0 });

      for (const section of sections) {
        if (complete.has(section)) continue;
        if (section.getBoundingClientRect().top < innerHeight) reveal(section);
        else {
          section.style.opacity = '0';
          observer.observe(section);
        }
      }
    }

    portfolio.addEventListener('focusin', event => {
      for (const section of sections) {
        if (!section.contains(event.target)) continue;
        animations.get(section)?.finish();
        reveal(section);
      }
    });
    reducedMotion.addEventListener('change', prepareSections);
    prepareSections();
  }

  function initializeRoadmap(roadmap) {
    const road = roadmap.querySelector('.journey-road');
    const paths = road?.querySelectorAll('path');
    const markers = [...roadmap.querySelectorAll('.journey-stop-marker')];
    if (!paths?.length || markers.length < 2) return;
    const narrow = matchMedia('(max-width: 1000px)');

    function drawRoad() {
      const bounds = roadmap.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const points = markers.map(marker => {
        const rect = marker.getBoundingClientRect();
        return { x: rect.left - bounds.left + rect.width / 2, y: rect.top - bounds.top + rect.height / 2 };
      });
      let route = `M ${points[0].x} ${points[0].y}`;
      for (let index = 1; index < points.length; index++) {
        const from = points[index - 1];
        const to = points[index];
        const middleX = (from.x + to.x) / 2;
        const middleY = (from.y + to.y) / 2;
        route += narrow.matches
          ? ` C ${from.x + 28} ${middleY}, ${to.x - 20} ${middleY}, ${to.x} ${to.y}`
          : ` C ${middleX} ${from.y}, ${middleX} ${to.y}, ${to.x} ${to.y}`;
      }
      road.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
      for (const path of paths) path.setAttribute('d', route);
    }

    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(drawRoad);
      observer.observe(roadmap);
      for (const item of roadmap.querySelectorAll('.journey-stop')) observer.observe(item);
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        roadmap.dataset.drawn = String(entry.isIntersecting);
      }, { threshold: 0.2 }).observe(roadmap);
    } else {
      roadmap.dataset.drawn = 'true';
    }
    narrow.addEventListener('change', drawRoad);
    document.fonts?.ready.then(drawRoad);
    drawRoad();
  }

  function initializeTerminals(portfolio) {
    const terminals = [...portfolio.querySelectorAll('.terminal-text')];
    const visible = new Set();
    function update() {
      for (const terminal of terminals) {
        terminal.dataset.running = String(visible.has(terminal) && !document.hidden && !reducedMotion.matches);
      }
    }
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        for (const { target, isIntersecting } of entries) {
          if (isIntersecting) visible.add(target);
          else visible.delete(target);
        }
        update();
      });
      for (const terminal of terminals) observer.observe(terminal);
    }
    document.addEventListener('visibilitychange', update);
    reducedMotion.addEventListener('change', update);
  }

  function initializeGlyphBackdrop(background) {
    const canvas = background.querySelector('canvas');
    const fallback = background.querySelector('.glyph-code-fallback');
    if (!canvas || !fallback) return;
    const context = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!context) return;

    const vertexSource = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;
    const fragmentSource = `
precision highp float;
uniform sampler2D atlas;
uniform vec2 size;
uniform vec2 cell;
uniform float dpr;
uniform float count;
uniform float time;
uniform float rest;
uniform float haze;
uniform float hoverInk;
uniform vec3 pointer;
uniform float activity;
uniform vec2 drift;
uniform vec3 color;
uniform vec3 accent;
uniform vec4 waves[12];
uniform vec4 trail[8];

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float smoothNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float clouds(vec2 p) {
  float v = 0.0;
  float a = 0.55;
  for (int i = 0; i < 4; i++) {
    v += a * smoothNoise(p);
    p = p * 2.02 + vec2(17.1, 9.4);
    a *= 0.5;
  }
  return v;
}

float outline(float kind, float angle, float phase) {
  if (kind < 0.5) return 1.0;
  if (kind < 1.5) {
    float s = sin(angle);
    float c = cos(angle);
    return (2.0 - 2.0 * s + s * sqrt(abs(c)) / (s + 1.4)) * 0.42;
  }
  return 1.0 + 0.14 * sin(3.0 * angle + phase) + 0.08 * sin(5.0 * angle - phase * 1.3);
}

void main() {
  vec2 pixel = vec2(gl_FragCoord.x, size.y - gl_FragCoord.y);
  vec2 index = floor(pixel / cell);
  vec2 point = (index + 0.5) * cell / dpr;

  float ring = 0.0;
  for (int i = 0; i < 6; i++) {
    vec4 a = waves[i * 2];
    vec4 b = waves[i * 2 + 1];
    if (a.w <= 0.0) continue;
    vec2 v = point - a.xy;
    float angle = atan(-v.y, v.x);
    float shape = mix(1.0, outline(b.x, angle, b.z), b.y);
    shape *= 1.0 + 0.07 * sin(3.0 * angle + b.z + b.w) + 0.05 * sin(5.0 * angle - b.z * 1.7 - b.w * 1.3) + 0.03 * sin(9.0 * angle + b.w * 2.1);
    float d = length(v) - a.z * shape;
    float k = d > 0.0 ? d / 14.0 : d / 42.0;
    ring = max(ring, exp(-k * k) * a.w);
  }

  float focus = length((point - pointer.xy) / vec2(86.0, 48.0));
  float hover = pointer.z * (1.0 - smoothstep(0.12, 1.0, focus));
  for (int i = 0; i < 8; i++) {
    vec4 t = trail[i];
    if (t.w <= 0.0) continue;
    vec2 v = point - t.xy;
    hover += t.w * exp(-dot(v, v) / (2.0 * t.z * t.z));
  }
  hover = min(hover, 1.0);

  mat2 turn = mat2(0.82, 0.57, -0.57, 0.82);
  vec2 q = turn * (point - drift);
  float blob = smoothNoise(vec2(q.x / 140.0, q.y / 80.0) + vec2(time * 0.04, 0.0)) * 0.62
    + smoothNoise(vec2(q.x / 62.0, q.y / 36.0) + vec2(3.7, time * 0.06)) * 0.38;
  float grain = smoothNoise(vec2(q.x / 30.0, q.y / 14.0) + vec2(time * 0.2, 7.3));
  float cloud = blob * (0.82 + 0.24 * grain);
  float mask = pow(smoothstep(0.47 - 0.2 * activity, 0.84, cloud), 2.6);

  float ink = texture2D(atlas, pixel / size).a;

  // Small, quiet islands of code remain visible even without a pointer.
  vec2 viewport = size / dpr;
  vec2 patchSize = vec2(min(110.0, viewport.x * 0.23), 38.0);
  vec2 a = (point - viewport * vec2(0.16, 0.22)) / patchSize;
  vec2 b = (point - viewport * vec2(0.83, 0.36)) / patchSize;
  vec2 c = (point - viewport * vec2(0.22, 0.77)) / patchSize;
  vec2 d = (point - viewport * vec2(0.84, 0.82)) / patchSize;
  float idle = max(
    max(exp(-dot(a, a)) * (0.8 + 0.15 * sin(time * 0.18)),
        exp(-dot(b, b)) * (0.8 + 0.15 * sin(time * 0.18 + 1.6))),
    max(exp(-dot(c, c)) * (0.8 + 0.15 * sin(time * 0.18 + 3.2)),
        exp(-dot(d, d)) * (0.8 + 0.15 * sin(time * 0.18 + 4.8)))
  );
  float grey = ink * clamp(rest + 0.075 * idle + haze * mask * (1.0 + 0.3 * activity) + hoverInk * hover * (0.9 + 0.1 * mask), 0.0, 1.0);
  float blue = ink * ring * 0.10;
  float alpha = grey + blue - grey * blue;
  vec3 tint = color * grey * (1.0 - blue) + accent * blue;
  gl_FragColor = vec4(tint, alpha);
}
`;
    const atlas = document.createElement('canvas');
    const atlasContext = atlas.getContext('2d');
    const colorProbe = document.createElement('canvas').getContext('2d');
    if (!atlasContext || !colorProbe) return;

    const shaders = [[context.VERTEX_SHADER, vertexSource], [context.FRAGMENT_SHADER, fragmentSource]].map(([type, source]) => {
      const shader = context.createShader(type);
      if (!shader) return null;
      context.shaderSource(shader, source);
      context.compileShader(shader);
      return shader;
    });
    const program = context.createProgram();
    if (!program || !shaders.every(shader => shader && context.getShaderParameter(shader, context.COMPILE_STATUS))) return;
    for (const shader of shaders) context.attachShader(program, shader);
    context.linkProgram(program);
    if (!context.getProgramParameter(program, context.LINK_STATUS)) return;
    context.useProgram(program);

    const vertices = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, vertices);
    context.bufferData(context.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), context.STATIC_DRAW);
    const position = context.getAttribLocation(program, 'position');
    context.enableVertexAttribArray(position);
    context.vertexAttribPointer(position, 2, context.FLOAT, false, 0, 0);

    const texture = context.createTexture();
    context.bindTexture(context.TEXTURE_2D, texture);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
    const uniforms = Object.fromEntries([
      'atlas', 'size', 'cell', 'dpr', 'time', 'rest', 'haze', 'hoverInk', 'pointer',
      'activity', 'drift', 'color', 'accent', 'waves[0]', 'trail[0]',
    ].map(name => [name, context.getUniformLocation(program, name)]));
    context.uniform1i(uniforms.atlas, 0);
    context.uniform1f(uniforms.rest, 0.025);
    context.uniform1f(uniforms.haze, 0.08);
    context.uniform1f(uniforms.hoverInk, 0.38);

    const code = fallback.textContent.trimEnd();
    const fontSize = 12;
    const waves = new Float32Array(48);
    const trail = new Float32Array(32);
    let width = 0;
    let height = 0;
    let effectiveDpr = 1;
    let time = 0;
    let lastFrame = 0;
    let frame = 0;
    let active = false;
    let contextLost = false;
    let pointer = null;
    let clientPointer = null;
    let waveCenters = [];
    let trailPoints = [];

    function updateColor() {
      colorProbe.fillStyle = getComputedStyle(background).color;
      colorProbe.fillRect(0, 0, 1, 1);
      const [red, green, blue] = colorProbe.getImageData(0, 0, 1, 1).data;
      context.uniform3f(uniforms.color, red / 255, green / 255, blue / 255);
      context.uniform3f(uniforms.accent, red / 255, green / 255, blue / 255);
    }

    function render() {
      if (contextLost || !width || !height) return;
      waves.fill(0);
      waveCenters = waveCenters.filter(point => time - point.at < 4);
      for (const [index, point] of waveCenters.entries()) {
        const age = time - point.at;
        const opacity = Math.min(1, age / 0.08) * Math.exp(-age / 1.3) * Math.min(1, (4 - age) / 0.5);
        waves.set([point.x, point.y, 420 * age / (1 + 0.4 * age), opacity], 8 * index);
      }
      trail.fill(0);
      trailPoints = trailPoints.filter(point => time - point.at < 0.45);
      for (const [index, point] of trailPoints.entries()) {
        const remaining = 1 - (time - point.at) / 0.45;
        trail.set([point.x, point.y, 28, 0.18 * remaining ** 2], 4 * index);
      }
      context.viewport(0, 0, canvas.width, canvas.height);
      context.uniform2f(uniforms.size, canvas.width, canvas.height);
      context.uniform2f(uniforms.cell, 8 * effectiveDpr, 18 * effectiveDpr);
      context.uniform1f(uniforms.dpr, effectiveDpr);
      context.uniform1f(uniforms.time, time);
      context.uniform3f(uniforms.pointer, pointer?.x ?? -1000, pointer?.y ?? -1000, Number(Boolean(pointer)));
      context.uniform1f(uniforms.activity, trailPoints.length / 8);
      context.uniform2f(uniforms.drift, -8 * time, 4 * time);
      context.uniform4fv(uniforms['waves[0]'], waves);
      context.uniform4fv(uniforms['trail[0]'], trail);
      context.clearColor(0, 0, 0, 0);
      context.clear(context.COLOR_BUFFER_BIT);
      context.drawArrays(context.TRIANGLES, 0, 3);
    }

    function wrapCode(availableWidth) {
      const wrapped = [];
      for (let line of code.split('\n')) {
        let indent = '';
        while (line.length > 1 && atlasContext.measureText(indent + line).width > availableWidth) {
          let end = line.length;
          while (end > 1 && atlasContext.measureText(indent + line.slice(0, end)).width > availableWidth) end--;
          const space = line.lastIndexOf(' ', end);
          if (space > end / 2) end = space;
          wrapped.push(indent + line.slice(0, end));
          line = line.slice(end).trimStart();
          indent = '  ';
        }
        wrapped.push(line ? indent + line : '');
      }
      return wrapped;
    }

    function measure() {
      if (contextLost) return;
      const bounds = background.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      if (!width || !height) return;
      effectiveDpr = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(1_500_000 / (width * height)));
      canvas.width = atlas.width = Math.max(1, Math.round(width * effectiveDpr));
      canvas.height = atlas.height = Math.max(1, Math.round(height * effectiveDpr));
      atlasContext.scale(effectiveDpr, effectiveDpr);
      atlasContext.fillStyle = '#fff';
      atlasContext.font = `400 ${fontSize}px ${getComputedStyle(background).fontFamily}`;
      atlasContext.textBaseline = 'top';
      const lineHeight = 1.7 * fontSize;
      const lineCount = Math.ceil(height / lineHeight);
      const columnCount = Math.max(1, Math.floor(width / 370));
      const columnWidth = width / columnCount;
      const lines = wrapCode(Math.max(1, columnWidth - 40));
      const top = width <= 700 ? 112 : 12;
      for (let column = 0; column < columnCount; column++) {
        const left = column * columnWidth + 20;
        atlasContext.save();
        atlasContext.beginPath();
        atlasContext.rect(left, 0, columnWidth - 40, height);
        atlasContext.clip();
        for (let row = 0; row < lineCount; row++) {
          const line = lines[(row + column * lineCount) % lines.length];
          atlasContext.fillText(line, left, top + row * lineHeight);
        }
        atlasContext.restore();
      }
      context.bindTexture(context.TEXTURE_2D, texture);
      context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, atlas);
      updateColor();
      render();
      background.dataset.renderer = 'webgl';
    }

    function animate(now) {
      if (now - lastFrame >= 1000 / 30) {
        if (lastFrame) time += Math.min((now - lastFrame) / 1000, 0.064);
        lastFrame = now;
        render();
      }
      frame = requestAnimationFrame(animate);
    }

    function updateAnimation() {
      cancelAnimationFrame(frame);
      lastFrame = 0;
      const running = active && !document.hidden && !reducedMotion.matches && !contextLost;
      background.dataset.animated = String(running);
      if (running) {
        frame = requestAnimationFrame(animate);
        return;
      }
      trailPoints = [];
      waveCenters = [];
      if (!active || document.hidden) pointer = null;
      if (active && !document.hidden) render();
    }

    function localPoint(x, y) {
      const bounds = background.getBoundingClientRect();
      return { x: x - bounds.left, y: y - bounds.top, at: time };
    }
    const withinBounds = point => point.x >= 0 && point.x <= width && point.y >= 0 && point.y <= height;

    function followPointer() {
      const point = clientPointer && localPoint(clientPointer.x, clientPointer.y);
      pointer = point && withinBounds(point) ? point : null;
      if (reducedMotion.matches && active) render();
    }

    function addPointerTrail(event) {
      if (!active) return;
      clientPointer = event.pointerType === 'touch' ? null : { x: event.clientX, y: event.clientY };
      followPointer();
      if (!pointer || reducedMotion.matches) return;
      const previous = trailPoints.at(-1);
      if (previous && Math.hypot(pointer.x - previous.x, pointer.y - previous.y) < 14) return;
      trailPoints = [...trailPoints.slice(-7), pointer];
    }

    function addWave(event) {
      if (!active || reducedMotion.matches) return;
      const point = localPoint(event.clientX, event.clientY);
      if (withinBounds(point)) waveCenters = [...waveCenters.slice(-5), point];
    }

    function clearPointer() {
      clientPointer = null;
      followPointer();
    }

    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(background);
    else window.addEventListener('resize', measure, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        active = entry.isIntersecting;
        updateAnimation();
      }).observe(background);
    } else {
      active = true;
      updateAnimation();
    }
    new MutationObserver(() => {
      if (contextLost) return;
      updateColor();
      render();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    window.addEventListener('pointermove', addPointerTrail, { passive: true, capture: true });
    window.addEventListener('pointerdown', addWave, { passive: true, capture: true });
    window.addEventListener('scroll', followPointer, { passive: true });
    window.addEventListener('blur', clearPointer);
    document.documentElement.addEventListener('pointerleave', clearPointer);
    canvas.addEventListener('webglcontextlost', () => {
      contextLost = true;
      background.dataset.renderer = 'fallback';
      updateAnimation();
    });
    document.addEventListener('visibilitychange', updateAnimation);
    reducedMotion.addEventListener('change', updateAnimation);
    document.fonts?.ready.then(measure);
    measure();
  }

  const portfolio = document.querySelector('.portfolio');
  if (!portfolio) return;
  const hero = portfolio.querySelector('.hero');
  const about = portfolio.querySelector('.about-section');
  const roadmap = portfolio.querySelector('.journey-roadmap');
  const glyphBackdrop = portfolio.querySelector('.hero-code-background');
  if (hero) initializeHeadline(hero);
  if (about) initializePortrait(about);
  if (roadmap) initializeRoadmap(roadmap);
  initializeSectionFades(portfolio);
  initializeTerminals(portfolio);
  if (glyphBackdrop) initializeGlyphBackdrop(glyphBackdrop);
})();
