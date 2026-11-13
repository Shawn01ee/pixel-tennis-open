// Surface — court surfaces: restitution, friction, roughness, wear
// e: coefficient of restitution at low speed, ev: its loss per m/s of impact, mu: sliding friction
class Surface{
  constructor(key,o){this.key=key;Object.assign(this,o);}
  restitution(vn,x,z){
    const rough=this.rough?(hash2(Math.round(x*3),Math.round(z*3))-.5)*this.rough*2:0;
    const worn=this.worn&&Math.abs(z)>10.5?-this.worn:0;          // a grass baseline wears to bare earth
    return clamp(this.e-this.ev*vn+rough+worn,.35,.92);
  }
}
const SURFACES={
  hard :new Surface('hard', {name:'Hard', e:.76,ev:.0045,mu:.62,rough:0,  worn:0,   slide:false,roll:1.0}),
  clay :new Surface('clay', {name:'Clay', e:.80,ev:.0045,mu:.80,rough:0,  worn:0,   slide:true, roll:1.6}),
  grass:new Surface('grass',{name:'Grass',e:.67,ev:.0050,mu:.42,rough:.03,worn:.035,slide:false,roll:1.0}),
};
