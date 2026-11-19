(() => {
  "use strict";

  const scene = document.querySelector(".footer-crowd-scene");
  if (!scene) return;

  const portrait = scene.querySelector(".footer-crowd-portrait");
  const name = scene.querySelector(".footer-crowd-name").textContent.trim();
  const canvases = [...scene.querySelectorAll(".footer-crowd-layer")];
  const contexts = canvases.map(canvas => canvas.getContext("2d"));
  if (contexts.some(context => !context)) {
    scene.disabled = true;
    return;
  }

  const characters = 105;
  const columns = 5;
  const rows = 3;
  const sheetSize = columns * rows;
  const spriteDirectory = new URL("assets/reference-crowd/", document.currentScript.src);
  const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
  let sheets;
  let sprites = [];
  let paused = false;
  let inView = false;
  let width = 0;
  let height = 0;
  let portraitHeight = 0;
  let pixelRatio = 1;
  let edgeBuffer = 0;
  let travelWidth = 0;
  let elapsed = 0;
  let previousFrame = 0;
  let frame = 0;

  // Preserve the spacing, cast order, and speed differences in the reference.
  function variation(seed) {
    const value = 43758.5453 * Math.sin(127.1 * seed + 311.7);
    return value - Math.floor(value);
  }

  function scaleForCharacter(index) {
    if (index >= 60 && index < 75) return 0.7;
    if (index >= 75 && index < 90) return 0.95;
    return 1;
  }

  function render() {
    for (const context of contexts) {
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
    }

    for (const sprite of sprites) {
      const distance = sprite.phase + elapsed * sprite.speed / 10;
      const loops = Math.floor(distance);
      const progress = distance - loops;
      const character = (sprite.cell + 37 * loops) % characters;
      const sheet = sheets[Math.floor(character / sheetSize)];
      const cell = character % sheetSize;
      const scale = scaleForCharacter(character);
      const drawWidth = sprite.width * scale;
      const drawHeight = sprite.height * scale;
      const offset = sprite.direction === 1 ? progress : 1 - progress;
      const x = offset * travelWidth - edgeBuffer;
      const step = (1 - Math.cos((elapsed * sprite.speed + 10 * sprite.phase) * Math.PI * 4)) * 5;
      const y = sprite.baseline + sprite.height - drawHeight - step;
      const context = contexts[sprite.layer];

      context.save();
      context.translate(x, y);
      context.scale(sprite.direction, 1);
      context.drawImage(
        sheet.image,
        cell % columns * sheet.cellWidth,
        Math.floor(cell / columns) * sheet.cellHeight,
        sheet.cellWidth,
        sheet.cellHeight,
        -drawWidth / 2,
        0,
        drawWidth,
        drawHeight
      );
      context.restore();
    }
  }

  function animate(timestamp) {
    if (previousFrame) elapsed += Math.min((timestamp - previousFrame) / 1000, 0.05);
    previousFrame = timestamp;
    render();
    frame = requestAnimationFrame(animate);
  }

  function syncAnimation() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousFrame = 0;
    if (!sheets || !sprites.length) return;

    render();
    if (inView && !document.hidden && !paused && !motionPreference.matches) {
      frame = requestAnimationFrame(animate);
    }
  }

  function layout() {
    if (!sheets) return;

    const nextWidth = scene.clientWidth;
    const nextHeight = scene.clientHeight;
    const nextPortraitHeight = portrait.getBoundingClientRect().height;
    const nextPixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    if (!nextWidth || !nextHeight) return;
    if (nextWidth === width && nextHeight === height &&
        nextPortraitHeight === portraitHeight && nextPixelRatio === pixelRatio) return;

    width = nextWidth;
    height = nextHeight;
    portraitHeight = nextPortraitHeight;
    pixelRatio = nextPixelRatio;
    for (const canvas of canvases) {
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
    }

    const crowdScale = Math.min(1, portraitHeight / 310) || 1;
    const relativeWidth = width / (1440 * crowdScale);
    const backCount = width >= 600 ? 25 : Math.max(9, Math.round(25 * relativeWidth));
    const frontCount = width >= 600 ? 16 : Math.max(6, Math.round(16 * relativeWidth));
    const count = backCount + frontCount;

    sprites = Array.from({ length: count }, (_, index) => {
      const foreground = index >= backCount;
      const trackIndex = foreground ? index - backCount : index;
      const trackCount = foreground ? frontCount : backCount;
      const characterHeight = (foreground ? 250 + 30 * variation(index + 8) :
        170 + 35 * variation(index + 8)) * crowdScale;
      const baseline = foreground
        ? height - characterHeight + 30 * crowdScale + 15 * variation(index + 4)
        : height - portraitHeight - 12 + 24 * variation(index + 4);

      return {
        cell: 37 * Math.floor(characters * index / count) % characters,
        layer: foreground || trackIndex % 3 === 0 ? 1 : 0,
        height: characterHeight,
        width: 0.8 * characterHeight,
        baseline,
        phase: (trackIndex + 0.85 * variation(index + 41)) / trackCount,
        speed: (foreground ? 1.05 : 0.7) * (0.88 + 0.24 * variation(index + 97)),
        direction: foreground ? -1 : 1
      };
    }).sort((first, second) => first.baseline - second.baseline);

    edgeBuffer = Math.max(...sprites.map(sprite => sprite.width));
    travelWidth = width + 2 * edgeBuffer;
    syncAnimation();
  }

  function syncButton() {
    const reduced = motionPreference.matches;
    scene.disabled = reduced;
    scene.setAttribute("aria-pressed", String(paused || reduced));
    const action = reduced ? "Crowd animation paused" :
      paused ? "Resume crowd animation" : "Pause crowd animation";
    scene.setAttribute("aria-label", `${name} ${action}`);
    syncAnimation();
  }

  async function loadSprites() {
    try {
      const files = Array.from({ length: characters / sheetSize }, (_, index) => {
        const image = new Image();
        const filename = `crowd-${String(index + 1).padStart(2, "0")}.webp`;
        image.src = new URL(filename, spriteDirectory);
        return image.decode().then(() => ({
          image,
          cellWidth: image.naturalWidth / columns,
          cellHeight: image.naturalHeight / rows
        }));
      });

      sheets = await Promise.all(files);
      layout();
      scene.dataset.ready = "true";
    } catch {
      scene.disabled = true;
    }
  }

  scene.addEventListener("click", () => {
    paused = !paused;
    syncButton();
  });
  motionPreference.addEventListener("change", syncButton);
  document.addEventListener("visibilitychange", syncAnimation);
  new ResizeObserver(layout).observe(scene);
  portrait.addEventListener("load", layout);

  const loadingObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    loadingObserver.disconnect();
    loadSprites();
  }, { rootMargin: "500px" });
  loadingObserver.observe(scene);

  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    syncAnimation();
  }, { rootMargin: "80px" }).observe(scene);

  syncButton();
})();
