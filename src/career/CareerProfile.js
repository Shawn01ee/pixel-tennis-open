// CareerProfile — a player of the career's world who is not on the roster: the person's own player, and everyone
// ranked below the thirteen. Each plays like one roster player (his archetype: the same fitted serve, shots,
// movement and choices) at his own level: a level below the archetype's peak Elo multiplies errors and placement
// spread by exp(kappa·(Ea − E)/400) (LEVEL_FIT, fitted by tools/fit-levels.js). No signature trait.
// The person's player can also be trained (o.train: rating points added to the card's bars). A point moves the number
// behind its bar by one step of the card's own scale (PlayerProfile.ratings): serve 20/55 m/s of first-serve speed,
// power 0.45/55 of shot power, speed 1.8/55 m/s of top speed and first step, spin 2100/55 rpm, control errors × 2^(−1/40),
// accuracy 0.65/55 of placement spread, touch the errors of the shots of feel × 2^(−1/25), stamina 1/15 of a standard
// deviation of endurance. What a point is worth in Elo is measured by tools/fit-attributes.js (LEVEL_FIT.attr).
// The card's bars: the archetype's, with control and accuracy moved by the level, and the trained points on top
class CareerProfile extends PlayerProfile{
  static ATTRS=['serve','power','speed','spin','control','accuracy','touch','stamina'];
  // a: the archetype (a roster profile); E: this player's Elo; o: who he is (name, short, cc, look, face, hand, ohb, train, …)
  static make(a,E,o){
    const m=CareerProfile.mult(E,a),base=a.ratings,t=o.train||{},d=k=>t[k]||0,sp=d('speed')*1.8/55;
    return new CareerProfile({...a,trait:null,legend:false,fiveSets:undefined,end:1,...o,elo:E,m,base,
      err:a.err*m*Math.pow(2,-d('control')/40),acc:Math.max(.3,(a.acc??1)*m-d('accuracy')*.65/55),tkey:a.short,frozen:true,arch:a.short,
      s1:a.s1+d('serve')*20/55,power:a.power+d('power')*.45/55,v:a.v+sp*.6,a:a.a+sp*.4/.08,spin:a.spin+d('spin')*2100/55,
      touchK:Math.pow(2,-d('touch')/25),end:1+d('stamina')*Stamina.SD/15});
  }
  static peak(a){return CAREER_DATA.PEAK_ELO[a.short]??2200;}
  static mult(E,a){return Math.exp(LEVEL_FIT.kappa*(CareerProfile.peak(a)-E)/400);}
  // the Elo the trained points are worth, by the game's own measure of each (LEVEL_FIT.attr)
  static trainedElo(t){let e=0;for(const k in t||{})e+=(t[k]||0)*((LEVEL_FIT.attr||{})[k]||0);return e;}
  get ratings(){
    const b=this.base,t=this.train||{},d=k=>t[k]||0,r=v=>Math.round(clamp(v,45,100));
    return{serve:r(b.serve+d('serve')),power:r(b.power+d('power')),speed:r(b.speed+d('speed')),spin:r(b.spin+d('spin')),
      control:r(b.control-40*Math.log2(this.m)+d('control')),accuracy:r(45+55*clamp((1.25-(this.acc??1))/.65,0,1)),
      touch:r(b.touch+d('touch')),stamina:r(75+15*((this.end??1)-1)/Stamina.SD)};
  }
}
