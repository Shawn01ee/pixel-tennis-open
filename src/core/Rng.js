// Rng — seeded random numbers; R() and N() are the shorthands the simulation uses
// seeded generator (mulberry32) with a normal sampler
class Rng{
  constructor(seed){this.s=(seed|0)||1;}
  next(){this.s=(this.s+0x6D2B79F5)|0;let t=Math.imul(this.s^(this.s>>>15),1|this.s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;}
  normal(s=1){return s*Math.sqrt(-2*Math.log(1-this.next()))*Math.cos(TAU*this.next());}
  chance(p){return this.next()<p;}
  pick(list){return list[Math.floor(this.next()*list.length)];}
  // weighted choice from [[value,weight],…]
  weighted(list){let w=0;for(const e of list)w+=Math.max(0,e[1]);let r=this.next()*w;for(const e of list){r-=Math.max(0,e[1]);if(r<=0)return e[0];}return list[0][0];}
}
const rng=new Rng((Date.now()&0xffffff)|1);
const R=()=>rng.next(), N=(s=1)=>rng.normal(s);
