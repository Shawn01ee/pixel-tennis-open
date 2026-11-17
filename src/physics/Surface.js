// Surface — court surfaces: restitution, friction, roughness, wear
// e: coefficient of restitution at low speed, ev: its loss per m/s of impact (a vertical bounce), mu: the coefficient
// of sliding friction between ball and court (the ITF's measure of court pace: 100·(1 − mu)). Sources (docs/surfaces):
//   hard   e by the ITF drop test (254 cm drop → 135–147 cm rebound); mu checked by the speed a serve keeps through
//          the bounce (tests/physics-realism.test.js)
//   clay   mu 0.80: Cross (2003), a court built like European clay, 15–35 m/s. A vertical drop on clay rebounds as on a
//          hard court: COR 0.77 on both the acrylic and the crushed-brick courts Thorpe & Canaway tested (via Cross 2003)
//   grass  mu 0.64: the grass centre court at Kooyong, a Grand Slam's centre court (Thorpe & Canaway, via Cross 2003).
//          A vertical drop: COR 0.65 on grass against 0.77 on the other courts (the same tests), so the hard court's
//          bounce times 0.65/0.77
//   rough, worn (grass: a bounce now and then off a tuft, the baseline worn to bare earth), slide and roll (clay: the
//   players slide into their shots, a loose surface slows a rolling ball): design
class Surface{
  static DROP=Math.sqrt(2*9.81*2.54);   // m/s at impact after a 254 cm drop
  constructor(key,o){this.key=key;Object.assign(this,o);}
  restitution(vn,x,z){
    const rough=this.rough?(hash2(Math.round(x*3),Math.round(z*3))-.5)*this.rough*2:0;
    const worn=this.worn&&Math.abs(z)>10.5?-this.worn:0;          // a grass baseline wears to bare earth
    return clamp(this.e-this.ev*vn+rough+worn,.35,.92);
  }
  // the coefficient of restitution of a vertical drop from 254 cm (7.06 m/s at impact)
  drop(){return this.e-this.ev*Surface.DROP;}
}
const SURFACES={
  hard :new Surface('hard', {name:'Hard', e:.79,ev:.0045,mu:.62,rough:0,  worn:0,   slide:false,roll:1.0}),
  clay :new Surface('clay', {name:'Clay', e:.79,ev:.0045,mu:.80,rough:0,  worn:0,   slide:true, roll:1.6}),
  grass:new Surface('grass',{name:'Grass',e:(.79-.0045*Surface.DROP)*.65/.77+.0050*Surface.DROP,ev:.0050,mu:.64,rough:.03,worn:.035,slide:false,roll:1.0}),
};
