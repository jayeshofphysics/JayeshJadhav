'use strict';

const root = document.documentElement;
const themeButton = document.getElementById('theme-button');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
const themeKey = 'jayesh-portfolio-theme';
let chosenTheme;

try {
  chosenTheme = localStorage.getItem(themeKey);
} catch {
  // The theme switch still works if the browser blocks local storage.
}

function applyTheme() {
  const prefersDark = chosenTheme === 'dark' || (chosenTheme !== 'light' && systemTheme.matches);
  root.dataset.theme = prefersDark ? 'dark' : 'light';
  themeButton.setAttribute('aria-pressed', String(prefersDark));
}

applyTheme();
systemTheme.addEventListener('change', applyTheme);

themeButton.addEventListener('click', () => {
  chosenTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme();

  try {
    localStorage.setItem(themeKey, chosenTheme);
  } catch {
    // Retain the chosen theme for the current page.
  }
});

const menuToggle = document.getElementById('menu-toggle');
const menu = document.getElementById('floating-menu');

function setMenu(open) {
  menu.hidden = !open;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

menuToggle.addEventListener('click', () => setMenu(menu.hidden));

menu.addEventListener('click', event => {
  if (event.target.closest('a')) setMenu(false);
});

document.addEventListener('click', event => {
  if (!menu.hidden && !event.target.closest('.site-header')) setMenu(false);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !menu.hidden) {
    setMenu(false);
    menuToggle.focus();
  }
});

const projects = {
  indium: {
    index: 'Quantum hardware · 2026–present',
    title: 'Indium micro-bumps for qubit–readout flip-chip integration',
    summary: 'Making microscopic metal connections that allow quantum-device chips to be integrated into larger architectures.',
    plain: 'Different chips in a quantum computer need to exchange signals. I develop tiny indium interconnects that can join them together while preserving the integrity of those connections.',
    technical: 'Electroplated indium bump fabrication, seed-layer interfaces, optical lithography, sputtering, wet/dry etching, flip-chip bonding and 3D quantum-device integration.',
    tags: ['Indium electrodeposition', 'Flip-chip', 'Nanofabrication', 'IIT Bombay'],
    image: 'assets/indium.webp',
    alt: 'Concept illustration of indium micro-bump structures'
  },
  cpw: {
    index: 'Superconducting circuits · Current study',
    title: 'Superconducting CPW microwave structures',
    summary: 'Designing the pathways that carry microwave signals on superconducting quantum circuits.',
    plain: 'Microwave signals are used to interact with many superconducting quantum devices. I model how a circuit’s shape and materials control how these signals travel.',
    technical: 'CPW geometry for approximately 50 Ω characteristic impedance, TiN film properties, kinetic inductance and HFSS electromagnetic simulations with superconducting surface-impedance boundary models.',
    tags: ['HFSS', 'Microwave design', 'TiN', 'Kinetic inductance'],
    image: 'assets/cpw.webp',
    alt: 'Top-view schematic of a coplanar waveguide, with a central signal trace separated from two ground planes by narrow gaps'
  },
  optics: {
    index: 'Photovoltaics · MSc thesis',
    title: 'IZO/Ag/IZO transparent electrodes for tandem solar cells',
    summary: 'Making ultrathin electrodes that conduct electricity while allowing more sunlight through.',
    plain: 'Solar cells need transparent electrodes. I studied thin layers of indium zinc oxide and silver that balance electrical conductivity with optical transparency.',
    technical: 'RF sputtering and thermal evaporation of IZO and IZO/Ag/IZO stacks, with Setfos optical simulation, UV–Vis–NIR spectroscopy, sheet-resistance measurements and interference/admittance modelling. Studied modelled transmittance: 78.7% (IZO) versus 85.2% (IZO/Ag/IZO) over 300–800 nm.',
    tags: ['IZO / Ag / IZO', 'Setfos', 'Thin-film optics', 'NCPRE'],
    image: 'assets/optics.webp',
    alt: 'Concept illustration of optically active multilayer thin films'
  },
  raman: {
    index: 'Spectroscopy · 2025',
    title: 'High-pressure Raman spectroscopy and synchrotron XRD',
    summary: 'Studying how structure and atomic vibrations respond when materials are compressed.',
    plain: 'By putting materials under pressure and probing them with laser light or X-rays, we can observe signatures of their changing physical properties.',
    technical: 'High-pressure Raman spectroscopy of Na₂Cu₂TeO₆ using a diamond-anvil cell up to about 10 GPa at BARC; related synchrotron high-pressure XRD measurements on INDUS-2 Beamline 11 at RRCAT.',
    tags: ['BARC', 'INDUS-2', 'Raman', 'Diamond-anvil cell'],
    image: 'assets/raman.svg',
    alt: 'Illustrative spectral trace, not real experimental data'
  }
};

const dialog = document.getElementById('project-dialog');
const projectFields = {
  index: document.getElementById('dialog-index'),
  title: document.getElementById('dialog-title'),
  summary: document.getElementById('dialog-summary'),
  plain: document.getElementById('dialog-plain'),
  technical: document.getElementById('dialog-technical')
};
const projectVisual = document.getElementById('dialog-visual');
const projectTags = document.getElementById('dialog-tags');
let projectButton;

for (const button of document.querySelectorAll('button[data-project]')) {
  button.addEventListener('click', () => {
    const project = projects[button.dataset.project];
    if (!project || dialog.open) return;

    projectButton = button;
    for (const [field, element] of Object.entries(projectFields)) {
      element.textContent = project[field];
    }

    const image = document.createElement('img');
    image.src = project.image;
    image.alt = project.alt;
    projectVisual.replaceChildren(image);

    const tags = project.tags.map(label => {
      const tag = document.createElement('span');
      tag.textContent = label;
      return tag;
    });
    projectTags.replaceChildren(...tags);
    dialog.showModal();
  });
}

// A click on the backdrop is retargeted to the dialog. Its padding is inside the box.
let pointerStartedOnBackdrop = false;

function isBackdrop(event) {
  if (event.target !== dialog) return false;

  const { left, right, top, bottom } = dialog.getBoundingClientRect();
  return event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom;
}

dialog.addEventListener('pointerdown', event => {
  pointerStartedOnBackdrop = isBackdrop(event);
});

dialog.addEventListener('click', event => {
  if (pointerStartedOnBackdrop && isBackdrop(event)) dialog.close();
  pointerStartedOnBackdrop = false;
});

dialog.addEventListener('close', () => {
  pointerStartedOnBackdrop = false;
  projectButton?.focus({ preventScroll: true });
});

const contactForm = document.getElementById('contact-form');
const contactLink = document.getElementById('contact-email');
const contactStatus = document.getElementById('contact-status');
const copyStatus = document.getElementById('copy-status');
const address = contactLink.getAttribute('href').slice('mailto:'.length);
const senderName = document.getElementById('sender-name');
const senderEmail = document.getElementById('sender-email');
const senderMessage = document.getElementById('sender-message');

contactForm.addEventListener('submit', event => {
  event.preventDefault();
  const name = senderName.value.trim();
  const email = senderEmail.value.trim();
  const message = senderMessage.value.trim();

  if (!name || !message) {
    contactStatus.textContent = 'Please enter your name and a message.';
    (name ? senderMessage : senderName).focus();
    return;
  }

  const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
  const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nReply-to: ${email}`);
  const draft = document.createElement('a');
  draft.href = `mailto:${address}?subject=${subject}&body=${body}`;
  draft.target = '_blank';
  draft.rel = 'noopener';
  draft.textContent = 'Open in your email app';
  contactStatus.replaceChildren('Draft ready. ', draft);
  draft.click();
});

document.getElementById('copy-email').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(address);
    copyStatus.textContent = 'Email address copied.';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(contactLink);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    copyStatus.textContent = 'Email address selected. Use your device’s copy command.';
  }
});

const field = document.querySelector('.field-graphic');
const motionToggle = document.getElementById('motion-toggle');
const motionLabel = motionToggle.querySelector('[data-motion-label]') || motionToggle;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused = false;

function updateMotion() {
  const reduced = reducedMotion.matches;
  field.dataset.paused = String(reduced || motionPaused);
  motionToggle.disabled = reduced;
  motionToggle.setAttribute('aria-pressed', String(reduced || motionPaused));
  motionLabel.textContent = reduced ? 'Motion reduced' : motionPaused ? 'Resume motion' : 'Pause motion';
}

motionToggle.addEventListener('click', () => {
  motionPaused = !motionPaused;
  updateMotion();
});

reducedMotion.addEventListener('change', updateMotion);
updateMotion();

if ('IntersectionObserver' in window) {
  field.dataset.inView = 'false';
  const fieldObserver = new IntersectionObserver(([entry]) => {
    field.dataset.inView = String(entry.isIntersecting);
  });
  fieldObserver.observe(field);
}

for (const year of document.querySelectorAll('.year')) {
  year.textContent = new Date().getFullYear();
}
