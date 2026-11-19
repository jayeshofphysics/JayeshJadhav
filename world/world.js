'use strict';

const canvas = document.getElementById('landscape');
const ink = canvas.getContext('2d');
const stage = canvas.parentElement;
const overlay = document.querySelector('.world-interface');
const intro = document.querySelector('.world-intro');
const modeDialog = document.getElementById('world-mode-dialog');
const mapDialog = document.getElementById('journey-map');
const storyDialog = document.getElementById('story-dialog');
const story = document.getElementById('journey-story');
const launch = document.getElementById('world-launch');
const journeyButton = document.getElementById('journey-button');
const readButton = document.getElementById('read-story');
const autoButton = document.getElementById('ride-toggle');
const qualityButton = document.getElementById('quality-button');
const chapterButton = document.getElementById('chapter-button');
const nextButton = document.getElementById('next-stop');
const previousButton = document.getElementById('previous-stop');
const continueButton = document.getElementById('continue-chapter');
const touchControls = document.querySelector('.world-touch');
const dialogue = document.querySelector('.world-dialogue');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const arrows = new Map([
  ['ArrowUp', 'up'], ['w', 'up'],
  ['ArrowDown', 'down'], ['s', 'down'],
  ['ArrowLeft', 'left'], ['a', 'left'],
  ['ArrowRight', 'right'], ['d', 'right']
]);

const chapters = Array.from(story.querySelectorAll('article'), article => ({
  place: article.dataset.place,
  detail: article.dataset.detail,
  heading: article.querySelector('h3').textContent,
  body: article.querySelector('h3 + p').textContent
}));

const state = {
  entered: false,
  mode: 'manual',
  riding: false,
  narrating: false,
  current: 0,
  distance: 0,
  destination: null,
  steer: 0,
  quality: 'light',
  angle: 0,
  width: 0,
  height: 0,
  pixelRatio: 1
};

const held = new Set();
const limit = (value, min, max) => Math.min(max, Math.max(min, value));
const pad = value => String(value).padStart(2, '0');

storyDialog.append(story);
const mapButtons = chapters.map(({ place, detail }, index) => {
  const item = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  const label = document.createElement('span');
  label.textContent = place;
  const meta = document.createElement('small');
  meta.textContent = detail;
  label.append(meta);
  const number = document.createElement('span');
  number.textContent = pad(index + 1);
  number.setAttribute('aria-hidden', 'true');
  button.append(label, number);
  button.addEventListener('click', () => {
    mapDialog.close();
    if (!state.entered) begin('manual', index);
    else arrive(index);
  });
  item.append(button);
  document.getElementById('world-map-list').append(item);
  return button;
});

function updateControls() {
  overlay.dataset.entered = String(state.entered);
  overlay.dataset.narrating = String(state.narrating);
  intro.hidden = state.entered;
  document.querySelector('.world-location').hidden = !state.entered;
  document.querySelector('.world-dashboard').hidden = !state.entered;
  document.querySelector('.world-ride-controls').hidden = !state.entered;
  touchControls.hidden = !state.entered || state.mode !== 'manual';
  dialogue.hidden = !state.narrating;
  chapterButton.hidden = !state.entered || state.narrating;
  const traveling = state.destination !== null;
  autoButton.textContent = traveling ? 'Pause' : 'Autopilot';
  autoButton.setAttribute('aria-pressed', String(traveling));
  document.getElementById('world-help').textContent = state.entered && state.mode === 'manual' ? 'WASD or arrow keys to explore' : '';
  previousButton.disabled = state.current === 0;
  nextButton.disabled = state.current === chapters.length - 1;
  continueButton.textContent = state.current === chapters.length - 1 ? 'Read the full story ↗︎' : 'Next chapter ↗︎';
}

function arrive(index, moveFocus = false) {
  held.clear();
  state.destination = null;
  state.riding = false;
  state.current = index;
  state.distance = index;
  state.narrating = true;
  const chapter = chapters[index];
  document.getElementById('world-place').textContent = chapter.place;
  document.getElementById('world-place-detail').textContent = chapter.detail;
  document.getElementById('world-progress').firstChild.textContent = `${pad(index + 1)} `;
  document.getElementById('world-chapter-label').textContent = `Chapter ${pad(index + 1)} / ${pad(chapters.length)}`;
  document.getElementById('world-chapter-title').textContent = chapter.heading;
  document.getElementById('world-chapter-text').textContent = chapter.body;
  mapButtons.forEach((button, offset) => {
    if (offset === index) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  updateControls();
  paint();
  if (moveFocus) continueButton.focus();
}

function begin(mode, index = 0) {
  if (modeDialog.open) modeDialog.close();
  state.entered = true;
  state.mode = mode;
  arrive(index, true);
  resize();
  if (!reducedMotion.matches) stage.animate([{ opacity: .4 }, { opacity: 1 }], { duration: 420 });
}

function travel(index, automatic) {
  if (index < 0 || index >= chapters.length) return;
  if (reducedMotion.matches) {
    arrive(index, true);
    return;
  }
  state.narrating = false;
  state.destination = index;
  state.riding = automatic;
  updateControls();
  autoButton.focus();
  schedule();
}

function showStory() {
  storyDialog.showModal();
  storyDialog.scrollTop = 0;
}

launch.addEventListener('click', () => modeDialog.showModal());
modeDialog.querySelectorAll('[data-mode]').forEach(button => {
  button.addEventListener('click', () => begin(button.dataset.mode));
});
journeyButton.addEventListener('click', () => {
  mapDialog.showModal();
  journeyButton.setAttribute('aria-expanded', 'true');
});
mapDialog.addEventListener('close', () => journeyButton.setAttribute('aria-expanded', 'false'));
readButton.addEventListener('click', event => {
  event.preventDefault();
  showStory();
});
document.getElementById('hide-chapter').addEventListener('click', () => {
  state.narrating = false;
  updateControls();
  chapterButton.focus();
});
chapterButton.addEventListener('click', () => arrive(state.current, true));
previousButton.addEventListener('click', () => travel(state.current - 1, state.mode === 'auto'));
nextButton.addEventListener('click', () => travel(state.current + 1, state.mode === 'auto'));
continueButton.addEventListener('click', () => {
  if (state.current === chapters.length - 1) showStory();
  else travel(state.current + 1, state.mode === 'auto');
});
autoButton.addEventListener('click', () => {
  if (state.destination !== null) {
    state.destination = null;
    state.riding = false;
    updateControls();
    return;
  }
  state.mode = 'auto';
  travel(state.current === chapters.length - 1 ? 0 : state.current + 1, true);
});
qualityButton.addEventListener('click', () => {
  state.quality = state.quality === 'light' ? 'high' : 'light';
  qualityButton.textContent = `Quality: ${state.quality}`;
  qualityButton.setAttribute('aria-pressed', String(state.quality === 'high'));
  resize();
});

function useDirection(direction) {
  if (!state.entered) return;
  state.mode = 'manual';
  state.riding = false;
  state.destination = null;
  if (direction === 'up' || direction === 'down') {
    const index = state.current + (direction === 'up' ? 1 : -1);
    if (reducedMotion.matches && index >= 0 && index < chapters.length) {
      arrive(index, true);
      return;
    }
    state.narrating = false;
  } else if (reducedMotion.matches) {
    state.steer = limit(state.steer + (direction === 'left' ? -.3 : .3), -1, 1);
    paint();
    return;
  }
  held.add(direction);
  updateControls();
  schedule();
}

document.addEventListener('keydown', event => {
  const modal = document.querySelector('.jayesh-world dialog[open]');
  if (modal) {
    if (modal === modeDialog && event.code === 'Space' && !event.target.closest('[data-mode]')) {
      event.preventDefault();
      begin('manual');
    }
    return;
  }
  if (!state.entered && event.code === 'Space' && !event.target.closest('button, a')) {
    event.preventDefault();
    begin('manual');
    return;
  }
  const direction = arrows.get(event.key) || arrows.get(event.key.toLowerCase());
  if (!state.entered || !direction || event.altKey || event.ctrlKey || event.metaKey) return;
  event.preventDefault();
  if (!event.repeat) useDirection(direction);
});
document.addEventListener('keyup', event => {
  held.delete(arrows.get(event.key) || arrows.get(event.key.toLowerCase()));
});
window.addEventListener('blur', () => held.clear());
touchControls.querySelectorAll('[data-direction]').forEach(button => {
  const direction = button.dataset.direction;
  button.addEventListener('pointerdown', event => {
    button.setPointerCapture(event.pointerId);
    useDirection(direction);
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => {
    button.addEventListener(type, () => held.delete(direction));
  });
  button.addEventListener('click', event => {
    if (event.detail !== 0) return;
    if (direction === 'up') travel(state.current + 1, false);
    else if (direction === 'down') travel(state.current - 1, false);
    else {
      state.steer = limit(state.steer + (direction === 'left' ? -.3 : .3), -1, 1);
      paint();
    }
  });
});

function resize() {
  const { width, height } = stage.getBoundingClientRect();
  state.width = width;
  state.height = height;
  state.pixelRatio = Math.min(window.devicePixelRatio || 1, state.quality === 'high' ? 2 : 1.4);
  canvas.width = Math.round(width * state.pixelRatio);
  canvas.height = Math.round(height * state.pixelRatio);
  paint();
}

function ellipse(x, y, radiusX, radiusY, color) {
  ink.beginPath();
  ink.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
  ink.fillStyle = color;
  ink.fill();
}

function polygon(points, fill) {
  ink.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) ink.moveTo(x, y);
    else ink.lineTo(x, y);
  });
  ink.closePath();
  ink.fillStyle = fill;
  ink.fill();
}

const speckles = Array.from({ length: 380 }, (_, index) => ({
  longitude: index * 2.39996,
  latitude: Math.asin(1 - 2 * (index + .5) / 380),
  radius: 1 + index % 5 * .4
}));

function globe() {
  const width = state.width;
  const height = state.height;
  const radius = Math.min(168, height * .40, width * .34);
  const centerX = width * .5;
  const centerY = height * .48;
  ink.save();
  ink.translate(centerX, centerY);
  ink.scale(radius, radius);
  ellipse(.06, 1.04, .72, .075, '#51686215');

  const base = ink.createRadialGradient(-.32, -.55, .02, 0, 0, 1.05);
  base.addColorStop(0, '#d0c69d');
  base.addColorStop(.51, '#7b9370');
  base.addColorStop(.82, '#50716e');
  base.addColorStop(1, '#26484b');
  ellipse(0, 0, 1, 1, base);

  ink.save();
  ink.beginPath();
  ink.arc(0, 0, 1, 0, Math.PI * 2);
  ink.clip();
  const drift = Math.sin(state.angle) * .21;
  const sea = ink.createRadialGradient(-.47, .29, .05, .05, .52, 1);
  sea.addColorStop(0, '#7fbab0');
  sea.addColorStop(.53, '#347b78');
  sea.addColorStop(1, '#193c4c');
  ink.beginPath();
  ink.moveTo(-1.1, .30);
  ink.bezierCurveTo(-.72, -.09 + drift, -.39, .43 - drift, -.03, .18);
  ink.bezierCurveTo(.29, -.01, .64, .49 + drift, 1.11, .13 + drift);
  ink.lineTo(1.1, 1.06);
  ink.lineTo(-1.1, 1.06);
  ink.closePath();
  ink.fillStyle = sea;
  ink.fill();
  ink.strokeStyle = '#d7c89e';
  ink.lineWidth = .045;
  ink.stroke();

  speckles.forEach((speckle, index) => {
    const angle = speckle.longitude + state.angle;
    const depth = Math.cos(angle) * Math.cos(speckle.latitude);
    if (depth <= 0) return;
    const x = Math.sin(angle) * Math.cos(speckle.latitude);
    const y = -Math.sin(speckle.latitude);
    const size = speckle.radius * (.003 + depth * .006);
    const colors = y < .19 ? ['#385941a8', '#e3deb3b8', '#687e4eb5'] : ['#becdc859', '#b3d2c33d', '#25536560'];
    ellipse(x, y, size, size * .52, colors[index % 3]);
  });

  const mountainColors = ['#4d6e57', '#728562', '#8d996b', '#365e58'];
  for (let index = 0; index < 7; index++) {
    const left = -.9 + index * .28 + drift * .9;
    const bottom = -.43 + .06 * Math.sin(index + state.angle);
    const peak = bottom - .25 - index % 3 * .045;
    polygon([[left - .21, bottom], [left, peak], [left + .25, bottom]], mountainColors[index % 4]);
    polygon([[left, peak], [left + .04, peak + .14], [left + .25, bottom]], '#2749436e');
  }

  ink.beginPath();
  ink.moveTo(-1, -.16 + drift);
  ink.bezierCurveTo(-.54, -.32, -.37, .05, -.02, -.13 + drift);
  ink.bezierCurveTo(.37, -.25, .71, -.31 - drift, 1, -.18);
  ink.strokeStyle = '#dacca6';
  ink.lineWidth = .067;
  ink.stroke();
  ink.strokeStyle = '#605f50';
  ink.lineWidth = .036;
  ink.stroke();

  for (let index = 0; index < 6; index++) {
    const x = -.77 + index * .30 + drift;
    const y = -.17 + Math.sin(index * 1.4 + state.angle) * .09;
    ellipse(x, y, .026, .026, '#f3eed8');
    ellipse(x, y, .016, .016, index === 5 ? '#cf9e4f' : '#842f25');
  }
  ink.restore();
  ink.restore();
}

const chapterPalettes = [
  ['#d5e2d7', '#91a880', '#b9bf8e', '#526a4d'],
  ['#dee5db', '#a1ab78', '#c8c58d', '#677c56'],
  ['#e5e4d7', '#9da77a', '#b6ac7d', '#5c735e'],
  ['#dce4e6', '#9daeb0', '#bbc2a8', '#536f6a'],
  ['#e2e5d6', '#a8b18b', '#b8c09a', '#617850'],
  ['#d8e8e4', '#8dab9c', '#b7c7ad', '#4b786e']
];

function trail() {
  const { width, height, distance, steer } = state;
  const [sky, hills, meadow, trees] = chapterPalettes[state.current];
  const horizon = height * .42;
  const floor = height * .60;
  const curve = Math.sin(distance * 2.2) * width * .075;
  const center = (unit) => width * .50 + Math.sin(unit * Math.PI * 1.6) * curve - steer * width * unit * .13;
  const yAt = unit => horizon + Math.pow(unit, 1.54) * floor;
  const trailWidth = unit => 2 + width * .29 * Math.pow(unit, 1.25);

  const morning = ink.createLinearGradient(0, 0, 0, horizon);
  morning.addColorStop(0, sky);
  morning.addColorStop(1, '#f6f1dc');
  ink.fillStyle = morning;
  ink.fillRect(0, 0, width, height);
  ellipse(width * .73, height * .23, height * .049, height * .049, '#fff4cb');

  const mountainRange = (level, fill, phase) => {
    const peaks = Array.from({ length: 15 }, (_, index) => {
      const x = (index - 1) * width / 12;
      const y = horizon - level * (.35 + .6 * Math.abs(Math.sin(index * 1.17 + phase)));
      return [x, y];
    });
    polygon([...peaks, [width, horizon + 8], [0, horizon + 8]], fill);
  };
  mountainRange(height * .24, hills, 2.3 + distance * .06);
  mountainRange(height * .12, trees, distance * .10);
  ink.fillStyle = meadow;
  ink.fillRect(0, horizon, width, floor);

  const segments = 38;
  for (let index = 0; index < segments; index++) {
    const near = (index + 1) / segments;
    const far = index / segments;
    const color = Math.floor(index / 2 + distance * 17) % 2;
    const y0 = yAt(far);
    const y1 = yAt(near) + .7;
    const x0 = center(far);
    const x1 = center(near);
    const r0 = trailWidth(far) * .54;
    const r1 = trailWidth(near) * .54;
    if (color) {
      ink.fillStyle = '#71875919';
      ink.fillRect(0, y0, width, y1 - y0);
    }
    polygon([[x0 - r0, y0], [x0 + r0, y0], [x1 + r1, y1], [x1 - r1, y1]], color ? '#bca583' : '#c5af8d');
  }

  const terrainDetails = state.quality === 'high' ? 32 : 22;
  for (let side = -1; side <= 1; side += 2) {
    const plants = Array.from({ length: terrainDetails }, (_, index) => ({
      index,
      depth: (index * .151 + distance * .28 + (side + 1) * .24) % 1
    })).sort((left, right) => left.depth - right.depth);
    plants.forEach(({ index, depth }) => {
      const unit = depth * .96;
      const variation = .09 + Math.abs(Math.sin(index * 5.19 + side)) * .30;
      const x = center(unit) + side * (trailWidth(unit) * .55 + width * variation * unit);
      const y = yAt(unit);
      const scale = Math.pow(unit, 1.25) * Math.min(70, height * .069);
      if (scale < 2) return;
      ellipse(x, y, scale * .48, scale * .12, '#31483133');
      ink.fillStyle = '#615848';
      ink.fillRect(x - scale * .048, y - scale * .65, scale * .096, scale * .65);
      const color = index % 3 === 0 ? '#617648' : trees;
      polygon([[x, y - scale * 1.18], [x + scale * .41, y - scale * .29], [x - scale * .4, y - scale * .29]], color);
      polygon([[x, y - scale * .9], [x + scale * .48, y - scale * .18], [x - scale * .48, y - scale * .18]], color);
    });
  }

  // An original hiker illustration moves across the trail with the steering input.
  const scale = limit(height * .062, 23, 53);
  const x = width * .5 + steer * width * .13;
  const y = height * .76;
  ellipse(x, y + scale * .12, scale * .35, scale * .12, '#46382832');
  polygon([[x - scale * .18, y - scale * .44], [x - scale * .05, y - scale * .44], [x - scale * .10, y + scale * .08], [x - scale * .23, y + scale * .08]], '#313a38');
  polygon([[x + scale * .18, y - scale * .44], [x + scale * .05, y - scale * .44], [x + scale * .10, y + scale * .08], [x + scale * .23, y + scale * .08]], '#313a38');
  ellipse(x, y - scale * .88, scale * .16, scale * .16, '#51463a');
  ellipse(x, y - scale * .50, scale * .23, scale * .34, '#334848');
  ellipse(x, y - scale * .46, scale * .19, scale * .26, '#b16a42');
  ink.fillStyle = '#e1ba72';
  ink.fillRect(x - scale * .14, y - scale * .47, scale * .28, scale * .067);
}

function paint() {
  if (!ink || !state.width || !state.height) return;
  ink.setTransform(state.pixelRatio, 0, 0, state.pixelRatio, 0, 0);
  ink.clearRect(0, 0, state.width, state.height);
  if (state.entered) trail();
  else globe();
}

let frameId = 0;
let lastFrame = 0;

function schedule() {
  if (!frameId && !document.hidden && !reducedMotion.matches) frameId = requestAnimationFrame(frame);
}

function frame(time) {
  frameId = 0;
  const step = lastFrame ? Math.min((time - lastFrame) / 1000, .05) : 0;
  lastFrame = time;
  if (document.querySelector('.jayesh-world dialog[open]')) {
    lastFrame = 0;
    return;
  }
  if (!state.entered) {
    state.angle += step * .29;
    paint();
    schedule();
    return;
  }

  let direction = 0;
  if (state.destination !== null) direction = Math.sign(state.destination - state.distance);
  else if (held.has('up') || held.has('down')) direction = Number(held.has('up')) - Number(held.has('down'));
  state.distance = limit(state.distance + direction * step * (state.riding ? .37 : .55), 0, chapters.length - 1);
  state.steer = limit(state.steer + (Number(held.has('right')) - Number(held.has('left'))) * step * 1.2, -1, 1);

  const moveFocus = state.destination !== null && document.activeElement === autoButton;
  if (direction > 0 && state.distance >= state.current + 1) arrive(state.current + 1, moveFocus);
  else if (direction < 0 && state.distance <= state.current - 1) arrive(state.current - 1, moveFocus);
  else if (state.destination === state.distance) arrive(state.destination, moveFocus);
  paint();
  if (state.destination !== null || held.size) schedule();
  else lastFrame = 0;
}

[modeDialog, mapDialog, storyDialog].forEach(dialog => dialog.addEventListener('close', schedule));
new ResizeObserver(resize).observe(stage);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) held.clear();
  else schedule();
});
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) {
    cancelAnimationFrame(frameId);
    frameId = 0;
    lastFrame = 0;
    if (state.destination !== null) arrive(state.destination);
  } else schedule();
});
resize();
schedule();
if (location.hash === '#journey-story') showStory();
