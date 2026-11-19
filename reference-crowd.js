(() => {
  "use strict";

  const scene = document.querySelector(".footer-crowd-scene");
  if (!scene) return;

  const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
  const spriteDirectory = new URL("assets/physicist-crowd/", document.currentScript.src);
  const lanes = [
    {
      canvas: scene.querySelector(".footer-crowd-back"),
      names: ["poincare", "raman", "feynman", "noether"],
      direction: 1,
      size: 0.89,
      floor: 0.27,
      pace: 0.04,
      minimumSpeed: 43
    },
    {
      canvas: scene.querySelector(".footer-crowd-front"),
      names: ["einstein", "curie", "bose", "hawking"],
      direction: -1,
      size: 1,
      floor: 0.045,
      pace: 0.05,
      minimumSpeed: 58
    }
  ];

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let elapsed = 0;
  let previousFrame = 0;
  let frame = 0;
  let ready = false;
  let failed = false;
  let paused = false;
  let inView = false;

  for (const lane of lanes) {
    lane.context = lane.canvas?.getContext("2d");
    if (!lane.context) failed = true;
  }

  function render() {
    const reduced = motionPreference.matches;

    for (const lane of lanes) {
      const { context, sprites } = lane;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);

      sprites.forEach((sprite, index) => {
        const slot = width / sprites.length;
        const phase = (index + (lane.direction === 1 ? 0.48 : 0.76)) / sprites.length;
        const progress = (phase + elapsed * lane.speed / lane.travelWidth) % 1;
        const distance = lane.direction === 1 ? progress : 1 - progress;
        const travelX = distance * lane.travelWidth - lane.edgeBuffer;
        const staticOffset = slot * 0.21 * lane.direction;
        const x = reduced ? (index + 0.5) * slot + staticOffset : travelX;
        const scale = reduced ? Math.min(1, slot * 0.56 / sprite.width) : 1;
        const step = reduced || sprite.name === "hawking" ? 0 :
          (1 - Math.cos((elapsed * 1.6 + index * 0.27) * 2 * Math.PI)) * 1.5;

        const drawWidth = sprite.width * scale;
        const drawHeight = sprite.height * scale;
        context.drawImage(
          sprite.image,
          x - drawWidth / 2,
          sprite.baseline - drawHeight - step,
          drawWidth,
          drawHeight
        );
      });
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
    if (!ready || !width || !height) return;

    render();
    if (inView && !document.hidden && !paused && !motionPreference.matches) {
      frame = requestAnimationFrame(animate);
    }
  }

  function layout() {
    if (!ready) return;

    const nextWidth = scene.clientWidth;
    const nextHeight = scene.clientHeight;
    const nextPixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    if (!nextWidth || !nextHeight) return;
    if (nextWidth === width && nextHeight === height && nextPixelRatio === pixelRatio) return;

    width = nextWidth;
    height = nextHeight;
    pixelRatio = nextPixelRatio;
    const standingHeight = Math.min(height * 0.65, width * 0.6, 290);

    for (const lane of lanes) {
      lane.canvas.width = Math.round(width * pixelRatio);
      lane.canvas.height = Math.round(height * pixelRatio);

      const floor = Math.max(9, height * lane.floor);
      lane.sprites = lane.images.map(({ image, name }, index) => {
        const ratio = image.naturalWidth / image.naturalHeight;
        const stature = name === "hawking" ? 0.72 : 1 - (index % 3) * 0.024;
        const spriteHeight = Math.min(standingHeight * lane.size * stature, width * 0.28 / ratio);
        return {
          image,
          name,
          width: spriteHeight * ratio,
          height: spriteHeight,
          baseline: height - floor - index % 3 * 3
        };
      });

      // Give each silhouette its own interval and finish the wrap beyond the edge.
      const widest = Math.max(...lane.sprites.map(sprite => sprite.width));
      const minimumTrack = lane.sprites.length * (widest + 16);
      lane.travelWidth = Math.max(width + widest + 24, minimumTrack);
      lane.edgeBuffer = (lane.travelWidth - width) / 2;
      lane.speed = Math.max(lane.minimumSpeed, width * lane.pace);
    }

    syncAnimation();
  }

  function syncButton() {
    const reduced = motionPreference.matches;
    scene.disabled = !ready || failed || reduced;
    scene.setAttribute("aria-pressed", String(paused || reduced));
    const action = failed ? "Physicist illustrations unavailable" :
      !ready ? "Loading physicist illustrations" :
      reduced ? "Physicist animation paused by reduced motion preference" :
      paused ? "Resume physicist animation" : "Pause physicist animation";
    scene.setAttribute("aria-label", action);
    syncAnimation();
  }

  async function loadImages() {
    try {
      await Promise.all(lanes.map(async lane => {
        lane.images = await Promise.all(lane.names.map(async name => {
          const image = new Image();
          image.src = new URL(`${name}.webp`, spriteDirectory);
          await image.decode();
          return { image, name };
        }));
      }));

      ready = true;
      scene.dataset.ready = "true";
      syncButton();
      layout();
    } catch {
      failed = true;
      syncButton();
    }
  }

  syncButton();
  if (failed) return;

  scene.addEventListener("click", () => {
    paused = !paused;
    syncButton();
  });
  motionPreference.addEventListener("change", syncButton);
  document.addEventListener("visibilitychange", syncAnimation);
  new ResizeObserver(layout).observe(scene);

  const loadingObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    loadingObserver.disconnect();
    loadImages();
  }, { rootMargin: "500px" });
  loadingObserver.observe(scene);

  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    syncAnimation();
  }, { rootMargin: "80px" }).observe(scene);
})();
