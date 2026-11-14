// BracketScreen — the tournament draw between matches
class BracketScreen{
  constructor(game){this.g=game;$('brGo').onclick=()=>this.go();$('brQuit').onclick=()=>{this.close();game.endTour();};}
  row(t,id,m,side){
    if(id==null)return`<div class="bp tbd"><span class="nm">—</span></div>`;
    const p=t.player(id),won=m.w===id,lost=m.w!=null&&!won;
    return`<div class="bp${won?' won':''}${lost?' lost':''}${id===t.me?' me':''}">${Portrait.img(p)}<span class="seed">${p.rank}</span><span class="nm">${p.short}</span>${id===t.me?'<span class="you">YOU</span>':''}${won&&side===0?`<span class="sc">${m.line}</span>`:won?`<span class="sc">${m.line}</span>`:''}</div>`;
  }
  open(){
    const t=this.g.tour;if(!t)return;
    $('brCols').innerHTML=t.rounds.map((r,i)=>`<div class="bcol"><h3>${Tournament.ROUNDS[i].toUpperCase()}</h3>${r.map(m=>`<div class="bm${t.mine===m?' next':''}">${this.row(t,m.a,m,0)}${this.row(t,m.b,m,1)}</div>`).join('')}</div>`).join('');
    const me=t.player(t.me),opp=t.opponent,champ=t.over?t.player(t.champion):null;
    $('brHead').textContent=(t.over?'CHAMPION':t.name.toUpperCase())+(t.fans?`  ·  ${t.fans}k fans`:'');
    $('brNote').innerHTML=champ?`<div class="champ">${Portrait.img(champ,'face big')}<div><b>${champ.name}</b><span>${champ.id===t.me?'You won the Pixel Tennis Open!':t.out?'wins the Pixel Tennis Open. You went out in the '+this.lostIn(t)+'.':'wins the Pixel Tennis Open.'}</span></div></div>`
      :`<div class="next">${Portrait.img(me,'face big')}<b>VS</b>${Portrait.img(opp,'face big')}<div><b>${opp.name}</b><span>Seed ${opp.rank} · ${opp.style}</span></div></div>`;
    $('brGo').textContent=t.over?'New tournament ▶':`Play the ${t.round===2?'final':t.round===1?'semi-final':'quarter-final'} ▶`;
    $('bracket').hidden=false;
  }
  lostIn(t){for(let i=0;i<3;i++)if(t.rounds[i].some(m=>(m.a===t.me||m.b===t.me)&&m.w!=null&&m.w!==t.me))return['quarter-finals','semi-finals','final'][i];return'draw';}
  go(){const t=this.g.tour;if(!t)return;this.close();if(t.over)this.g.endTour();else this.g.playTour();}
  close(){$('bracket').hidden=true;}
}
