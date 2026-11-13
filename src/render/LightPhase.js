// LightPhase — day, twilight and night sessions, and blending between them
const PHASES={
 day:     {name:'Day',     cl:0xf4f3ec,cd:0xb0dcf6,sun:[1,.95,.84],si:1.05,dir:[.46,1,.3],  hs:[.78,.86,1], hg:[.56,.6,.5], hi:.6, t:0x25468a,h:0x7bb8ea,b:0xe2f4fb,flood:0,  glow:[.8,.9,1],   night:0,  amb:[.62,.66,.74]},
 twilight:{name:'Twilight',cl:0xf4aca4,cd:0x9658a0,sun:[1,.56,.3], si:.85,dir:[-.86,.42,.5],hs:[.62,.46,.74],hg:[.42,.3,.4], hi:.62,t:0x25468a,h:0xd07c9c,b:0xf89a78,flood:.6, glow:[2.0,1.4,.62],night:.15,amb:[.5,.44,.54]},
 night:   {name:'Night',   cl:0x2f3344,cd:0x1a2c5c,sun:[.5,.66,1], si:.22,dir:[.42,1,-.52],hs:[.36,.42,.66],hg:[.16,.18,.3],hi:.5, t:0x0e0f1a,h:0x101a3a,b:0x1a2c5c,flood:1,  glow:[2.3,1.55,.6],night:1,  amb:[.4,.44,.52]},
};
class LightPhase{
  static snapshot(k){const p=PHASES[k],o={};for(const key in p){const v=p[key];o[key]=typeof v==='number'&&['cl','cd','t','h','b'].includes(key)?hexc(v):v;}return o;}
  static mix(a,b,t){const o={};for(const k in a){const v=a[k];o[k]=Array.isArray(v)?v.map((x,i)=>lerp(x,b[k][i],t)):typeof v==='number'?lerp(v,b[k],t):b[k];}return o;}
}
