// minimal DOM stub for smoke-testing the app logic in Node
function makeEl(id){
  const el = {
    id: id||"", innerHTML:"", textContent:"", value:"", className:"", disabled:false,
    style:{}, title:"", placeholder:"",
    classList:{ _s:new Set(),
      add(c){this._s.add(c);}, remove(c){this._s.delete(c);},
      toggle(c,f){ if(f===undefined){ this._s.has(c)?this._s.delete(c):this._s.add(c); } else { f?this._s.add(c):this._s.delete(c);} },
      contains(c){ return this._s.has(c); } },
    listeners:{},
    addEventListener(t,f){ (this.listeners[t]=this.listeners[t]||[]).push(f); },
    removeEventListener(){},
    querySelectorAll(){ return []; },
    querySelector(){ return null; },
    children:[], appendChild(c){ this.children.push(c); return c; }, removeChild(c){ this.children=this.children.filter(x=>x!==c); }, remove(){},
    setAttribute(k,v){ this[k]=v; }, getAttribute(k){ return this[k]; },
    focus(){}, click(){ if(this.onclick) this.onclick({target:this}); },
    closest(){ return null; },
    scrollTop:0, scrollHeight:0,
  };
  return el;
}
const els = {};
global.document = {
  getElementById(id){ return els[id] || (els[id]=makeEl(id)); },
  createElement(tag){ return makeEl("<"+tag+">"); },
  querySelectorAll(){ return []; },
  querySelector(){ return null; },
  addEventListener(t,f){ (this._l=this._l||[]).push([t,f]); },
  body:{ appendChild(c){}, classList:{ add(){}, remove(){}, toggle(){}, contains(){return false;} } },
};
const store = {};
global.window = global;
const winL = {};
global.addEventListener = function(t,f){ (winL[t]=winL[t]||[]).push(f); };
global.removeEventListener = function(t,f){ winL[t]=(winL[t]||[]).filter(x=>x!==f); };
global.dispatchEvent = function(ev){ (winL[ev&&ev.type]||[]).slice().forEach(f=>f(ev)); return true; };
global.matchMedia = global.matchMedia || (function(){ return { matches:false, addEventListener(){}, removeEventListener(){} }; });
global.localStorage = {
  getItem:k=>(k in store?store[k]:null),
  setItem:(k,v)=>{store[k]=String(v);},
  removeItem:k=>{delete store[k];},
  _store: store,
};
global.location = { protocol:"http:", href:"http://localhost:3000/" };
global.innerWidth = 800; global.innerHeight = 600;
global.URL = { createObjectURL:()=>"blob:fake", revokeObjectURL:()=>{} };
global.navigator = { userAgent:"node-test" };
global.SpeechRecognition = undefined;
global.fetch = async ()=>({ json: async()=>({ ok:false, error:"offline-test" }) });
