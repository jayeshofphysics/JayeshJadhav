'use strict';

(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const topics = [
    {
      match: /\b(?:résumé|resume|cv|curriculum vitae|download)\b/iu,
      text: 'Jayesh’s résumé covers his research experience, education, projects, and experimental skills.',
      links: [['Download résumé', 'assets/Jayesh_Jadhav_Resume.pdf']]
    },
    {
      match: /\b(?:linkedin|github|instagram|socials?)\b/i,
      text: 'Jayesh links to his LinkedIn, GitHub, and Instagram in the contact section.',
      links: [['Social links', '#contact'], ['GitHub', 'https://github.com/jayeshofphysics']]
    },
    {
      match: /\b(?:contact|e-?mail|reach|connect)\b/i,
      text: 'You can reach Jayesh at jayesh10042003@gmail.com. His contact section also has a form that opens an email draft.',
      links: [['Contact section', '#contact'], ['Email Jayesh', 'mailto:jayesh10042003@gmail.com']]
    },
    {
      match: /\b(?:collaborat\w*|hiring|hire|opportunit\w*)\b/i,
      text: 'Jayesh is open to research collaborations, new opportunities, and conversations about experimental physics. His work includes quantum hardware, thin-film optics, and high-pressure spectroscopy.',
      links: [['Research collaboration', 'research/'], ['Contact Jayesh', '#contact']]
    },
    {
      match: /\b(?:cpw|microwaves?|waveguides?|hfss|tin|kinetic inductance)\b/i,
      text: 'Jayesh models superconducting coplanar waveguides that carry microwave signals on quantum circuits. His simulations use HFSS to study around 50 Ω characteristic impedance, TiN film properties, and kinetic inductance.',
      links: [['Featured projects', '#projects']]
    },
    {
      match: /\b(?:indium|micro.?bumps?|flip.?chip|qubits?|interconnects?|electroplat\w*|quantum hardware)\b/i,
      text: 'At IIT Bombay, Jayesh works on indium micro-bumps to connect qubit and readout chips. The process uses lithography, sputtering, etching, indium electroplating, and flip-chip bonding for 3D integration.',
      links: [['Featured projects', '#projects']]
    },
    {
      match: /\b(?:optics|optical|photovoltaics?|solar|electrodes?|izo|setfos|transmittance)\b/i,
      text: 'Jayesh’s MSc research at NCPRE, IIT Bombay studied IZO/Ag/IZO transparent electrodes for tandem solar cells. He combined thin-film fabrication and measurements with optical modelling in Setfos to study electrical conductivity and optical transmission.',
      links: [['Featured projects', '#projects']]
    },
    {
      match: /\b(?:raman|spectroscopy|barc|synchrotron|xrd|pressure|diamond.?anvil|rrcat)\b/i,
      text: 'Jayesh studied high-pressure Raman spectra of Na₂Cu₂TeO₆ with a diamond-anvil cell up to about 10 GPa at BARC. Related high-pressure synchrotron X-ray diffraction measurements used INDUS-2 Beamline 11 at RRCAT.',
      links: [['Featured projects', '#projects'], ['Experience', '#experience']]
    },
    {
      match: /\b(?:skills?|tech stack|tools?|methods?|techniques?|python|software|fabrication|characteri[sz]ation)\b/i,
      text: 'Jayesh’s skills span fabrication, modelling, and characterisation. His toolkit includes optical lithography, sputtering, etching, Python, HFSS, Setfos, four-point probe measurements, and spectroscopic techniques.',
      links: [['Tech stack', '#skills']]
    },
    {
      match: /\b(?:jrf|fellow|experience|timeline|education|thesis|university|msc|degree)\b/i,
      text: 'Jayesh is a Junior Research Fellow at IIT Bombay. His earlier work includes an MSc project at NCPRE on transparent electrodes, Raman spectroscopy at BARC, synchrotron XRD at RRCAT, and an EMI-shielding composite study at Lovely Professional University.',
      links: [['Experience timeline', '#experience'], ['Download résumé', 'assets/Jayesh_Jadhav_Resume.pdf']]
    },
    {
      match: /\b(?:photography|trekking|hills|hobbies|hobby|personal|outside|world)\b/i,
      text: 'Jayesh grew up in a village near the hills. Outside the lab, he enjoys trekking and photography.',
      links: [['World of Jayesh', 'world/']]
    },
    {
      match: /\b(?:projects?|research|work|physics|jayesh|about|who|hello|hi)\b/i,
      text: 'Jayesh Jadhav is an experimental physicist and Junior Research Fellow at IIT Bombay. His featured projects cover indium flip-chip interconnects, superconducting microwave circuits, thin-film solar electrodes, and high-pressure Raman spectroscopy and XRD.',
      links: [['About Jayesh', '#about'], ['Featured projects', '#projects']]
    }
  ];

  const fallback = {
    text: 'I can look up Jayesh’s research, lab methods, experience, résumé, and contact details. Try asking about indium flip-chip interconnects, solar electrodes, or high-pressure Raman spectroscopy.',
    links: [['Featured projects', '#projects'], ['Contact Jayesh', '#contact']]
  };

  const template = document.createElement('template');
  template.innerHTML = `
    <button type="button" class="chat-fab wave-target" aria-label="Open Jayesh’s portfolio guide"
      aria-haspopup="dialog" aria-controls="portfolio-guide" style="animation-delay: 1.2s" hidden>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/>
      </svg>
      <span><span class="wave-text"><span class="sr-only">Ask Jayesh</span><span class="wave-words" aria-hidden="true"><span class="wave-window"><span class="wave-glyph" data-char="Ask">Ask</span></span> <span class="wave-window"><span class="wave-glyph" data-char="Jayesh">Jayesh</span></span></span></span></span>
    </button>
    <dialog id="portfolio-guide" class="chat-panel" aria-labelledby="assistant-title">
      <div class="chat-toolbar">
        <div class="chat-toolbar-title">
          <span class="chat-avatar" aria-hidden="true">J.</span>
          <div><h2 id="assistant-title">Jayesh’s Portfolio Guide</h2><p>Projects, skills &amp; experience</p></div>
        </div>
        <button type="button" class="chat-close" aria-label="Close guide" autofocus>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m18 6-12 12M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="chat-messages" role="log" aria-live="polite" aria-atomic="false" aria-label="Chat messages">
        <div class="chat-welcome"><h3>Get to know<br>Jayesh’s work.</h3></div>
      </div>
      <form class="chat-form">
        <label class="sr-only" for="chat-input">Ask the portfolio guide</label>
        <div class="chat-input-row">
          <textarea rows="1" class="chat-input" id="chat-input" maxlength="2000" placeholder="Ask about Jayesh…"
            autocomplete="off" enterkeyhint="send"></textarea>
          <button class="chat-send" type="submit" aria-label="Send message" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 19V5m-7 7 7-7 7 7"/>
            </svg>
          </button>
        </div>
        <div class="chat-input-note"><span class="chat-muted">This guide uses portfolio information and runs on your device.</span><span class="chat-muted" data-chat-count hidden></span></div>
      </form>
    </dialog>`;

  const trigger = template.content.querySelector('.chat-fab');
  const panel = template.content.querySelector('.chat-panel');
  const welcome = panel.querySelector('.chat-welcome');
  const messages = panel.querySelector('.chat-messages');
  const input = panel.querySelector('.chat-input');
  const form = panel.querySelector('.chat-form');
  const send = panel.querySelector('.chat-send');
  const count = panel.querySelector('[data-chat-count]');
  document.body.append(template.content);

  let heroPassed = hero.getBoundingClientRect().bottom <= 0;
  let pageOverflow = '';

  function updateLauncher() {
    trigger.hidden = !heroPassed || panel.open;
  }

  updateLauncher();
  const heroObserver = new IntersectionObserver(([entry]) => {
    heroPassed = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;
    updateLauncher();
  });
  heroObserver.observe(hero);

  function updateInput() {
    input.style.height = '0px';
    input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
    send.disabled = !input.value.trim();
    count.hidden = input.value.length <= 1500;
    if (!count.hidden) count.textContent = `${input.value.length}/2000`;
  }

  trigger.addEventListener('click', () => {
    pageOverflow = document.body.style.overflow;
    panel.showModal();
    document.body.style.overflow = 'hidden';
    updateLauncher();
    updateInput();
    messages.scrollTop = messages.scrollHeight;
  });
  panel.querySelector('.chat-close').addEventListener('click', () => panel.close());
  panel.addEventListener('close', () => {
    document.body.style.overflow = pageOverflow;
    updateLauncher();
    if (!trigger.hidden) trigger.focus({ preventScroll: true });
  });

  input.addEventListener('input', updateInput);
  input.addEventListener('keydown', event => {
    if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return;
    event.preventDefault();
    if (input.value.trim()) form.requestSubmit();
  });

  function appendMessage(className, childClass, content) {
    const message = document.createElement('div');
    message.className = `chat-message${className}`;
    const body = document.createElement('div');
    body.className = childClass;
    body.append(...content);
    message.append(body);
    messages.append(message);
  }

  function messagePart(tag, className, text) {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const prompt = input.value.trim();
    if (!prompt) return;

    welcome.remove();
    appendMessage(' is-user', 'chat-user', [messagePart('span', 'sr-only', 'You: '), prompt]);

    const { text, links } = topics.find(topic => topic.match.test(prompt)) || fallback;
    const linkRow = document.createElement('p');
    links.forEach(([label, href], index) => {
      const link = messagePart('a', 'chat-link underline underline-offset-2', label);
      link.href = href;
      if (href.charAt(0) === '#') link.addEventListener('click', () => panel.close());
      if (href.endsWith('.pdf')) link.download = '';
      if (index) linkRow.append(' · ');
      linkRow.append(link);
    });
    appendMessage('', 'chat-assistant', [
      messagePart('span', 'chat-speaker', 'Portfolio guide'),
      messagePart('p', 'mb-2', text),
      linkRow
    ]);

    input.value = '';
    input.focus();
    updateInput();
    messages.scrollTop = messages.scrollHeight;
  });
})();
