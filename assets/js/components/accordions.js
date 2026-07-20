export function initAccordions(root=document){
  root.querySelectorAll('[data-accordion]').forEach(group=>{if(group.dataset.initialized)return;group.dataset.initialized='true';group.querySelectorAll('.v-accordion__button').forEach(button=>{button.addEventListener('click',()=>{const expanded=button.getAttribute('aria-expanded')==='true';if(group.dataset.single==='true')group.querySelectorAll('.v-accordion__button').forEach(other=>other.setAttribute('aria-expanded','false'));button.setAttribute('aria-expanded',String(!expanded))})})});
}
