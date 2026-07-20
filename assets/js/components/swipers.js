export function initSwipers(root=document){
  if(!window.Swiper)return;
  root.querySelectorAll('[data-component="swiper"]').forEach(element=>{
    if(element.dataset.initialized)return;
    element.dataset.initialized='true';
    const type=element.dataset.swiperType||'cards';
    const parent=element.parentElement;
    const section=element.closest('section');
    const controlsScope=parent.querySelector('.swiper-controls')?parent:section||parent;
    const baseOptions={slidesPerView:1.08,spaceBetween:16,grabCursor:true,keyboard:{enabled:true},watchOverflow:true,navigation:{nextEl:controlsScope.querySelector('.swiper-button-next'),prevEl:controlsScope.querySelector('.swiper-button-prev')},pagination:{el:controlsScope.querySelector('.swiper-pagination'),type:'fraction'}};
    const options=type==='featured-services'?{...baseOptions,navigation:false,loop:true,speed:560,slidesPerView:1,spaceBetween:18,pagination:{el:parent.querySelector('.swiper-pagination'),type:'bullets',clickable:true},breakpoints:{768:{slidesPerView:2,spaceBetween:24},1024:{slidesPerView:3,spaceBetween:32}}}:{...baseOptions,slidesPerView:type==='showcase'?1:1.08,spaceBetween:type==='showcase'?22:16,breakpoints:type==='showcase'?{768:{slidesPerView:2,spaceBetween:24},1100:{slidesPerView:2,spaceBetween:28}}:{620:{slidesPerView:2.05},1000:{slidesPerView:3,spaceBetween:24}}};
    new window.Swiper(element,options);
  });
}
