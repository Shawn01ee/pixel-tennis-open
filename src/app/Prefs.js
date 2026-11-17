// Prefs — small settings kept in this browser (localStorage), each read with a default when storage is unavailable
class Prefs{
  static KEY='pto.prefs';
  static all(){try{return JSON.parse(localStorage.getItem(Prefs.KEY)||'{}')||{};}catch(_){return{};}}
  static get(k,def){const v=Prefs.all()[k];return v===undefined?def:v;}
  static set(k,v){try{const a=Prefs.all();a[k]=v;localStorage.setItem(Prefs.KEY,JSON.stringify(a));}catch(_){}}
  // a touch screen as the main pointer: a phone or a tablet
  static get touch(){try{return matchMedia('(pointer:coarse)').matches;}catch(_){return false;}}
}
