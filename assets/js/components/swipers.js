export function initSwipers(root=document){
  if(!window.Swiper)return;
  root.querySelectorAll('[data-component="swiper"]').forEach(element=>{
    if(element.dataset.initialized)return;
    element.dataset.initialized='true';
    const type=element.dataset.swiperType||'cards';
    const parent=element.parentElement;
    const baseOptions={slidesPerView:1.08,spaceBetween:16,grabCursor:true,keyboard:{enabled:true},watchOverflow:true,navigation:{nextEl:parent.querySelector('.swiper-button-next'),prevEl:parent.querySelector('.swiper-button-prev')},pagination:{el:parent.querySelector('.swiper-pagination'),type:'fraction'}};
    const options=type==='featured-services'?{...baseOptions,navigation:false,loop:true,speed:560,slidesPerView:1,spaceBetween:18,pagination:{el:parent.querySelector('.swiper-pagination'),type:'bullets',clickable:true},breakpoints:{768:{slidesPerView:2,spaceBetween:24},1024:{slidesPerView:3,spaceBetween:32}}}:{...baseOptions,breakpoints:type==='showcase'?{720:{slidesPerView:1.35,spaceBetween:24},1100:{slidesPerView:2.15,spaceBetween:28}}:{620:{slidesPerView:2.05},1000:{slidesPerView:3,spaceBetween:24}}};
    new window.Swiper(element,options);
  });
}
