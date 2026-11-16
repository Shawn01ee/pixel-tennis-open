// PlayerProfile — a player record: simulation numbers and the ratings the UI shows
// A profile is the career-facing record of a player: ratings the UI shows, numbers the simulation uses.
class PlayerProfile{
  constructor(o){Object.assign(this,o);}
  // 45–100 for display; the bars a career mode would grow. Power, control and touch come straight from the player's real
  // statistics against the real tour (MCP_RATES, from the Match Charting Project): winners per shot, errors per shot,
  // and how often he drops, slices and comes in. 75 is the tour; each doubling or halving moves the bar by the same
  // amount (a display scale, not data). The rest are the game's own numbers
  get ratings(){
    const k=(v,a,b)=>Math.round(45+55*clamp((v-a)/(b-a),0,1)),M=typeof MCP_RATES!=='undefined'?MCP_RATES:null,r=M&&M[this.short],t=M&&M.Tour;
    const rel=(x,s)=>Math.round(clamp(75+s*Math.log2(Math.max(x,1e-3)),45,100));
    return{serve:k(this.s1,40,60),power:r?rel(r.winners/t.winners,40):k(this.power,.75,1.2),speed:k(this.v+this.a*.08,6.6,8.4),spin:k(this.spin,1200,3300),
      control:r?rel(t.errors/r.errors,40):k(1.12-this.err,0,.45),accuracy:k(1.25-(this.acc??1),0,.65),
      touch:r?rel((r.drop/t.drop+r.slice/t.slice+r.net/t.net)/3,25):k(this.drop*.4+this.slice*.3+this.net*.3,0,.6),stamina:Math.round(75+15*((this.end??1)-1)/Stamina.SD)};
  }
  get signature(){return TRAITS[this.trait]||null;}
  get overall(){const r=this.ratings;return Math.round((r.serve*1.2+r.power*1.1+r.speed+r.spin*.8+r.control*1.3+r.accuracy*1.2+r.touch*.6)/7.2);}
}
