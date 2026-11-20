(() => {
  'use strict';

  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) return;

  const settingKey = 'portfolio-sound';
  const volume = 0.15;
  const gestureTypes = new Set(['click', 'keydown', 'pointerup', 'touchend', 'cancel']);
  const lastPlayed = new Map();
  let enabled = readSetting();
  let audio;
  let output;
  let noise;

  function readSetting() {
    try {
      return localStorage.getItem(settingKey) !== 'off';
    } catch {
      return true;
    }
  }

  function prepare(event) {
    if (!enabled || document.hidden || !event?.isTrusted || event.repeat || !gestureTypes.has(event.type)) return;
    if (audio?.state === 'running') return Promise.resolve();
    if (navigator.userActivation && !navigator.userActivation.isActive) return;

    try {
      if (!audio) {
        audio = new Audio();
        output = audio.createGain();
        output.gain.value = volume;
        output.connect(audio.destination);
      }
      return audio.resume();
    } catch {
      // Audio can be unavailable even when the browser exposes the API.
    }
  }

  function playEnvelope(start, duration, peak) {
    const envelope = audio.createGain();
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.linearRampToValueAtTime(peak, start + Math.min(0.008, duration / 4));
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    envelope.connect(output);
    return envelope;
  }

  function schedule(source, start, duration, peak, filter) {
    const envelope = playEnvelope(start, duration, peak);
    source.connect(filter || envelope);
    filter?.connect(envelope);
    source.addEventListener('ended', () => {
      source.disconnect();
      filter?.disconnect();
      envelope.disconnect();
    }, { once: true });
    source.start(start);
    source.stop(start + duration);
  }

  function tone(at, duration, from, to, peak) {
    if (at < audio.currentTime - 0.025) return;
    const start = Math.max(at, audio.currentTime);
    const oscillator = audio.createOscillator();
    oscillator.frequency.setValueAtTime(from, start);
    oscillator.frequency.exponentialRampToValueAtTime(to, start + duration);
    schedule(oscillator, start, duration, peak);
  }

  function rustle(at, duration, from, to, peak) {
    if (at < audio.currentTime - 0.025) return;
    const start = Math.max(at, audio.currentTime);
    if (!noise) {
      noise = audio.createBuffer(1, Math.ceil(audio.sampleRate * 0.2), audio.sampleRate);
      const samples = noise.getChannelData(0);
      for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    }
    const source = audio.createBufferSource();
    source.buffer = noise;
    const filter = audio.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 0.75;
    filter.frequency.setValueAtTime(from, start);
    filter.frequency.exponentialRampToValueAtTime(to, start + duration);
    schedule(source, start, duration, peak, filter);
  }

  const cues = {
    'menu-close'(start, { dropDelay = 220, shrinkDelay = 1220, reduced = false } = {}) {
      if (reduced) {
        tone(start, 0.047, 220, 132, 0.15);
        return;
      }
      const drop = start + dropDelay / 1000;
      for (const [index, offset] of [0, 0.065, 0.15, 0.26, 0.40, 0.53].entries()) {
        const pitch = 2350 - index * 220;
        rustle(drop + offset, 0.068, pitch, pitch * 0.54, 0.23 - index * 0.017);
      }
      const shrink = start + shrinkDelay / 1000;
      rustle(shrink, 0.15, 1670, 420, 0.27);
      tone(shrink + 0.12, 0.055, 175, 96, 0.15);
    },
    'project-open'(start) {
      rustle(start, 0.092, 920, 2270, 0.24);
      tone(start + 0.027, 0.050, 315, 215, 0.12);
    },
    'deck-flip'(start) {
      rustle(start, 0.092, 2380, 1040, 0.24);
      tone(start + 0.041, 0.041, 225, 135, 0.11);
    }
  };

  function play(name, event, timing) {
    if (!Object.hasOwn(cues, name)) return;
    const requested = performance.now();
    if (requested - (lastPlayed.get(name) ?? -Infinity) < 80) return;
    const ready = prepare(event);
    if (!ready) return;
    lastPlayed.set(name, requested);
    ready.then(() => {
      if (!enabled || document.hidden || audio.state !== 'running') return;
      // Compensate for time spent waking the audio device so delayed cues still track the motion.
      const elapsed = name === 'menu-close' && !timing?.reduced ? (performance.now() - requested) / 1000 : 0;
      cues[name](audio.currentTime + 0.012 - elapsed, timing);
    }).catch(() => {});
  }

  window.portfolioSound = {
    play,
    unlock(event) {
      // Opening the menu primes audio silently so Escape can close it with sound.
      prepare(event)?.catch(() => {});
    }
  };

  const socials = document.querySelector('#navigation-panel .nav-panel-socials');
  if (!socials) return;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-menu-piece portfolio-sound-toggle';
  toggle.setAttribute('aria-label', 'Sound effects');
  const speaker = '<path d="M11 5 6 9H3v6h3l5 4z"/>';
  const soundOn = '<path d="M15.5 8.5a5 5 0 0 1 0 7m3-10a9 9 0 0 1 0 13"/>';
  const soundOff = '<path d="m16 9 5 6m0-6-5 6"/>';

  function updateOutput() {
    if (output) output.gain.setTargetAtTime(enabled && !document.hidden ? volume : 0, audio.currentTime, 0.01);
  }

  function updateToggle() {
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.title = enabled ? 'Mute sound effects' : 'Unmute sound effects';
    toggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${speaker}${enabled ? soundOn : soundOff}</svg>`;
    updateOutput();
  }

  toggle.addEventListener('click', event => {
    enabled = !enabled;
    try {
      localStorage.setItem(settingKey, enabled ? 'on' : 'off');
    } catch {
      // Keep the choice for the current page when storage is unavailable.
    }
    updateToggle();
    if (enabled) window.portfolioSound.unlock(event);
  });
  window.addEventListener('storage', event => {
    if (event.key !== settingKey && event.key !== null) return;
    enabled = readSetting();
    updateToggle();
  });
  document.addEventListener('visibilitychange', updateOutput);
  updateToggle();
  socials.append(toggle);
})();
