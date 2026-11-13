// Announcer — the chair umpire's calls and the electronic line calls, spoken by the browser's speech synthesis
// The umpire prefers an Australian or British English voice; the line calls use a flatter, clipped one.
class Announcer{
  static MALE=/\b(Lee|Daniel|Arthur|Oliver|Gordon|Aaron|Fred|Alex|Tom|Rishi|Ralph|Albert|Reed|Rocko|Eddy|Grandpa|David|Mark|George|James|Guy|Male)\b/i;
  constructor(){
    this.on=false;this.ok=typeof window!=='undefined'&&'speechSynthesis' in window&&typeof SpeechSynthesisUtterance!=='undefined';this.ump=null;this.line=null;
    if(this.ok){this.pick();speechSynthesis.addEventListener?.('voiceschanged',()=>this.pick());}
  }
  // a man's voice for the chair: Australian first, then British, then any English man's voice
  pick(){
    const v=speechSynthesis.getVoices().filter(x=>/^en/i.test(x.lang)),lang=(l,list=v)=>list.find(x=>x.lang.replace('_','-').toLowerCase().startsWith(l));
    const male=v.filter(x=>Announcer.MALE.test(x.name));
    this.ump=lang('en-au',male)||lang('en-gb',male)||male[0]||lang('en-au')||v[0]||null;this.male=!!male.length;
    this.line=male.find(x=>x!==this.ump)||this.ump;
  }
  // "Fifteen–Love." reads better as "Fifteen, Love."
  static spoken(text){return text.replace(/–/g,', ').replace(/\s+/g,' ').trim();}
  say(text,kind='ump'){
    if(!this.on||!this.ok)return;
    const u=new SpeechSynthesisUtterance(Announcer.spoken(text)),line=kind==='line';
    // without a man's voice installed, a lower pitch stands in
    u.voice=line?this.line:this.ump;u.rate=line?1.12:.98;u.pitch=line?.7:(this.male?.95:.62);u.volume=line?1:.9;
    if(line)speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }
  stop(){if(this.ok)speechSynthesis.cancel();}
}
