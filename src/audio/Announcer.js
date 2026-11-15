// Announcer — the chair umpire's calls and the electronic line calls, spoken by the browser's speech synthesis
// Men's voices only. The umpire prefers an Australian or British English voice; the line calls use a second, flatter
// one. Where a device has no man's voice at all, the calls are shown but not spoken.
class Announcer{
  static MALE=/\b(Lee|Daniel|Arthur|Oliver|Gordon|Aaron|Fred|Alex|Tom|Rishi|Ralph|Albert|Reed|Rocko|Eddy|Grandpa|David|Mark|George|James|Guy|Male)\b/i;
  constructor(){
    this.on=false;this.ok=typeof window!=='undefined'&&'speechSynthesis' in window&&typeof SpeechSynthesisUtterance!=='undefined';this.ump=null;this.line=null;
    if(this.ok){this.pick();speechSynthesis.addEventListener?.('voiceschanged',()=>this.pick());}
  }
  // a man's voice for the chair: Australian first, then British, then any English man's voice — never a woman's
  pick(){
    const all=speechSynthesis.getVoices(),v=all.filter(x=>/^en/i.test(x.lang)),lang=(l,list)=>list.find(x=>x.lang.replace('_','-').toLowerCase().startsWith(l));
    const male=v.filter(x=>Announcer.MALE.test(x.name));
    this.ump=lang('en-au',male)||lang('en-gb',male)||male[0]||null;
    this.line=male.find(x=>x!==this.ump)||this.ump;
  }
  // "Fifteen–Love." reads better as "Fifteen, Love."
  static spoken(text){return text.replace(/–/g,', ').replace(/\s+/g,' ').trim();}
  // iPad and iPhone only let speech start from a tap: say one silent word inside the tap that turns the sound on,
  // and every later call is then allowed
  prime(){
    if(!this.ok||this.primed)return;this.primed=true;
    try{const u=new SpeechSynthesisUtterance(' ');u.volume=0;u.lang='en-AU';speechSynthesis.speak(u);}catch(e){}
  }
  say(text,kind='ump'){
    if(!this.on||!this.ok)return;
    if(!this.ump)this.pick();
    const u=new SpeechSynthesisUtterance(Announcer.spoken(text)),line=kind==='line',voice=line?this.line:this.ump;
    if(!voice)return;                       // no man's voice on this device: shown, not spoken
    u.voice=voice;u.lang=voice.lang;
    u.rate=line?1.12:.98;u.pitch=line?.7:.95;u.volume=line?1:.9;
    // Safari drops an utterance that is collected before it is spoken, or spoken in the same breath as a cancel
    this.keep=u;u.onend=()=>{if(this.keep===u)this.keep=null;if(this.lineNow===u)this.lineNow=null;};
    try{
      if(speechSynthesis.paused)speechSynthesis.resume();
      // a line call cuts in over whatever is being said; anything said in the same moment waits its turn behind it
      const now=Date.now();let d=Math.max(0,(this.hold||0)-now);
      if(line&&speechSynthesis.speaking&&!this.lineNow){speechSynthesis.cancel();d=Math.max(d,80);}
      if(line)this.lineNow=u;
      if(d>0){this.hold=now+d+20;setTimeout(()=>{try{speechSynthesis.speak(u);}catch(e){}},d);}
      else speechSynthesis.speak(u);
    }catch(e){}
  }
  stop(){if(this.ok)speechSynthesis.cancel();}
}
