const header=document.querySelector('.site-header');
const menu=document.querySelector('.menu');
const nav=document.querySelector('.nav');
if(header){window.addEventListener('scroll',()=>header.classList.toggle('compact',window.scrollY>20),{passive:true});}
if(menu&&nav){menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');}));}
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.12});
document.querySelectorAll('.fade').forEach(el=>observer.observe(el));
const track=document.querySelector('.gallery-track');
if(track){let index=0;const cards=[...track.children];const move=()=>{const card=cards[0];if(!card)return;const gap=18;const step=card.getBoundingClientRect().width+gap;const max=Math.max(0,cards.length-Math.max(1,Math.floor(track.parentElement.clientWidth/step)));index=Math.min(index,max);track.style.transform=`translateX(${-index*step}px)`;};document.querySelector('[data-next]')?.addEventListener('click',()=>{index=Math.min(index+1,cards.length-1);move();});document.querySelector('[data-prev]')?.addEventListener('click',()=>{index=Math.max(0,index-1);move();});window.addEventListener('resize',move);}
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
