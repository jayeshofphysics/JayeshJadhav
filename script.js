(() => {
  'use strict';

  const panel = document.getElementById('project-details-panel');
  const folders = [...document.querySelectorAll('.project-folder')];
  const studies = [...panel.querySelectorAll('.project-study')];
  const toolbarLabel = panel.querySelector('.project-panel-toolbar > span');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let selectedFolder = null;

  function displayStudy(folder) {
    const id = folder?.dataset.folderId;
    const heading = id ? `${id}-title` : null;
    for (const study of studies) {
      study.hidden = study.getAttribute('aria-labelledby') !== heading;
    }
    for (const button of folders) {
      button.setAttribute('aria-expanded', String(button === folder));
    }
    panel.hidden = !folder;
    if (heading) {
      panel.setAttribute('aria-labelledby', heading);
    } else {
      panel.removeAttribute('aria-labelledby');
    }
  }

  function closeStudy() {
    const trigger = selectedFolder;
    selectedFolder = null;
    displayStudy(null);
    if (trigger) {
      trigger.focus({ preventScroll: true });
      trigger.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'nearest' });
    }
  }

  function openStudy(folder) {
    if (folder === selectedFolder) {
      closeStudy();
      return;
    }
    selectedFolder = folder;
    displayStudy(folder);
    toolbarLabel.textContent = folder.dataset.folderId === 'indium-case-study' ? 'Research case study' : 'Project details';
    for (const detail of panel.querySelectorAll('.project-study:not([hidden]) details')) {
      detail.open = true;
    }
    panel.focus({ preventScroll: true });
    panel.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  }

  for (const folder of folders) {
    folder.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || reducedMotion.matches) return;
      const bounds = folder.getBoundingClientRect();
      const angle = ((event.clientX - bounds.left) / bounds.width - 0.5) * 10;
      folder.style.setProperty('--folder-lean', `${angle}deg`);
    });
    folder.addEventListener('pointerleave', () => folder.style.setProperty('--folder-lean', '0deg'));
    folder.addEventListener('click', () => openStudy(folder));
  }

  panel.querySelector('.project-panel-toolbar button').addEventListener('click', closeStudy);
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeStudy();
  });

  const model = panel.querySelector('.architecture-exhibit');
  const modelTabs = [...model.querySelectorAll('[data-model]')];
  const engines = [...model.querySelectorAll('.engine-node')];
  const modelInput = model.querySelector('.diagram-input span');
  const explanation = model.querySelector('.route-explanation p');
  const cases = {
    geometry: ['csv', 'CPW geometry', 'Signal trace and gap dimensions set the characteristic impedance.'],
    material: ['pdf', 'TiN thin film', 'Kinetic inductance and superconducting surface impedance shape the microwave response.']
  };

  for (const [index, tab] of modelTabs.entries()) {
    tab.addEventListener('click', () => {
      const [route, input, description] = cases[tab.dataset.model];
      model.dataset.route = route;
      modelInput.textContent = input;
      explanation.textContent = description;
      for (const [position, button] of modelTabs.entries()) {
        button.setAttribute('aria-pressed', String(position === index));
        engines[position].classList.toggle('engine-active', position === index);
      }
    });
  }

  const year = new Date().getFullYear();
  document.querySelector('[data-current-year]').textContent = `©${year}`;
  document.querySelector('[data-copyright]').textContent = `© ${year} Jayesh Jadhav`;
})();
