// Tactics — what each player has learned about which choices win points
// Every time a computer player chooses between tactics (cross or line, slice or lob, where to serve…) the choice is
// remembered for the point. When the point ends, the winner's choices are credited and the loser's blamed, the most
// recent ones most. A choice's learned value q ∈ [−1,1] multiplies its base weight by exp(BETA·q), so habits that win
// are played more and habits that lose fade — but never vanish, so the player keeps exploring.
// Values start from LEARNED (self-play, see tools/train.js) and keep changing with every point played here.
// In a browser, what was learned on top of LEARNED is kept in localStorage as a difference, so the players go on
// learning from match to match and still pick up every new round of self-play that ships with the game. That
// difference can be exported as a file and folded into LEARNED for everyone (tools/merge.js).
class Tactics{
  static ALPHA=.05;   // how fast a value moves toward the latest result
  static GAMMA=.6;    // how much less each earlier choice in the point is credited
  static BETA=2.6;    // how strongly a learned value bends the choice (training explores with a lower one)
  static KEY='pto.tactics.v3';
  static points=0;    // points played in this browser that the stored difference rests on
  constructor(q=null){this.q=q||Tactics.load();this.trail=[[],[]];}
  static base(){return typeof LEARNED!=='undefined'?LEARNED:{};}
  // add w × a difference {player:{situation:{tactic:Δ}}} to a table of values
  static apply(q,d,w=1){
    for(const p in d)for(const s in d[p])for(const t in d[p][s]){const v=+d[p][s][t];if(!isFinite(v))continue;
      const S=(q[p]||(q[p]={}))[s]||(q[p][s]={});S[t]=clamp((S[t]||0)+w*v,-1,1);}
    return q;
  }
  static stored(){try{if(typeof localStorage!=='undefined'){const s=localStorage.getItem(Tactics.KEY);if(s){const o=JSON.parse(s);if(o&&o.d)return o;}}}catch(e){}return null;}
  static load(){
    const q=JSON.parse(JSON.stringify(Tactics.base())),o=Tactics.stored();
    if(o){Tactics.apply(q,o.d);Tactics.points=o.n||0;}
    return q;
  }
  // what this table has learned beyond the shipped values
  delta(){
    const B=Tactics.base(),d={};
    for(const p in this.q){if(p==='_')continue;for(const s in this.q[p])for(const t in this.q[p][s]){
      const v=Math.round((this.q[p][s][t]-(((B[p]||{})[s]||{})[t]||0))*1000)/1000;if(Math.abs(v)>=.002)((d[p]||(d[p]={}))[s]||(d[p][s]={}))[t]=v;}}
    return d;
  }
  save(){try{if(typeof localStorage!=='undefined')localStorage.setItem(Tactics.KEY,JSON.stringify({n:Tactics.points,d:this.delta()}));}catch(e){}}
  // the file a person can hand over: what the players learned from the matches played in this browser
  static exportFile(){const o=Tactics.stored()||{n:0,d:{}};return JSON.stringify({game:'pixel-tennis-open',kind:'tactics-delta',version:3,date:new Date().toISOString().slice(0,10),points:o.n||0,delta:o.d},null,1);}
  static forget(){try{if(typeof localStorage!=='undefined')localStorage.removeItem(Tactics.KEY);}catch(e){}}
  key(P){return P.st.tkey||P.st.short;}
  table(P){const k=this.key(P);return this.q[k]||(this.q[k]={});}
  // choose from [[tactic,weight],…] in a situation, bent by what has been learned
  pick(P,sit,list){
    if(P.st.noLearn)return rng.weighted(list);
    const q=this.table(P)[sit];
    const tac=rng.weighted(q?list.map(([t,w])=>[t,w*Math.exp(Tactics.BETA*(q[t]||0))]):list);
    this.trail[P.idx].push(sit,tac);return tac;
  }
  begin(){this.trail=[[],[]];}
  // the point went to player w: credit and blame, latest choice first
  reward(w,players){
    for(const P of players){if(P.st.noLearn)continue;
      const tr=this.trail[P.idx],r=P.idx===w?1:-1,T=this.table(P);let g=1;
      for(let k=tr.length-2;k>=0;k-=2){const s=T[tr[k]]||(T[tr[k]]={}),t=tr[k+1],v=s[t]||0;s[t]=clamp(v+Tactics.ALPHA*g*(r-v),-1,1);g*=Tactics.GAMMA;}
    }
    this.begin();
  }
}
