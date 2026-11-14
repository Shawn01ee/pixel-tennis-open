// Tournament — an eight-player knockout: quarter-finals, semi-finals, final
// The draw is seeded so the top two can only meet in the final. The person plays their own matches; every other
// match is played out by the same simulation, point by point, so its score is a real one.
class Tournament{
  static ROUNDS=['Quarter-finals','Semi-finals','Final'];
  static ORDER=[0,7,3,4,2,5,1,6];   // seed positions down the draw: 1 v 8, 4 v 5, 3 v 6, 2 v 7
  constructor(me,format,level,roster=ROSTER){
    const seeds=[...roster].sort((a,b)=>a.rank-b.rank),draw=Tournament.ORDER.map(i=>seeds[i]);
    this.me=me.id;this.format=format;this.level=level;this.roster=roster;this.round=0;this.champion=null;this.out=false;this.fans=0;
    const slot=(a=null,b=null)=>({a,b,w:null,line:''});
    this.rounds=[[0,1,2,3].map(i=>slot(draw[i*2].id,draw[i*2+1].id)),[slot(),slot()],[slot()]];
  }
  player(id){return this.roster.find(p=>p.id===id);}
  get over(){return this.champion!=null;}
  get name(){return Tournament.ROUNDS[Math.min(this.round,2)];}
  // the person's next match, or null once they are out or it is over
  get mine(){if(this.out||this.over)return null;return this.rounds[this.round].find(m=>m.a===this.me||m.b===this.me)||null;}
  get opponent(){const m=this.mine;return m?this.player(m.a===this.me?m.b:m.a):null;}
  // the match configuration for the person's next match
  config(){const me=this.player(this.me),opp=this.opponent;return{a:me,b:Difficulty.apply(opp,this.level),human:0,format:this.format,walkOn:true};}
  // the person's match is over
  record(won,line){const m=this.mine;if(!m)return;m.w=won?this.me:(m.a===this.me?m.b:m.a);m.line=line;if(!won)this.out=true;}
  // play out one unplayed match of this round between computer players; false when none is left
  simulateOne(){
    const m=this.rounds[this.round].find(q=>q.w==null&&q.a!=null&&q.b!=null);if(!m)return false;
    const sim=new Match({a:this.player(m.a),b:this.player(m.b),format:MatchFormat.get('short')});let n=0;
    while(!(sim.stage==='over'&&sim.result)&&n<120*60*90){sim.tick();n++;sim.events.length=0;}
    m.w=sim.result?sim.result.winner.st.id:m.a;m.line=sim.result?sim.result.line:'';return true;
  }
  // when every match of the round is decided, fill the next round (or crown the champion)
  advance(){
    const cur=this.rounds[this.round];if(cur.some(m=>m.w==null))return false;
    if(this.round===2){this.champion=cur[0].w;return true;}
    const next=this.rounds[this.round+1];next.forEach((m,i)=>{m.a=cur[i*2].w;m.b=cur[i*2+1].w;});this.round++;return true;
  }
  // everything that does not need the person: the rest of this round, and — once they are out — the rest of the draw
  settle(){for(;;){while(this.simulateOne());if(!this.advance()||this.over)break;if(this.mine)break;}}
}
