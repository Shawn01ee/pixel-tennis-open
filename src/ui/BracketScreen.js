// BracketScreen — the tournament draw between matches
class BracketScreen{
  constructor(game){this.g=game;$('brGo').onclick=()=>this.go();$('brQuit').onclick=()=>{this.close();game.endTour();};}
  row(t,id,m,side){
    if(id==null)return`<div class="bp tbd"><span class="nm">—</span></div>`;
    const p=t.player(id),won=m.w===id,lost=m.w!=null&&!won;
    return`<div class="bp${won?' won':''}${lost?' lost':''}${id===t.me?' me':''}">${Portrait.img(p)}<span class="seed">${t.seed(id)}</span><span class="nm">${p.short}</span>${id===t.me?'<span class="you">YOU</span>':''}${won&&side===0?`<span class="sc">${m.line}</span>`:won?`<span class="sc">${m.line}</span>`:''}</div>`;
  }
  open(){
    const t=this.g.tour;if(!t)return;
    $('brCols').innerHTML=t.rounds.map((r,i)=>`<div class="bcol"><h3>${Tournament.ROUNDS[i].toUpperCase()}</h3>${r.map(m=>`<div class="bm${t.mine===m?' next':''}">${this.row(t,m.a,m,0)}${this.row(t,m.b,m,1)}</div>`).join('')}</div>`).join('');
    const me=t.player(t.me),opp=t.opponent,champ=t.over?t.player(t.champion):null;
    $('brHead').textContent=(t.over?'CHAMPION':t.name.toUpperCase())+(t.fans?`  ·  ${t.fans}k fans`:'');
    const mine=champ&&champ.id===t.me;$('bracket').classList.toggle('won',!!mine);
    $('brNote').innerHTML=mine?this.ceremony(t,champ):champ?`<div class="champ">${Trophy.img('trophy small')}${Portrait.img(champ,'face big')}<div><b>${champ.name}</b><span>${t.out?'wins the Pixel Tennis Open. You went out in the '+this.lostIn(t)+'.':'wins the Pixel Tennis Open.'}</span></div></div>`
      :`<div class="next">${Portrait.img(me,'face big')}<b>VS</b>${Portrait.img(opp,'face big')}<div><b>${opp.name}</b><span>Seed ${t.seed(opp.id)} · ${opp.style}</span></div></div>`;
    $('brGo').textContent=t.over?'New tournament ▶':`Play the ${t.round===2?'final':t.round===1?'semi-final':'quarter-final'} ▶`;
    $('bracket').hidden=false;
    if(mine&&!t.feted){t.feted=true;const s=this.g.sound;s.event({type:'crowd',kind:'roar',power:1},0);s.event({type:'crowd',kind:'applause',power:1},0);
      s.voice.say(`Ladies and gentlemen, the champion of the Pixel Tennis Open: ${champ.name}!`);}
  }
  // the trophy presentation: the cup, the champion, the road to the title, confetti
  ceremony(t,p){
    const road=t.rounds.map((r,i)=>{const m=r.find(q=>q.a===t.me||q.b===t.me),o=t.player(m.a===t.me?m.b:m.a);return`<li><i>${['QF','SF','F'][i]}</i> d. ${o.short} <em>${m.line}</em></li>`;}).join('');
    const cols=['#f4d44a','#f4f3ec','#7bb8ea','#ff7a59','#7bd88f'],conf=Array.from({length:36},(_,i)=>`<i style="left:${(i*37+11)%100}%;background:${cols[i%5]};animation-delay:${-(i*.37%4).toFixed(2)}s;animation-duration:${(3+i%5*.45).toFixed(2)}s"></i>`).join('');
    return`<div class="cere"><div class="conf">${conf}</div><div class="cup">${Trophy.img()}<s></s><s></s><s></s></div>${Portrait.img(p,'face big')}
      <div><small>CHAMPION</small><b>${p.name}</b><span>lifts the Pixel Tennis Open Cup${t.fans?` · ${t.fans}k fans`:''}</span><ul>${road}</ul></div></div>`;
  }
  lostIn(t){for(let i=0;i<3;i++)if(t.rounds[i].some(m=>(m.a===t.me||m.b===t.me)&&m.w!=null&&m.w!==t.me))return['quarter-finals','semi-finals','final'][i];return'draw';}
  go(){const t=this.g.tour;if(!t)return;this.close();if(t.over)this.g.endTour();else this.g.playTour();}
  close(){$('bracket').hidden=true;$('brNote').innerHTML='';}
}
