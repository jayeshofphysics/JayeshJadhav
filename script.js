'use strict';
const year=String(new Date().getFullYear());
document.querySelectorAll('.year').forEach(el=>el.textContent=year);
const menuToggle=document.getElementById('menu-toggle');
const menu=document.getElementById('floating-menu');
function closeMenu(){menu.hidden=true;menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Open menu')}
menuToggle.addEventListener('click',()=>{const willOpen=menu.hidden;menu.hidden=!willOpen;menuToggle.setAttribute('aria-expanded',String(willOpen));menuToggle.setAttribute('aria-label',willOpen?'Close menu':'Open menu')});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('click',event=>{if(!event.target.closest('.floating-nav'))closeMenu()});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu()});
const themeBtn=document.getElementById('theme-button');
themeBtn.addEventListener('click',()=>{document.body.classList.toggle('contrast');themeBtn.setAttribute('aria-pressed',String(document.body.classList.contains('contrast')))});
themeBtn.setAttribute('aria-pressed','false');
const observer=('IntersectionObserver' in window)?new IntersectionObserver((entries)=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}},{rootMargin:'0px 0px -30px 0px',threshold:.07}):null;
document.querySelectorAll('.reveal').forEach(node=>observer?observer.observe(node):node.classList.add('visible'));

const projects={
 indium:{index:'PROJECT / 01 — 2026–PRESENT',title:'Indium micro-bumps for qubit–readout flip-chip integration',summary:'Making microscopic metal connections that allow quantum-device chips to be integrated into larger architectures.',plain:'Different chips in a quantum computer need to exchange signals. I develop tiny indium interconnects that can join them together while preserving the integrity of those connections.',tech:'Electroplated indium bump fabrication, seed-layer interfaces, optical lithography, sputtering, wet/dry etching, flip-chip bonding and 3D quantum-device integration.',tags:['Indium electrodeposition','Flip-chip','Nanofabrication','IIT Bombay'],image:'assets/indium.webp',alt:'Concept illustration of indium micro-bump structures'},
 cpw:{index:'PROJECT / 02 — CURRENT STUDY',title:'Superconducting CPW microwave structures',summary:'Designing the pathways that carry microwave signals on superconducting quantum circuits.',plain:'Microwave signals are used to interact with many superconducting quantum devices. I model how a circuit’s shape and materials control how these signals travel.',tech:'CPW geometry for approximately 50 Ω characteristic impedance, TiN film properties, kinetic inductance and HFSS electromagnetic simulations with superconducting surface-impedance boundary models.',tags:['HFSS','Microwave design','TiN','Kinetic inductance'],image:'assets/raman.svg',alt:'Illustrative scientific waveform diagram'},
 optics:{index:'PROJECT / 03 — MSc THESIS',title:'IZO/Ag/IZO transparent electrodes for tandem solar cells',summary:'Making ultrathin electrodes that conduct electricity while allowing more sunlight through.',plain:'Solar cells need transparent electrodes. I studied thin layers of indium zinc oxide and silver that balance electrical conductivity with optical transparency.',tech:'RF sputtering and thermal evaporation of IZO and IZO/Ag/IZO stacks, with Setfos optical simulation, UV–Vis–NIR spectroscopy, sheet-resistance measurements and interference/admittance modelling. Studied modelled transmittance: 78.7% (IZO) versus 85.2% (IZO/Ag/IZO) over 300–800 nm.',tags:['IZO / Ag / IZO','Setfos','Thin-film optics','NCPRE'],image:'assets/optics.webp',alt:'Concept illustration of optically active multilayer thin films'},
 raman:{index:'PROJECT / 04 — 2025',title:'High-pressure Raman spectroscopy and synchrotron XRD',summary:'Studying how structure and atomic vibrations respond when materials are compressed.',plain:'By putting materials under pressure and probing them with laser light or X-rays, we can observe signatures of their changing physical properties.',tech:'High-pressure Raman spectroscopy of Na₂Cu₂TeO₆ using a diamond-anvil cell up to about 10 GPa at BARC; related synchrotron high-pressure XRD measurements on INDUS-2 Beamline 11 at RRCAT.',tags:['BARC','INDUS-2','Raman','Diamond-anvil cell'],image:'assets/raman.svg',alt:'Illustrative spectral trace, not real experimental data'}
};
const dialog=document.getElementById('project-dialog');
let lastActivator=null;
for(const button of document.querySelectorAll('.folder-item')){
 button.addEventListener('click',()=>{
  const p=projects[button.dataset.project];if(!p)return;
  lastActivator=button;
  document.getElementById('dialog-index').textContent=p.index;
  document.getElementById('dialog-title').textContent=p.title;
  document.getElementById('dialog-summary').textContent=p.summary;
  document.getElementById('dialog-plain').textContent=p.plain;
  document.getElementById('dialog-technical').textContent=p.tech;
  const visual=document.getElementById('dialog-visual');visual.replaceChildren();
  const img=document.createElement('img');img.src=p.image;img.alt=p.alt;img.loading='eager';visual.append(img);
  const tagGroup=document.getElementById('dialog-tags');tagGroup.replaceChildren(...p.tags.map(tag=>{const s=document.createElement('span');s.textContent=tag;return s}));
  if(dialog.showModal)dialog.showModal();else dialog.setAttribute('open','');
 });
}
dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
dialog.addEventListener('close',()=>lastActivator?.focus());
const contactForm=document.getElementById('contact-form');
contactForm.addEventListener('submit',event=>{
 event.preventDefault();if(!contactForm.reportValidity())return;
 const name=document.getElementById('sender-name').value.trim();
 const email=document.getElementById('sender-email').value.trim();
 const message=document.getElementById('sender-message').value.trim();
 const subject=encodeURIComponent('Portfolio inquiry from '+name);
 const body=encodeURIComponent(`${message}\n\nFrom: ${name}\nReply-to: ${email}`);
 window.location.href=`mailto:jayesh10042003@gmail.com?subject=${subject}&body=${body}`;
});

// An original crowd, assembled as lightweight black-ink SVG characters rather
// than a flattened image. Two perspective layers pass a stationary character.
const crowdScene=document.getElementById('crowd-scene');
const rear=document.getElementById('crowd-rear');
const front=document.getElementById('crowd-front');
const toggle=document.getElementById('crowd-toggle');
const reducedQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
let reduced=reducedQuery.matches,paused=false,visible=false,frameId=0,lastStamp=0,elapsed=0,cast=[];

function personSVG(i){
 const s=i%23,hair=s%6,shirt=s%5,glasses=s%4===0,mustache=s%7===2,earrings=s%8===4,cap=s%13===9;
 const headY=61+(s%3)-1;
 const longHair=hair===1||hair===5;
 const hairBehind=longHair?'<path d="M46 65C36 19 108 13 109 67L118 128 96 128 84 83 59 87 54 127 34 128Z" fill="#141414" stroke="#141414" stroke-width="4"/>':'';
 let top='';
 if(hair===0) top='<path d="M43 60Q36 21 73 21Q109 21 111 62L100 54Q89 43 82 38Q65 55 46 54Z" fill="#171717"/><path d="M53 33Q72 15 95 33" stroke="#f8f8f4" stroke-width="2" fill="none"/>';
 if(hair===1) top='<path d="M48 57Q36 22 72 23Q104 22 105 57L93 47Q72 57 49 48Z" fill="#141414"/>';
 if(hair===2) top='<g fill="#141414"><circle cx="49" cy="43" r="13"/><circle cx="60" cy="29" r="14"/><circle cx="77" cy="27" r="14"/><circle cx="93" cy="31" r="14"/><circle cx="106" cy="47" r="12"/></g>';
 if(hair===3) top='<path d="M42 53Q39 19 82 22Q116 24 106 63L96 50Q78 48 70 32L54 55Z" fill="#151515"/>';
 if(hair===4) top='<path d="M45 54Q38 24 80 23Q112 26 109 56L94 47Q83 56 71 44L51 57Z" fill="#171717"/><path d="M91 33L80 47" stroke="#fff" stroke-opacity=".7" stroke-width="2"/>';
 if(hair===5) top='<path d="M43 66Q39 30 63 27Q90 19 104 39L103 64 90 44Q69 35 48 66Z" fill="#171717"/><circle cx="111" cy="30" r="16" fill="#171717"/>';
 if(cap) top='<path d="M42 48Q75 8 109 48L110 58H42Z" fill="#111"/><path d="M39 58Q79 46 115 58" stroke="#111" stroke-width="8"/>';
 let torso='';
 if(shirt===0)torso='<path d="M43 132L75 143 108 129 124 156 130 219H21L27 157Z" fill="#fff" stroke="#171717" stroke-width="4"/><path d="M65 139L74 163 83 138M75 164V219" stroke="#171717" stroke-width="3"/><path d="M46 167H102M48 192H99" stroke="#c0c0b9" stroke-width="2"/>';
 if(shirt===1)torso='<path d="M40 132L62 136 77 154 96 134 112 129 129 157 132 219H19L25 156Z" fill="#fff" stroke="#171717" stroke-width="4"/><path d="M61 134Q78 176 95 134" stroke="#171717" stroke-width="3"/><path d="M77 153V216M87 172H111" stroke="#171717" stroke-width="2"/>';
 if(shirt===2)torso='<path d="M41 130Q76 148 107 128L123 157 132 219H18L28 156Z" fill="#fff" stroke="#151515" stroke-width="4"/><path d="M41 130Q74 188 108 129" fill="none" stroke="#151515" stroke-width="3"/><path d="M60 181H93M57 195H96" stroke="#b7b7b4" stroke-width="2"/>';
 if(shirt===3)torso='<path d="M41 130L67 145 82 159 105 132 124 151 135 219H17L25 151Z" fill="#161616" stroke="#171717" stroke-width="4"/><path d="M70 143L73 220M88 144L90 220" stroke="#fff" stroke-width="3"/><path d="M101 179H116" stroke="#fff" stroke-width="3"/>';
 if(shirt===4)torso='<path d="M43 131L76 150 109 130 123 153 130 219H20L28 153Z" fill="#fff" stroke="#151515" stroke-width="4"/><path d="M42 130L60 171 73 149 88 173 110 131" stroke="#151515" stroke-width="3"/><path d="M73 149V217M54 180H94" stroke="#151515" stroke-width="2"/>';
 const accessories=glasses?'<rect x="50" y="68" width="21" height="14" rx="6" stroke="#171717" stroke-width="3" fill="none"/><rect x="79" y="68" width="21" height="14" rx="6" stroke="#171717" stroke-width="3" fill="none"/><path d="M71 73H79M46 74L50 74M100 74H106" stroke="#171717" stroke-width="3"/>':'';
 const face=`<ellipse cx="75" cy="${headY+18}" rx="31" ry="39" fill="#f9f9f4" stroke="#171717" stroke-width="4"/><path d="M58 71Q65 67 69 70M83 70Q91 67 96 72" stroke="#171717" stroke-width="2.5" fill="none"/>${glasses?'':`<circle cx="64" cy="77" r="2.5" fill="#141414"/><circle cx="90" cy="77" r="2.5" fill="#141414"/>`}<path d="M76 80L73 91 79 93" stroke="#171717" stroke-width="2" fill="none"/>${mustache?'<path d="M65 99Q73 93 77 98Q83 93 92 99" stroke="#171717" stroke-width="3" fill="none"/>':''}<path d="M68 105Q77 ${s%3===0?115:111} 87 104" stroke="#171717" stroke-width="2.2" fill="none"/>${earrings?'<circle cx="44" cy="87" r="3" fill="none" stroke="#171717" stroke-width="2"/><circle cx="105" cy="87" r="3" fill="none" stroke="#171717" stroke-width="2"/>':''}${accessories}`;
 const arm=s%2===0?'<path d="M28 153Q9 169 15 212" stroke="#171717" stroke-width="16" fill="none"/><path d="M121 154Q143 172 135 213" stroke="#171717" stroke-width="16" fill="none"/><path d="M28 153Q9 169 15 212M121 154Q143 172 135 213" stroke="#fff" stroke-width="9" fill="none"/>':'<path d="M28 153Q16 176 24 205L48 201M121 153Q136 169 129 206L106 204" stroke="#151515" stroke-width="14" fill="none"/><path d="M28 153Q16 176 24 205L48 201M121 153Q136 169 129 206L106 204" stroke="#fff" stroke-width="8" fill="none"/>';
 const extra=(s%9===4)?'<path d="M25 170L10 178V218H40V172Z" fill="#fefdf8" stroke="#111" stroke-width="3"/><path d="M17 177Q27 159 36 176" stroke="#111" stroke-width="3" fill="none"/>':'';
 const shirtIcon=(s%13===0)?'<path d="M65 180h21m-10-10v23" stroke="#171717" stroke-width="3"/>':'';
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 220" aria-hidden="true" fill="none" stroke-linecap="round" stroke-linejoin="round">${hairBehind}<path d="M64 106L63 135Q74 150 89 134L88 107" fill="#f9f9f4" stroke="#171717" stroke-width="3"/>${arm}${torso}${extra}${face}${top}${shirtIcon}</svg>`;
}

// Each walker stores a phase along a track, so pause/resume doesn't restart.
function createCrowd(){
 if(!crowdScene)return;
 const width=crowdScene.clientWidth,small=width<600;
 rear.replaceChildren();front.replaceChildren();cast=[];
 const rows=[{root:rear,count:small?8:22,back:true},{root:front,count:small?7:15,back:false}];
 for(const row of rows){
  for(let i=0;i<row.count;i++){
   const index=i+(row.back?0:31),size=row.back?(small?68+(i%4)*8:105+(i%5)*13):(small?97+(i%4)*11:151+(i%5)*13);
   const phase=(i+.1*(index%5))/row.count;
   const item=document.createElement('span');item.className='walker';item.innerHTML=personSVG(index*7+3);
   item.style.setProperty('--size',size+'px');
   item.style.setProperty('--bottom',row.back?(small?'32px':'54px'):(small?'-31px':'-38px'));
   row.root.appendChild(item);
   cast.push({node:item,width:size,phase,speed:row.back?(small?27:44)+(i%4)*6:(small?37:53)+(i%5)*7,dir:row.back?1:-1,bob:i*1.9});
  }
 }
 renderCrowd();
}
function renderCrowd(){
 const sceneWidth=crowdScene.clientWidth;
 for(const item of cast){
  const extent=sceneWidth+item.width*2;
  const advance=(item.phase*extent+elapsed*item.speed)%extent;
  const x=item.dir===1?-item.width+advance:sceneWidth+item.width-advance;
  const bob=reduced?0:Math.sin(elapsed*9.2+item.bob)*3.3;
  item.node.style.transform=`translate3d(${x.toFixed(1)}px,${bob.toFixed(1)}px,0)`;
 }
}
function shouldAnimate(){return visible&&!paused&&!reduced&&!document.hidden}
function stop(){if(frameId){cancelAnimationFrame(frameId);frameId=0}lastStamp=0}
function tick(stamp){frameId=0;if(!shouldAnimate()){stop();return}if(lastStamp)elapsed+=Math.min((stamp-lastStamp)/1000,.06);lastStamp=stamp;renderCrowd();frameId=requestAnimationFrame(tick)}
function syncAnimation(){
 if(!crowdScene)return;
 toggle.disabled=reduced;
 if(reduced){toggle.textContent='MOTION REDUCED';toggle.setAttribute('aria-label','Motion is reduced by your device settings')}
 else{toggle.innerHTML=`<span class="crowd-pause-icon" aria-hidden="true">${paused?'▶':'Ⅱ'}</span> ${paused?'RESUME CROWD':'PAUSE CROWD'}`;toggle.setAttribute('aria-label',paused?'Resume moving crowd':'Pause moving crowd')}
 toggle.setAttribute('aria-pressed',String(paused));
 if(shouldAnimate()&&!frameId){lastStamp=0;frameId=requestAnimationFrame(tick)}else if(!shouldAnimate()){stop();renderCrowd()}
}
if(crowdScene){
 createCrowd();
 const sceneObserver=('IntersectionObserver' in window)?new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);syncAnimation()},{threshold:.025}):null;
 if(sceneObserver)sceneObserver.observe(crowdScene);else visible=true;
 toggle.addEventListener('click',()=>{if(reduced)return;paused=!paused;syncAnimation()});
 document.addEventListener('visibilitychange',syncAnimation);
 const resizeObserver=('ResizeObserver' in window)?new ResizeObserver(()=>{createCrowd();syncAnimation()}):null;
 if(resizeObserver)resizeObserver.observe(crowdScene);else window.addEventListener('resize',()=>{createCrowd();syncAnimation()},{passive:true});
 const reduction=event=>{reduced=event.matches;createCrowd();syncAnimation()};
 if(reducedQuery.addEventListener)reducedQuery.addEventListener('change',reduction);else if(reducedQuery.addListener)reducedQuery.addListener(reduction);
 syncAnimation();
}
