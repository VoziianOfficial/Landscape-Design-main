export function initServiceExplorer(config){
  const root=document.querySelector('[data-service-explorer]');if(!root||!config.services?.length)return;
  const nav=root.querySelector('[data-explorer-nav]');const panel=root.querySelector('[data-explorer-panel]');if(!nav||!panel)return;
  nav.innerHTML=config.services.map((service,index)=>`<button class="home-explorer__button" type="button" role="tab" aria-selected="${index===0}" data-slug="${service.slug}"><span>${String(index+1).padStart(2,'0')}</span><span>${service.title}</span><span aria-hidden="true">↗</span></button>`).join('');
  const render=service=>{panel.innerHTML=`<img src="${service.image}" width="512" height="768" loading="lazy" decoding="async" alt="${service.imageAlt}"><div class="home-explorer__panel-copy"><h3>${service.title}</h3><p>${service.summary}</p><a class="v-text-link" href="${service.url}">View planning details</a></div>`};
  render(config.services[0]);nav.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{nav.querySelectorAll('button').forEach(item=>item.setAttribute('aria-selected','false'));button.setAttribute('aria-selected','true');const service=config.services.find(item=>item.slug===button.dataset.slug);if(service)render(service)}));
}
