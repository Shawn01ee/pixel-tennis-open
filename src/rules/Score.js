// Score — tennis scoring: advantage games, tiebreaks, umpire calls, big points
class Score{
  static PTNAME=['Love','Fifteen','Thirty','Forty'];
  static ORD=['first','second','third'];
  constructor(a,b,first,format=MatchFormat.ALL[0]){
    this.f=format;this.p=[a,b];this.pts=[0,0];this.games=[0,0];this.sets=[0,0];this.done=[];
    this.mode='game';this.server=first;this.tbFirst=first;this.over=false;this.winner=null;
  }
  get srv(){return this.p[this.server];} get rcv(){return this.p[1-this.server];}
  get total(){return this.pts[0]+this.pts[1];}
  get setNo(){return this.done.length+1;}
  get finalSet(){return this.sets[0]===this.f.sets-1&&this.sets[1]===this.f.sets-1;}
  get tbTarget(){return this.f.sets>1&&this.finalSet?10:7;}
  get deuceCourt(){return this.total%2===0;}
  label(i){
    if(this.mode!=='game')return String(this.pts[i]);
    const a=this.pts[i],b=this.pts[1-i];
    if(a>=3&&b>=3)return a>b?'AD':'40';
    return['0','15','30','40'][Math.min(a,3)];
  }
  clone(){return Object.assign(Object.create(Score.prototype),this,{pts:this.pts.slice(),games:this.games.slice(),sets:this.sets.slice(),done:this.done.slice()});}
  // what the next point is worth, if anything: break, set or match point
  bigPoint(){
    for(const w of[0,1]){
      const t=this.clone().point(w).type;
      if(t==='match')return{w,label:'Match point'};
      if(t==='set')return{w,label:'Set point'};
      if(t==='game'&&w!==this.server)return{w,label:'Break point'};
    }
    return null;
  }
  point(w){
    const ev={w,type:'point',changeEnds:false,sit:false,setOver:false,call:''};
    const l=1-w;this.pts[w]++;
    if(this.mode==='game'){
      if(this.pts[w]>=4&&this.pts[w]-this.pts[l]>=2){
        this.pts=[0,0];this.games[w]++;ev.type='game';
        const g=this.games,GW=this.f.games,tg=g[0]+g[1];
        if(g[w]>=GW&&g[w]-g[l]>=2)return this.endSet(w,ev,false);
        this.server=1-this.server;
        if(tg%2===1){ev.changeEnds=true;ev.sit=tg>1;}
        if(g[0]===GW&&g[1]===GW){this.mode='tb';this.tbFirst=this.server;}
      }
      ev.call=this.callGame(ev);
      return ev;
    }
    if(this.pts[w]>=this.tbTarget&&this.pts[w]-this.pts[l]>=2){
      this.games[w]++;const tb=this.pts.slice();this.pts=[0,0];
      return this.endSet(w,ev,tb);
    }
    const t=this.total;
    if(t%2===1)this.server=1-this.server;
    if(t%6===0)ev.changeEnds=true;
    const a=this.pts[this.server],b=this.pts[1-this.server],P=this.p;
    ev.call=a===b?`${a} all.`:`${Math.max(a,b)}–${Math.min(a,b)}, ${P[a>b?this.server:1-this.server].short}.`;
    return ev;
  }
  endSet(w,ev,tb){
    const P=this.p,g=this.games.slice();
    this.done.push({g,tb:tb?Math.min(tb[0],tb[1]):null});this.sets[w]++;
    ev.setOver=true;ev.type='set';ev.changeEnds=(g[0]+g[1])%2===1;ev.sit=true;
    if(this.sets[w]===this.f.sets){this.over=true;this.winner=w;ev.type='match';ev.call=`Game, set and match, ${P[w].short}.`;return ev;}
    ev.call=`Game and ${Score.ORD[this.done.length-1]} set, ${P[w].short}, ${Math.max(...g)}–${Math.min(...g)}.`;
    // after a tiebreak, whoever received first in it serves first; otherwise the rotation carries on
    this.server=tb?1-this.tbFirst:1-this.server;
    this.games=[0,0];this.mode='game';
    return ev;
  }
  callGame(ev){
    const P=this.p;
    if(ev.type==='game'){
      const g=this.games,lead=g[0]>g[1]?0:1,s=n=>n===1?'':'s';
      const tail=g[0]===g[1]?`${g[0]} game${s(g[0])} all.`:`${P[lead].short} leads ${g[lead]} game${s(g[lead])} to ${g[1-lead]}.`;
      return`Game, ${P[ev.w].short}. ${tail}`;
    }
    const a=this.pts[this.server],b=this.pts[1-this.server];
    if(a>=3&&b>=3)return a===b?'Deuce.':`Advantage, ${P[a>b?this.server:1-this.server].short}.`;
    if(a===b)return`${Score.PTNAME[a]} all.`;
    return`${Score.PTNAME[a]}–${Score.PTNAME[b]}.`;
  }
  // "6–4 7–6(5)" from the winner's side or a fixed side
  line(side=0){return this.done.map(d=>`${d.g[side]}–${d.g[1-side]}${d.tb!=null?`(${d.tb})`:''}`).join(' ');}
}
