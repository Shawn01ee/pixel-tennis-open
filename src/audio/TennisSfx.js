// TennisSfx — the sounds of the game itself, played on an 8-bit sound chip (ChipVoice): the strings, bounces, the net,
// shoes, and the menu's two notes. What each sound is made of, and where each number comes from: SoundData.js
class TennisSfx{
  constructor(A){this.A=A;this.v=null;}
  get chip(){return this.v||(this.v=new ChipVoice(this.A.ac.sampleRate));}
  play(notes,D,pan){this.A.play(this.chip.render(notes,D.gain),pan,D.wet);}
  // the score of a racket hit (also used by tools/sound-check.js): the ball on the strings at about 1 kHz, with a crack of
  // the shift register's noise over the first millisecond only; one cycle at 250 Hz; then the quieter ring at 1 kHz.
  // Pace makes it louder; spin quieter and the crack brighter
  static hitNotes(power,spin=0){
    const H=SOUND.hit,D=H.design,p=clamp(power,0,1),s=clamp(Math.abs(spin),0,1),c=H.contactMs/1000,lo=H.loCycles/H.loHz;
    const v=clamp(Math.round(lerp(D.vol[0],D.vol[1],p)-s*D.spinQuiet),1,15),ring=Math.max(1,Math.round(v*D.ringShare));
    return[{ch:'noise',at:0,dur:SOUND.onsetMs.v/1000,per:Math.round(lerp(D.crackPer[0],D.crackPer[1],s)),vol:v,to:0},
      {ch:'p1',at:0,dur:c,f:H.hiHz,duty:2,vol:v},
      {ch:'p1',at:c,dur:lo,f:H.loHz,duty:2,vol:v},
      {ch:'p1',at:c+lo,dur:D.ringCycles/H.hiHz,f:H.hiHz,duty:2,vol:ring,to:0}];
  }
  // a bounce: a couple of cycles at 1 kHz, then the thump at 250 Hz dying away, louder the harder the ball lands
  static bounceNotes(v,soft=1){
    const B=SOUND.bounce,D=B.design,g=clamp((v-1)/12,.08,1)*soft,vol=Math.max(1,Math.round(lerp(D.vol[0],D.vol[1],g))),hi=B.hiCycles/B.hiHz;
    return[{ch:'p1',at:0,dur:hi,f:B.hiHz,duty:2,vol},{ch:'p1',at:hi,dur:D.loCycles/B.loHz,f:B.loHz,duty:2,vol,to:0}];
  }
  hit(power,spin=0,stroke='fh',pan=0){this.play(TennisSfx.hitNotes(power,spin),SOUND.hit.design,pan);}
  bounce(v,pan=0,soft=1){this.play(TennisSfx.bounceNotes(v,soft),SOUND.bounce.design,pan);}
  // into the mesh: a dull whack of low noise over a low pulse; off the tape: a metallic tick and a falling blip
  net(mesh,v,pan=0){
    const D=SOUND.net.design,g=clamp(v/25,.2,1),vol=Math.max(2,Math.round(14*g));
    const n=mesh?[{ch:'noise',at:0,dur:D.meshMs/1000,per:D.meshPer,vol,to:0},{ch:'p2',at:0,dur:D.meshMs/2000,f:D.meshHz,duty:2,vol:Math.round(vol*.7),to:0}]
      :[{ch:'noise',at:0,dur:D.tapeMs/1000,per:D.tapePer,short:true,vol,to:0},...D.tapeHz.map((f,i)=>({ch:'p2',at:.004+i*.012,dur:.012,f,duty:1,vol:Math.round(vol*.6*(1-i*.3))}))];
    this.play(n,{gain:mesh?D.meshGain:D.tapeGain,wet:D.wet},pan);
  }
  // rubber on acrylic when a player stops or cuts hard: a thin rising chirp with a wobble
  squeak(a=1,pan=0){
    const D=SOUND.squeak.design,f=lerp(D.hz[0],D.hz[1],Math.random()),d=lerp(D.ms[0],D.ms[1],Math.random())/1000,vib=lerp(D.vibHz[0],D.vibHz[1],Math.random());
    const vol=Math.round(lerp(D.vol[0],D.vol[1],clamp(a,0,1))),st=.004,n=[];
    for(let t=0;t<d;t+=st){const u=t/d,fq=f*(u<.6?lerp(1,D.rise,u/.6):lerp(D.rise,(1+D.rise)/2,(u-.6)/.4))*(1+D.vibDepth*Math.sin(TAU*vib*t));
      n.push({ch:'p1',at:t,dur:st,f:fq,duty:0,vol:u<.7?vol:Math.round(vol*(1-u)/.3)});}
    this.play(n,D,pan);
  }
  // feet sliding on clay: long low noise fading out
  slide(pan=0){const D=SOUND.slide.design;this.play([{ch:'noise',at:0,dur:D.ms/1000,per:D.per,vol:D.vol,to:0}],D,pan);}
  // two notes that say "your turn"
  chime(){const D=SOUND.chime.design;this.play(D.notes.map(([f,d],i)=>({ch:i?'p2':'p1',at:i*D.gap,dur:d,f,duty:2,vol:D.vol,to:0})),D,0);}
  click(){const D=SOUND.click.design,h=D.ms/2000;this.play([{ch:'p1',at:0,dur:h,f:D.hz[0],duty:1,vol:D.vol},{ch:'p1',at:h,dur:h,f:D.hz[1],duty:1,vol:D.vol,to:0}],D,0);}
}
