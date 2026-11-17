// CareerEvent — one event the person has entered: its draw, played round by round
// The field is drawn from the band of the ranking that plays this kind of event, from the best ranking that usually
// plays it to a little past its entry cut-off (CareerData.TIERS, design), everyone in the band equally likely to
// enter, so fields differ week to week. It is seeded like a real draw: a quarter of the draw seeded by ranking, in the
// standard places (1 at the top, 2 at the bottom, 3 and 4 in the other halves…), the rest drawn at random into the
// remaining places. The person's matches are played (or simulated); every other match is decided by the players'
// Elo ratings (EloModel), best of three sets, or five at a Grand Slam. Plain data, so it is saved with the career.
// key: 'me' the person · 's<id>' a roster player · 'g<place>' an invented player at that place of the ranking
class CareerEvent{
  // the standard draw: seed number at each position, top to bottom — 1 on the top line, 2 on the bottom one, 3 and 4
  // at the foot of the top half and the head of the bottom half… (eight: 1 8 5 4 3 6 7 2)
  static order(n){let o=[1];while(o.length<n){const m=o.length*2;o=o.flatMap((s,i)=>i%2?[m+1-s,s]:[s,m+1-s]);}return o;}
  // a new draw for calendar event ev, the person entering with ranking myRank (null: unranked)
  static make(ev,year,myRank,seed){
    const T=CAREER_DATA.TIERS[ev.tier],n=T.draw,g=new Rng(seed|0),size=WorldRanking.SIZE;
    // who enters: n − 1 places drawn from the band, without repeats. The person's place pushes everyone from it down by one
    const hi=Math.min(size,Math.max(T.top+n,Math.round(T.cut*1.15))),band=[];for(let p=T.top;p<=hi;p++)band.push(p);
    for(let i=band.length-1;i>0;i--){const j=Math.floor(g.next()*(i+1));[band[i],band[j]]=[band[j],band[i]];}
    const field=[{key:'me',rank:myRank??size+1}];
    for(const p of band.slice(0,n-1)){const r=myRank!=null&&p>=myRank?p+1:p;field.push({key:p<=13?'s'+CareerEvent.starAt(p):'g'+p,rank:r});}
    field.sort((a,b)=>a.rank-b.rank);
    // seeds in their places; everyone else shuffled into what is left
    const seeds=n/4,ord=CareerEvent.order(n),rest=field.slice(seeds);
    for(let i=rest.length-1;i>0;i--){const j=Math.floor(g.next()*(i+1));[rest[i],rest[j]]=[rest[j],rest[i]];}
    const slots=ord.map(s=>s<=seeds?field[s-1]:rest.shift());
    const r0=[];for(let i=0;i<n;i+=2)r0.push({a:slots[i].key,b:slots[i+1].key,w:null,line:''});
    return{ev:ev.id,year,seed:seed|0,n,seeds:Object.fromEntries(field.slice(0,seeds).map((f,i)=>[f.key,i+1])),ranks:Object.fromEntries(field.map(f=>[f.key,f.rank])),
      rounds:[r0],round:0,out:false,champion:null,done:false,k:0};
  }
  // which roster player holds a place in the top thirteen
  static starAt(p){return[...ROSTER].sort((a,b)=>a.rank-b.rank)[p-1].id;}
  constructor(d,career){this.d=d;this.c=career;}
  get ev(){return Calendar.byId(this.d.ev);}
  get tier(){return CAREER_DATA.TIERS[this.ev.tier];}
  get names(){return CAREER_DATA.ROUNDS[this.d.n];}
  get roundName(){return this.names[this.d.round];}
  get lastRound(){return this.d.round===this.names.length-1;}
  // the person's match in the round being played
  get mine(){return this.d.rounds[this.d.round].find(m=>m.a==='me'||m.b==='me')||null;}
  get opponent(){const m=this.mine;return m?(m.a==='me'?m.b:m.a):null;}
  // Elo of anyone in the draw
  elo(key){return key==='me'?this.c.level:this.c.entry(key).elo;}
  rng(){return new Rng((this.d.seed*31+(++this.d.k)*7)|0);}
  // decide a match by Elo
  decide(m){const g=this.rng(),p=EloModel.win(this.elo(m.a)-this.elo(m.b),this.tier.sets);m.w=g.next()<p?m.a:m.b;}
  // the person's match is over (won or lost; line: the score). The rest of the round is decided, and the draw moves on
  record(won,line){
    const d=this.d,m=this.mine;if(!m)return;m.w=won?'me':this.opponent;m.line=line||'';
    for(const q of d.rounds[d.round])if(q.w==null)this.decide(q);
    if(!won)d.out=true;
    this.next();
    // out: the rest of the event is decided at once, so the draw shows its champion
    if(d.out)while(!d.done){for(const q of d.rounds[d.round])if(q.w==null)this.decide(q);this.next();}
  }
  // the next round from this one's winners, or the champion after the final
  next(){
    const d=this.d,r=d.rounds[d.round];if(r.some(q=>q.w==null))return;
    if(r.length===1){d.champion=r[0].w;d.done=true;return;}
    const nr=[];for(let i=0;i<r.length;i+=2)nr.push({a:r[i].w,b:r[i+1].w,w:null,line:''});d.rounds.push(nr);d.round++;
  }
  // the round the person went out in ('W' for the title) and the ranking points it is worth
  get result(){const d=this.d;if(!d.done&&!d.out)return null;
    let k=d.rounds.findIndex(r=>r.some(q=>(q.a==='me'||q.b==='me')&&q.w!=null&&q.w!=='me'));
    const r=d.champion==='me'?'W':this.names[k<0?0:k];return{round:r,pts:CAREER_DATA.POINTS[this.ev.tier][r]||0};}
}
