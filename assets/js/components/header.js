const logoMarkup=`<svg viewBox="0 0 64 72" aria-hidden="true"><path fill="#A5D978" d="M30.8 64.7C16.4 58.2 8.2 45.5 10.7 31.8 13.3 17.8 24.8 8.3 35.8 3c4.4 13.7 4.7 26.2-1 37.2-2.7 5.2-4.9 10.9-4 24.5Z"/><path fill="#76C174" d="M31.1 65.1c-1.2-12.4 2.2-23.2 10.1-31.1 7.4-7.4 15.7-10.4 22.2-10.7.4 11.1-2.1 21.3-9.2 28.6-5.7 5.9-13.4 10.2-23.1 13.2Z"/><path fill="none" stroke="#F4F6F2" stroke-width="2.4" stroke-linecap="round" d="M30.8 65.2C29 48.6 29.6 28.9 35.8 3M31.3 64.7c7.4-14.8 17.6-29.1 32.1-41.4"/></svg>`;
const escapeHTML=value=>String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

export function renderHeader(config){
  const host=document.querySelector('[data-site-header]');if(!host)return;
  const current=location.pathname.split('/').pop()||'index.html';
  const services=config.services||[];
  const nav=(config.navigation||[]).map(item=>{
    const active=current===item.url||(item.dropdown&&services.some(service=>service.url===current));
    if(item.dropdown)return `<div class="site-nav__item"><a class="site-nav__link site-nav__link--dropdown" href="${item.url}"${active?' aria-current="page"':''} aria-haspopup="true" aria-controls="services-menu">${escapeHTML(item.label)} <span class="site-nav__chevron" aria-hidden="true"></span></a><div id="services-menu" class="site-nav__dropdown">${services.map(service=>`<a href="${service.url}"${current===service.url?' aria-current="page"':''}>${escapeHTML(service.title)}</a>`).join('')}<a href="all-services.html">View all design options →</a></div></div>`;
    return `<a href="${item.url}"${active?' aria-current="page"':''}>${escapeHTML(item.label)}</a>`
  }).join('');
  const mobileLink=(url,label,isActive=current===url)=>`<a class="mobile-panel__link" href="${url}"${isActive?' aria-current="page"':''}>${escapeHTML(label)}</a>`;
  const mobileMainNav=[
    ['index.html','Home'],
    ['about.html','About'],
    ['all-services.html','Services'],
    ['gallery.html','Project Gallery'],
    ['contact.html','Contact']
  ].map(([url,label])=>mobileLink(url,label,url==='all-services.html'?current===url||services.some(service=>service.url===current):current===url)).join('');
  const mobileServices=services.map(service=>`<a class="mobile-panel__service" href="${service.url}"${current===service.url?' aria-current="page"':''}><span>${escapeHTML(service.shortTitle||service.title)}</span></a>`).join('');
  host.className=`site-header${document.body.dataset.page==='home'?' site-header--overlay':''}`;
  host.innerHTML=`<div class="site-header__inner v-container--wide"><a class="site-logo" href="index.html" aria-label="${escapeHTML(config.brand.logoAlt||config.brand.name)} home">${logoMarkup}<span class="site-logo__word">${escapeHTML(config.brand.name)}</span></a><nav class="site-nav" aria-label="Primary navigation">${nav}</nav><a class="v-button v-button--primary site-header__cta" href="contact.html">${escapeHTML(config.ctas.consultation)}</a><button class="mobile-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open navigation"><span></span></button></div>`;
  document.querySelector('[data-mobile-menu]')?.remove();
  document.body.insertAdjacentHTML('beforeend',`<div id="mobile-menu" class="mobile-panel" data-mobile-menu aria-hidden="true" role="dialog" aria-modal="true" aria-label="Mobile navigation"><div class="mobile-panel__backdrop" aria-hidden="true"></div><div class="mobile-panel__shell"><div class="mobile-panel__head"><a class="site-logo" href="index.html">${logoMarkup}<span class="site-logo__word">${escapeHTML(config.brand.name)}</span></a><button class="mobile-panel__close" type="button" aria-label="Close navigation"><span></span><span></span></button></div><div class="mobile-panel__intro"><p class="mobile-panel__eyebrow">Navigate Verdeon</p><p>${escapeHTML(config.brand.tagline)}</p></div><nav class="mobile-panel__nav" aria-label="Mobile navigation"><div class="mobile-panel__primary">${mobileMainNav}</div><div class="mobile-panel__services-wrap"><p>Design options</p><div class="mobile-panel__services">${mobileServices}</div></div><a class="v-button v-button--primary mobile-panel__cta" href="contact.html">${escapeHTML(config.ctas.consultation)}</a></nav><p class="mobile-panel__footer">Independent landscape planning information and provider matching.</p></div></div>`);
  const onScroll=()=>host.classList.toggle('is-scrolled',scrollY>24);onScroll();addEventListener('scroll',onScroll,{passive:true});
}

export function renderFooter(config){
  const host=document.querySelector('[data-site-footer]');if(!host)return;
  const services=(config.services||[]).slice(0,5).map(item=>`<li><a href="${item.url}">${escapeHTML(item.shortTitle||item.title)}</a></li>`).join('');
  const legal=(config.legalLinks||[]).map(item=>`<li><a href="${item.url}">${escapeHTML(item.label)}</a></li>`).join('');
  host.className='site-footer';
  host.innerHTML=`<div class="v-container--wide"><div class="site-footer__top"><div class="site-footer__brand"><a class="site-logo" href="index.html">${logoMarkup}<span class="site-logo__word">${escapeHTML(config.brand.name)}</span></a><p>${escapeHTML(config.footer.description)}</p><a class="v-button v-button--primary" href="contact.html">${escapeHTML(config.ctas.consultation)}</a></div><div><h3>Design options</h3><ul>${services}</ul></div><div><h3>Verdeon</h3><ul><li><a href="about.html">About</a></li><li><a href="all-services.html">All Services</a></li><li><a href="gallery.html">Project Gallery</a></li><li><a href="contact.html">Contact</a></li></ul></div><div class="site-footer__contact"><h3>Information</h3><ul>${legal}</ul><p><a href="mailto:${config.contact.email}">${escapeHTML(config.contact.email)}</a></p><p>${escapeHTML(config.contact.addressLine1)}<br>${escapeHTML(config.contact.cityStateZip)}<br>${escapeHTML(config.contact.country)}</p></div></div><div class="site-footer__disclaimer"><p>${escapeHTML(config.footer.disclaimer)}</p><span>${escapeHTML(config.footer.copyright)}</span></div></div>`;
}
