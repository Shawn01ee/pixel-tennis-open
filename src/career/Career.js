// Career — the person's own player, from outside the top 300 to wherever the results take him
// What is real: the ranking points per round and the 52 weeks they count for (ATP rules), the points the rest of the
// ranking holds (16 November 2026), how strong a player of each ranking is (Elo), and how often a stronger player wins.
// What is design (docs/career): where the career starts, how fast the player improves, how often players enter which
// events, and the entry cut-offs below the Grand Slams.
// A player's level is an Elo rating: it decides how the player plays (CareerProfile) and the odds of a simulated match.
// It rises with experience — matches, more for wins, and training weeks — toward a ceiling, ever more slowly.
class Career{
  static KEY='pto.career.v1';
  static START={year:2027,level:1452,points:[25,25,25,25,25,25],ceiling:2350,rate:.006};   // design; 1452: Elo at rank 300
  static XP={match:1,win:2,train:2};                                                         // design
  // training points: a few to start with, then one for every two points of experience; a bar takes at most CAP of
  // them above where the player's model put it, and never passes 99 (design)
  static TRAIN={start:5,perXp:.5,cap:25};
  static MILESTONES=[
    ['firstWin','First win on the tour'],['firstTitle','First title'],['top200','Top 200'],['top100','Top 100'],['tourTitle','First ATP title'],
    ['gsMain','Into a Grand Slam draw'],['top50','Top 50'],['beatStar','Beat one of the thirteen'],['m1000Title','A Masters 1000 title'],
    ['top10','Top 10'],['gsTitle','Grand Slam champion'],['no1','World No. 1'],['beatAll','Beaten all thirteen'],
  ];
  // a new career. me: {name, short, cc, hand, ohb, arch (a roster player's short name), look, face}
  static create(me,fmt='one'){
    const S=Career.START,seed=(Date.now()&0x7fffffff)|1;
    // last season's results, so the career starts with a ranking; they drop off one by one over the first year
    const results=S.points.map((pts,i)=>({w:-50+i*8,ev:null,name:'Last season',tier:'c50',round:'',pts}));
    return new Career({v:1,seed,me,w:0,xp:0,level:S.level,results,played:{w:0,l:0},titles:[],beat:{},best:null,fans:0,fmt,event:null,miles:{},news:[],train:{},court:{}});
  }
  constructor(s){this.s=s;s.train=s.train||{};s.court=s.court||{};this.world=new CareerWorld(s.seed);this.best();}
  // ──────── time ────────
  get year(){return Career.START.year+Math.floor(this.s.w/Calendar.WEEKS);}
  get week(){return this.s.w%Calendar.WEEKS+1;}
  // on to the next week in which something is played
  advance(n=1){this.s.w+=n;const wk=this.week,to=Calendar.nextPlayed(wk);this.s.w+=(to-wk+Calendar.WEEKS)%Calendar.WEEKS;this.best();}
  // ──────── ranking ────────
  // the points that count: what was won in the last 52 weeks
  get rankPoints(){return this.s.results.reduce((a,r)=>a+(r.w>this.s.w-Calendar.WEEKS?r.pts:0),0);}
  get rank(){return WorldRanking.rankOf(this.rankPoints);}
  best(){const r=this.rank;if(r!=null&&(this.s.best==null||r<this.s.best))this.s.best=r;this.check();}
  // results that drop out within the next weeks (to defend)
  expiring(weeks=4){return this.s.results.filter(r=>r.w>this.s.w-Calendar.WEEKS&&r.w<=this.s.w-Calendar.WEEKS+weeks&&r.pts>0);}
  // ──────── the player ────────
  get level(){return this.s.level;}
  get arch(){return ROSTER.find(p=>p.short===this.s.me.arch)||ROSTER[0];}
  profile(){const me=this.s.me;return CareerProfile.make(this.arch,this.level,{...me,id:900,rank:this.rank??999,train:this.s.train,style:`${CareerWorld.ARCH[me.arch]||''} · plays like ${me.arch}`});}
  // the player's strength for the odds of a simulated match: his level and what his training is worth
  get strength(){return this.level+CareerProfile.trainedElo(this.s.train);}
  // ──────── training ────────
  get spent(){return Object.values(this.s.train).reduce((a,b)=>a+b,0);}
  get points(){return this.pointsEarned-this.spent;}
  get pointsEarned(){return Career.TRAIN.start+Math.floor(this.s.xp*Career.TRAIN.perXp);}
  // how far a bar can still go: CAP above the model's value, and 99 at most
  room(k){const base=this.arch.ratings[k]??75,now=(this.s.train[k]||0);return Math.max(0,Math.min(Career.TRAIN.cap-now,99-base-now));}
  train(k){if(this.points<=0||this.room(k)<=0||!CareerProfile.ATTRS.includes(k))return false;this.s.train[k]=(this.s.train[k]||0)+1;return true;}
  untrain(k){if(!(this.s.train[k]>0))return false;this.s.train[k]--;return true;}
  // what the player did in the matches he played on court (not the simulated ones)
  record(ms,pts,won){const c=this.s.court;c.matches=(c.matches||0)+1;c.won=(c.won||0)+(won?1:0);c.pts=(c.pts||0)+pts;
    for(const k of['aces','df','sv1','sv1in','won1','won2','sv2','win','ue','pts','perfect'])c[k==='pts'?'ptsWon':k]=(c[k==='pts'?'ptsWon':k]||0)+(ms[k]||0);c.fast=Math.max(c.fast||0,ms.fast||0);}
  gain(xp){const S=Career.START;this.s.xp+=xp;this.s.level=S.level+(S.ceiling-S.level)*(1-Math.pow(1-S.rate,this.s.xp));}
  // anyone in the world by key ('s<id>', 'g<place>')
  entry(key){if(key[0]==='s'){const id=+key.slice(1),p=this.world.stars.findIndex(q=>q.id===id);return this.world.at(p+1);}return this.world.at(+key.slice(1));}
  profileOf(key){return key==='me'?this.profile():this.world.profile(this.entry(key));}
  // ──────── events ────────
  get events(){return Calendar.of(this.week);}
  canEnter(ev){const T=CAREER_DATA.TIERS[ev.tier],r=this.rank;
    if(this.s.event)return{ok:false,why:'Already in an event'};
    if(T.cut<9999&&(r==null||r>T.cut))return{ok:false,why:`Entry cut-off: ranked ${T.cut} or better`};return{ok:true};}
  enter(ev){if(!this.canEnter(ev).ok)return null;this.s.event=CareerEvent.make(ev,this.year,this.rank,(this.s.seed^(this.s.w*2654435761))|0);
    if(ev.tier==='gs')this.mile('gsMain');return this.event;}
  get event(){return this.s.event?new CareerEvent(this.s.event,this):null;}
  // a week of training instead of an event
  rest(){this.gain(Career.XP.train);this.news(`Week ${this.week}: a week on the practice court.`);this.advance(1);}
  // the person's match in the current event is over
  matchDone(won,line){
    const E=this.event;if(!E)return;const opp=E.opponent;E.record(won,line);
    this.s.played[won?'w':'l']++;this.gain(Career.XP.match+(won?Career.XP.win:0));
    if(won){this.mile('firstWin');if(opp&&opp[0]==='s'){this.s.beat[opp]=1;this.mile('beatStar');if(Object.keys(this.s.beat).length>=13)this.mile('beatAll');}}
  }
  // the event is over: its points go on the ranking, a title goes in the cabinet, and the weeks it took go by
  finishEvent(){
    const E=this.event;if(!E||!E.result)return null;const ev=E.ev,res=E.result;
    this.s.results.push({w:this.s.w,ev:ev.id,name:ev.name,tier:ev.tier,round:res.round,pts:res.pts});
    if(res.round==='W'){this.s.titles.push({w:this.s.w,year:this.year,ev:ev.id,name:ev.name,tier:ev.tier});this.mile('firstTitle');
      if(ev.tier[0]!=='c')this.mile('tourTitle');if(ev.tier==='m1000')this.mile('m1000Title');if(ev.tier==='gs')this.mile('gsTitle');}
    this.news(`${ev.name}: ${res.round==='W'?'champion':CAREER_DATA.ROUND_NAMES[res.round].toLowerCase()}, +${res.pts} points.`);
    this.s.event=null;this.advance(ev.len||1);return res;
  }
  // ──────── milestones and news ────────
  check(){const r=this.rank;if(r==null)return;if(r<=200)this.mile('top200');if(r<=100)this.mile('top100');if(r<=50)this.mile('top50');if(r<=10)this.mile('top10');if(r<=1)this.mile('no1');}
  mile(k){if(this.s.miles[k])return;this.s.miles[k]={w:this.s.w};const m=Career.MILESTONES.find(q=>q[0]===k);if(m)this.news(`Milestone: ${m[1]}.`,true);}
  news(text,big=false){(this.s.news||(this.s.news=[])).unshift({w:this.s.w,text,big});if(this.s.news.length>30)this.s.news.length=30;}
  // ──────── saving ────────
  save(){try{localStorage.setItem(Career.KEY,JSON.stringify(this.s));}catch(_){}}
  static load(){try{const s=JSON.parse(localStorage.getItem(Career.KEY)||'null');return s&&s.v===1?new Career(s):null;}catch(_){return null;}}
  static erase(){try{localStorage.removeItem(Career.KEY);}catch(_){}}
}
