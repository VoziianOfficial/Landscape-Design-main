const fallback = {
  brand:{name:'Verdeon',tagline:'Plan Better Outdoors.',logoAlt:'Verdeon',legalName:'Verdeon Design Network LLC'},
  contact:{email:'support@verdeon.com',addressLine1:'1847 Cedar Grove Avenue, Suite 210',cityStateZip:'Portland, OR 97205',country:'United States'},
  navigation:[{label:'Home',url:'index.html'},{label:'About',url:'about.html'},{label:'Services',url:'all-services.html',dropdown:true},{label:'Project Gallery',url:'gallery.html'},{label:'Contact',url:'contact.html'}],
  ctas:{consultation:'Request a Consultation',exploreServices:'Explore Design Services'},
  footer:{description:'Verdeon helps property owners explore landscape planning options.',disclaimer:'Verdeon is an independent information and provider-matching platform. Verdeon does not directly perform landscape construction, installation, planting, lighting, or maintenance services. Provider participation and service availability may vary by location.',copyright:'© 2026 Verdeon Design Network LLC.'},
  legalLinks:[{label:'Privacy Policy',url:'privacy-policy.html'},{label:'Terms of Service',url:'terms-of-service.html'},{label:'Cookie Policy',url:'cookie-policy.html'}],
  services:[],cookie:{text:'Verdeon stores a small preference in your browser so this notice does not reappear.',accept:'Accept',decline:'Decline',policyLabel:'Read Cookie Policy'}
};

async function loadConfig(){
  try{
    const response=await fetch('config/site.json',{cache:'no-store'});
    if(!response.ok) throw new Error(`Config request failed: ${response.status}`);
    return await response.json();
  }catch(error){
    console.warn('Verdeon config fallback is active.',error);
    return fallback;
  }
}

function readPath(object,path){return path.split('.').reduce((value,key)=>value?.[key],object)}

export function applyConfig(config,root=document){
  root.querySelectorAll('[data-config-text]').forEach(node=>{const value=readPath(config,node.dataset.configText);if(typeof value==='string')node.textContent=value});
  root.querySelectorAll('[data-config-href]').forEach(node=>{const value=readPath(config,node.dataset.configHref);if(typeof value==='string')node.setAttribute('href',value)});
  root.querySelectorAll('[data-config-email]').forEach(node=>{const value=config.contact?.email;if(value){node.textContent=value;node.setAttribute('href',`mailto:${value}`)}});
}

export const configReady=loadConfig().then(config=>{
  window.VERDEON_CONFIG=config;
  applyConfig(config);
  document.dispatchEvent(new CustomEvent('verdeon:config-ready',{detail:config}));
  return config;
});
window.VERDEON_CONFIG_READY=configReady;
