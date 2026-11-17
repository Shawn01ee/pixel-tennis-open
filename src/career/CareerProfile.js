// CareerProfile — a player of the career's world who is not on the roster: the person's own player, and everyone
// ranked below the thirteen. Each plays like one roster player (his archetype: the same fitted serve, shots,
// movement and choices) at his own level: a level below the archetype's peak Elo multiplies errors and placement
// spread by exp(kappa·(Ea − E)/400) (LEVEL_FIT, fitted by tools/fit-levels.js). No signature trait.
// The card's bars: the archetype's, with control and accuracy moved by the same rules the card uses for everyone
// (control: 40 points per doubling of errors; accuracy: from the placement spread)
class CareerProfile extends PlayerProfile{
  // a: the archetype (a roster profile); E: this player's Elo; o: who he is (name, short, cc, look, face, hand, ohb, …)
  static make(a,E,o){
    const m=CareerProfile.mult(E,a),base=a.ratings;
    return new CareerProfile({...a,trait:null,legend:false,fiveSets:undefined,end:1,...o,elo:E,m,base,
      err:a.err*m,acc:(a.acc??1)*m,tkey:a.short,frozen:true,arch:a.short});
  }
  static peak(a){return CAREER_DATA.PEAK_ELO[a.short]??2200;}
  static mult(E,a){return Math.exp(LEVEL_FIT.kappa*(CareerProfile.peak(a)-E)/400);}
  get ratings(){
    const b=this.base,r=v=>Math.round(clamp(v,45,100));
    return{...b,control:r(b.control-40*Math.log2(this.m)),accuracy:r(45+55*clamp((1.25-(this.acc??1))/.65,0,1)),stamina:r(75+15*((this.end??1)-1)/Stamina.SD)};
  }
}
