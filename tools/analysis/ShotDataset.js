// ShotDataset — every shot of self-play as a row: the situation it was played in, the choice made, and whether the
// hitter went on to win the point. Also each player's season of matches summed up as a style profile.
// The game is not changed: the collector watches a match from outside, wrapping its contact step.
const path=require('path'),{loadSim}=require(path.join(__dirname,'..','..','tests','load.js'));
const{Match,ROSTER,MatchFormat}=loadSim(['Match','ROSTER','MatchFormat']);
const NUM=['stretch','height','inPace','inSpin','depth','oppDepth','oppNet','gap','isReturn','rally','power','control','accuracy','spin','oppSpeed','oppControl'];
const WINGS=['fh','bh','volley','smash'];
const GROUP={attack:['open','line','flat','drive','angle','behind','approach'],steady:['cross','safe','deep'],defend:['slice','lob'],net:['volley','putaway','dropvolley','smash'],touch:['drop','dropvolley','angle'],pass:['passline','passcross','dip']};
class ShotDataset{
  static get NUM(){return NUM;} static get WINGS(){return WINGS;} static get ROSTER(){return ROSTER;}
  // play `rounds` of every ordered pairing (13 × 12 short sets a round)
  static collect(rounds=1,log=()=>{},limit=Infinity){
    const rows=[],prof=ROSTER.map(p=>({name:p.short,shots:0,tac:{},depth:0,net:0,pts:0,won:0,svPts:0,svWon:0,rtPts:0,rtWon:0,aces:0,df:0,win:0,ue:0,rallies:0,rallyShots:0,v:0}));
    let mid=0;
    for(let r=0;r<rounds;r++)for(let i=0;i<ROSTER.length;i++)for(let j=0;j<ROSTER.length;j++){
      if(i===j||mid>=limit)continue;const m=new Match({a:ROSTER[i],b:ROSTER[j],format:MatchFormat.get('short')}),pid=[i,j];mid++;
      let pending=[],server=-1;
      const contact=m.contact.bind(m);
      m.contact=P=>{
        const p=P.plan,b=m.ball,O=m.other(P),S=p&&p.shot,before=m.stats.shots,ret=m.isServe,rally=m.rallyLen;
        const pre=S?{stretch:p.stretch,height:p.y,inPace:Math.hypot(b.vx,b.vz),inSpin:b.topspin/1000,depth:Math.abs(P.z),oppDepth:Math.abs(O.z),oppNet:Math.abs(O.z)<7?1:0,
          gap:Math.abs(S.t.x-O.x),isReturn:ret?1:0,rally,tac:S.tac,wing:p.kind==='volley'?'volley':p.kind==='smash'?'smash':p.wing}:null;
        contact(P);
        if(pre&&m.stats.shots>before){const R=P.st.ratings,Ro=O.st.ratings;
          pending.push({...pre,power:R.power,control:R.control,accuracy:R.accuracy,spin:R.spin,oppSpeed:Ro.speed,oppControl:Ro.control,who:P.idx,match:mid,player:pid[P.idx],opp:pid[O.idx]});}
      };
      let n=0;
      while(!(m.stage==='over'&&m.result)&&n<120*60*90){
        const sv=m.score?m.score.srv.idx:-1;m.tick();n++;
        for(const e of m.events){
          if(e.type!=='scored')continue;
          const srvP=pid[sv],rcvP=pid[1-sv],w=e.w;
          for(const s of pending){rows.push({...s,y:s.who===w?1:0});const q=prof[s.player];q.shots++;q.tac[s.tac]=(q.tac[s.tac]||0)+1;q.depth+=s.depth;if(GROUP.net.includes(s.tac))q.net++;}
          if(sv>=0){prof[srvP].svPts++;prof[rcvP].rtPts++;if(w===sv)prof[srvP].svWon++;else prof[rcvP].rtWon++;}
          pending=[];
        }
        m.events.length=0;
      }
      m.players.forEach((P,k)=>{const q=prof[pid[k]],s=P.ms;q.aces+=s.aces;q.df+=s.df;q.win+=s.win;q.ue+=s.ue;q.pts+=s.pts;});
      prof[i].rallies+=m.stats.rallies;prof[i].rallyShots+=m.stats.rallyShots;prof[j].rallies+=m.stats.rallies;prof[j].rallyShots+=m.stats.rallyShots;
      if(mid%26===0)log(`${mid} matches, ${rows.length} shots`);
    }
    return{rows,profiles:prof.map(q=>ShotDataset.profile(q))};
  }
  // a player's style in numbers, from what they did rather than what their ratings say
  static profile(q){
    const share=g=>GROUP[g].reduce((s,t)=>s+(q.tac[t]||0),0)/q.shots;
    return{name:q.name,f:{attack:share('attack'),steady:share('steady'),defend:share('defend'),net:q.net/q.shots,touch:share('touch'),pass:share('pass'),
      depth:q.depth/q.shots,rally:q.rallyShots/Math.max(1,q.rallies),aces:q.aces/Math.max(1,q.svPts),df:q.df/Math.max(1,q.svPts),
      serveWon:q.svWon/Math.max(1,q.svPts),returnWon:q.rtWon/Math.max(1,q.rtPts),winners:q.win/Math.max(1,q.svPts+q.rtPts),errors:q.ue/Math.max(1,q.svPts+q.rtPts)}};
  }
}
module.exports=ShotDataset;
