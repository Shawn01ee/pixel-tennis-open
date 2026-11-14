// PlayerProfile — a player record: simulation numbers and the ratings the UI shows
// A profile is the career-facing record of a player: ratings the UI shows, numbers the simulation uses.
class PlayerProfile{
  constructor(o){Object.assign(this,o);}
  // 45–100 for display; the bars a career mode would grow
  get ratings(){
    const k=(v,a,b)=>Math.round(45+55*clamp((v-a)/(b-a),0,1));
    return{serve:k(this.s1,40,60),power:k(this.power,.75,1.2),speed:k(this.v+this.a*.08,6.6,8.4),spin:k(this.spin,1200,3300),
      control:k(1.12-this.err,0,.45),accuracy:k(1.25-(this.acc??1),0,.65),touch:k(this.drop*.4+this.slice*.3+this.net*.3,0,.6)};
  }
  get overall(){const r=this.ratings;return Math.round((r.serve*1.2+r.power*1.1+r.speed+r.spin*.8+r.control*1.3+r.accuracy*1.2+r.touch*.6)/7.2);}
}
