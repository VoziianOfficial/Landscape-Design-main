import{initServiceExplorer}from'../components/service-explorer.js';
export function initHome(config){
  const rail=document.querySelector('[data-service-rail]');if(rail)rail.innerHTML=config.services.map((service,index)=>`<a href="${service.url}" data-index="${String(index+1).padStart(2,'0')}">${service.shortTitle}</a>`).join('');
  initServiceExplorer(config);
}
