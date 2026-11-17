// CareerEventScreen — an event the person is in: the next opponent and the odds Elo gives, the road so far, the
// biggest names still in the draw; play the match or simulate it. When the event is over: how far the person went,
// the points, the new ranking, and the champion.
class CareerEventScreen{
  constructor(flow){this.f=flow;$('ceGo').onclick=()=>this.f.primary();$('ceSim').onclick=()=>this.f.simulate();}
  get on(){return!$('cevent').hidden;}
  close(){$('cevent').hidden=true;}
  open(){
    const c=this.f.c,E=c.event;if(!E)return;const ev=E.ev,T=E.tier,d=E.d;
    $('ceName').textContent=ev.name.toUpperCase();$('ceTier').textContent=`${T.name.toUpperCase()} · ${d.n} PLAYERS · ${ev.year||c.year}`;
    const over=d.done||d.out;$('ceRound').textContent=over?(d.champion==='me'?'CHAMPION':'EVENT OVER'):CAREER_DATA.ROUND_NAMES[E.roundName].toUpperCase();
    const prof=k=>c.profileOf(k),rk=k=>k==='me'?WorldRanking.label(c.rank):d.ranks[k],seed=k=>d.seeds[k]?` [${d.seeds[k]}]`:'';
    // the road: the person's matches so far
    const road=d.rounds.map((r,i)=>{const m=r.find(q=>q.a==='me'||q.b==='me');if(!m||m.w==null)return'';const o=m.a==='me'?m.b:m.a,p=prof(o);
      return`<li><i>${E.names[i]}</i>${m.w==='me'?'d.':'lost to'} ${p.name}${seed(o)} <em>${m.line==='sim'?'simulated':m.line}</em></li>`;}).filter(Boolean).join('')||'<li class="none">Your first match is next.</li>';
    // the top seeds' fate this far
    const alive=new Set(d.rounds[d.round].flatMap(q=>[q.a,q.b]).filter(k=>k)),seeds=Object.entries(d.seeds).filter(([k])=>k!=='me').sort((a,b)=>a[1]-b[1]).slice(0,4);
    const big=seeds.map(([k,s])=>{const p=prof(k),out=!alive.has(k)||d.done&&d.champion!==k;return`<li class="${out?'out':''}">[${s}] ${p.name} <span>${d.champion===k?'champion':out?'out':'in'}</span></li>`;}).join('');
    let next;
    if(over){const res=E.result,ch=d.champion,cp=prof(ch);
      next=`<div class="d-next">${ch==='me'?Trophy.img('trophy small'):''}${Portrait.img(cp,'face big')}<div><small>${ch==='me'?'CHAMPION':`OUT IN THE ${CAREER_DATA.ROUND_NAMES[res.round].toUpperCase()}`}</small>
        <b>${ch==='me'?`You win the ${ev.name}!`:`${cp.name} wins the ${ev.name}`}</b><span>+${res.pts} ranking points · ranking after the event: ${WorldRanking.label(WorldRanking.rankOf(c.rankPoints+res.pts))}</span></div></div>`;}
    else{const o=E.opponent,p=prof(o),pw=EloModel.win(c.strength-E.elo(o),T.sets);
      next=`<div class="d-next">${Portrait.img(c.profile(),'face big')}<i class="d-vs">VS</i>${Portrait.img(p,'face big')}<div><small>${CAREER_DATA.ROUND_NAMES[E.roundName].toUpperCase()}${E.lastRound?'':` · ${E.names.length-d.round-1} more to the title`}</small>
        <b>${p.name}${seed(o)}</b><span>${p.cc} · ranked ${rk(o)} · level ${Math.round(E.elo(o))} · ${p.style}</span>
        <span class="odds">Elo gives you <strong>${Math.round(pw*100)}%</strong> in a ${T.sets===3?'best-of-five':'best-of-three'} match</span></div></div>`;}
    $('ceNext').innerHTML=next;
    $('cePath').innerHTML=`<div><h3>YOUR ROAD</h3><ul class="ce-road">${road}</ul></div><div><h3>TOP SEEDS</h3><ul class="ce-seeds">${big}</ul></div>`;
    const wait=!!this.f.waiting&&!over;$('ceSim').hidden=over||wait;$('ceGo').innerHTML=over?'Continue ▶':wait?'Back to the match ▶':`Play the ${CAREER_DATA.ROUND_NAMES[E.roundName].toLowerCase()} ▶`;
    $('cevent').hidden=false;$('cevent').scrollTop=0;
  }
}
