// Tactics — what each player has learned about which choices win points
// Every time a computer player chooses between tactics (cross or line, slice or lob, where to serve…) the choice is
// remembered for the point. When the point ends, the winner's choices are credited and the loser's blamed, the most
// recent ones most. A choice's learned value q ∈ [−1,1] multiplies its base weight by exp(BETA·q), so habits that win
// are played more and habits that lose fade — but never vanish, so the player keeps exploring.
// Values start from LEARNED (self-play, see tools/train.js) and keep changing with every point played here;
// in a browser they are kept in localStorage, so the players go on learning from match to match.
class Tactics{
  static ALPHA=.05;   // how fast a value moves toward the latest result
  static GAMMA=.6;    // how much less each earlier choice in the point is credited
  static BETA=1.8;    // how strongly a learned value bends the choice
  static KEY='pto.tactics.v1';
  constructor(q=null){this.q=q||Tactics.load();this.trail=[[],[]];}
  static load(){
    const q=typeof LEARNED!=='undefined'?JSON.parse(JSON.stringify(LEARNED)):{};
    try{if(typeof localStorage!=='undefined'){const s=localStorage.getItem(Tactics.KEY);if(s)Object.assign(q,JSON.parse(s));}}catch(e){}
    return q;
  }
  save(){try{if(typeof localStorage!=='undefined')localStorage.setItem(Tactics.KEY,JSON.stringify(this.q));}catch(e){}}
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
