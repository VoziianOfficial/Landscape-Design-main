let initialized=false;
export function initAOS(){
  if(initialized)return;initialized=true;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||!window.AOS){document.documentElement.classList.add('aos-ready');return}
  window.AOS.init({once:true,duration:800,easing:'ease-out-cubic',offset:85,anchorPlacement:'top-bottom',mirror:false,disable:false});
  document.documentElement.classList.add('aos-ready');
}
export function refreshAOS(){if(window.AOS&&initialized&&!matchMedia('(prefers-reduced-motion: reduce)').matches)window.AOS.refreshHard()}
