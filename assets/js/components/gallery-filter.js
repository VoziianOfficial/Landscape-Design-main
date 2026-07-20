export function initGalleryFilter(){
  const filter=document.querySelector('[data-gallery-filter]');const grid=document.querySelector('[data-gallery-grid]');if(!filter||!grid)return;
  filter.addEventListener('click',event=>{const button=event.target.closest('button[data-filter]');if(!button)return;filter.querySelectorAll('button').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));const value=button.dataset.filter;grid.querySelectorAll('[data-category]').forEach(item=>{item.hidden=value!=='all'&&!item.dataset.category.split(' ').includes(value)})});
}
