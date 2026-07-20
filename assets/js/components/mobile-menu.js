export function initMobileMenu(){
  const toggle=document.querySelector('.mobile-toggle');const panel=document.querySelector('[data-mobile-menu]');if(!toggle||!panel)return;
  const closeButton=panel.querySelector('.mobile-panel__close');const backdrop=panel.querySelector('.mobile-panel__backdrop');let lastFocused=null;
  const close=()=>{panel.classList.remove('is-open');panel.setAttribute('aria-hidden','true');toggle.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open');lastFocused?.focus()};
  const open=()=>{lastFocused=document.activeElement;panel.classList.add('is-open');panel.setAttribute('aria-hidden','false');toggle.setAttribute('aria-expanded','true');document.body.classList.add('menu-open');closeButton.focus()};
  toggle.addEventListener('click',open);closeButton.addEventListener('click',close);backdrop?.addEventListener('click',close);panel.querySelectorAll('a').forEach(link=>link.addEventListener('click',close));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel.classList.contains('is-open'))close();if(event.key==='Tab'&&panel.classList.contains('is-open')){const focusable=[...panel.querySelectorAll('a,button')];const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}});
}
