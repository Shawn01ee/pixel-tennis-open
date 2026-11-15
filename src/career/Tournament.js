// Tournament — an eight-player knockout: quarter-finals, semi-finals, final
// The draw is seeded so the top two can only meet in the final. The person plays their own matches; every other
// match is played out by the same simulation, point by point, so its score is a real one.
class Tournament{
  static ROUNDS=['Quarter-finals','Semi-finals','Final'];
  static ORDER=[0,7,3,4,2,5,1,6];   // seed positions down the draw: 1 v 8, 4 v 5, 3 v 6, 2 v 7
  // the eight who play: the person's player and seven drawn from everyone else, in seeding order
  static field(me,all=ROSTER){
    const rest=all.filter(p=>p.id!==me.id);for(let i=rest.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[rest[i],rest[j]]=[rest[j],rest[i]];}
    return[me,...rest.slice(0,7)].sort((a,b)=>a.rank-b.rank);
  }
  constructor(me,format,level,roster=Tournament.field(me)){
    const seeds=[...roster].sort((a,b)=>a.rank-b.rank),draw=Tournament.ORDER.map(i=>seeds[i]);this.seeds=seeds.map(p=>p.id);
    this.me=me.id;this.format=format;this.level=level;this.roster=roster;this.round=0;this.champion=null;this.out=false;this.fans=0;
    // a slot: its two players, the winner, the score as a line and per set (from a's side), and while it is being
    // played in the background, the match itself (live)
    const slot=(a=null,b=null)=>({a,b,w:null,line:'',sets:null,live:null});this.version=0;
    // what each player carries into their next match from the last one (see Stamina.carry)
    this.tired={};
    this.rounds=[[0,1,2,3].map(i=>slot(draw[i*2].id,draw[i*2+1].id)),[slot(),slot()],[slot()]];
  }
  seed(id){return this.seeds.indexOf(id)+1;}
  player(id){return this.roster.find(p=>p.id===id);}
  get over(){return this.champion!=null;}
  get name(){return Tournament.ROUNDS[Math.min(this.round,2)];}
  // the person's next match, or null once they are out or it is over
  get mine(){if(this.out||this.over)return null;return this.rounds[this.round].find(m=>m.a===this.me||m.b===this.me)||null;}
  get opponent(){const m=this.mine;return m?this.player(m.a===this.me?m.b:m.a):null;}
  // the match configuration for the person's next match
  config(){const me=this.player(this.me),opp=this.opponent;return{a:me,b:Difficulty.apply(opp,this.level),human:0,format:this.format,walkOn:true,final:this.round===2,carry:[this.tired[me.id]||0,this.tired[opp.id]||0]};}
  // the person's match is over. match: the finished Match, whose first player is the person
  record(won,match){const m=this.mine;if(!m)return;m.w=won?this.me:(m.a===this.me?m.b:m.a);this.score(m,match,m.a===this.me?0:1);if(!won)this.out=true;}
  // the score of a finished match into its slot, set by set from the slot's first player's side (ia: that player's
  // index in the match)
  score(m,match,ia=0){const sc=match.score,r=match.result;m.live=null;m.line=r?r.line:'';
    for(const P of match.players)this.tired[P.st.id]=P.sta.carry;
    m.sets=sc?sc.done.map(d=>({a:d.g[ia],b:d.g[1-ia],tb:d.tb,pa:d.pts?d.pts[ia]:null,pb:d.pts?d.pts[1-ia]:null})):null;this.version++;}
  // the other matches, played in the format of the event a slice at a time (a generator, stepped by the game while it
  // runs): the rest of this round, and — once the person is out — the rest of the draw, round by round
  *run(){
    for(;;){
      for(const m of this.rounds[this.round]){
        if(m.w!=null||m.a==null||m.b==null||m.a===this.me||m.b===this.me)continue;
        const sim=new Match({a:this.player(m.a),b:this.player(m.b),format:this.format,carry:[this.tired[m.a]||0,this.tired[m.b]||0]});m.live=sim;this.version++;let n=0;
        while(!(sim.stage==='over'&&sim.result)&&n<120*60*240){sim.tick();n++;sim.events.length=0;if(n%40===0)yield m;}
        m.w=sim.result?sim.result.winner.st.id:m.a;this.score(m,sim);yield m;
      }
      if(!this.out||this.over||!this.advance())return;
    }
  }
  // the same, all at once: what is left of the round (normally nothing: it was played during the person's match)
  simulateOne(){
    const m=this.rounds[this.round].find(q=>q.w==null&&q.a!=null&&q.b!=null&&q.a!==this.me&&q.b!==this.me);if(!m)return false;
    const g=this.run();while(m.w==null&&!g.next().done);return true;
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
