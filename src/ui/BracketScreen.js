// BracketScreen — the tournament draw, laid out like an official draw sheet
// Quarter-finals → semi-finals → final → champion, joined by bracket lines; seeds, country codes and set-by-set scores
// (tiebreak points small, on the score of the set's loser). Matches being played in the background show LIVE with
// their running score; the person's next match is marked. Beneath: the next match, or the champion.
class BracketScreen{
  constructor(game){this.g=game;$('brGo').onclick=()=>this.go();$('brQuit').onclick=()=>{this.close();game.endTour();};}
  // the score cells of one side ('a' or 'b') of a slot: finished sets, or for a live match the sets so far and the
  // games (or tiebreak points) of the set under way
  cells(t,m,side){
    const o=side==='a'?'b':'a';
    if(m.live&&m.live.score){const sc=m.live.score,i=side==='a'?0:1;
      const done=sc.done.map(d=>`<i class="${d.g[i]>d.g[1-i]?'w':''}">${t.format.tbOnly?d.pts[i]:d.g[i]}</i>`).join('');
      return done+(sc.over?'':`<i class="cur">${sc.mode==='tb'&&(t.format.tbOnly||sc.games[0]===sc.games[1])?sc.pts[i]:sc.games[i]}</i>`);}
    if(!m.sets)return'';
    return m.sets.map(s=>{const mine=s[side],their=s[o];if(t.format.tbOnly)return`<i class="${s['p'+side]>s['p'+o]?'w':''}">${s['p'+side]}</i>`;
      return`<i class="${mine>their?'w':''}">${mine}${s.tb!=null&&mine<their?`<sup>${s.tb}</sup>`:''}</i>`;}).join('');
  }
  row(t,m,side){
    const id=m[side];if(id==null)return`<div class="dr tbd"><span class="ds"></span><span class="dc">—</span><span class="dn">TBD</span><span class="dsc"></span></div>`;
    const p=t.player(id),won=m.w===id,lost=m.w!=null&&!won;
    return`<div class="dr${won?' w':''}${lost?' l':''}${id===t.me?' me':''}"><span class="ds">${t.seed(id)}</span><span class="dc">${p.cc}</span><span class="dn">${p.short.toUpperCase()}${id===t.me?'<b class="dy">YOU</b>':''}</span><span class="dsc">${this.cells(t,m,side)}</span></div>`;
  }
  match(t,m){
    const next=t.mine===m&&m.w==null,live=!!m.live&&m.w==null;
    return`<div class="dm${next?' next':''}${live?' live':''}">${this.row(t,m,'a')}${this.row(t,m,'b')}${live?'<span class="dtag live">LIVE</span>':next?'<span class="dtag">YOUR MATCH</span>':''}</div>`;
  }
  open(){
    const t=this.g.tour;if(!t)return;
    const pairs=r=>{const out=[];for(let i=0;i<r.length;i+=2)out.push(r.slice(i,i+2));return out;};
    const champ=t.over?t.player(t.champion):null;
    $('brCols').innerHTML=t.rounds.map((r,i)=>`<div class="d-col"><h3>${Tournament.ROUNDS[i].toUpperCase()}</h3><div class="d-body">${
        pairs(r).map(pr=>`<div class="d-pair${pr.length===1?' one':''}">${pr.map(m=>this.match(t,m)).join('')}</div>`).join('')}</div></div>`).join('')+
      `<div class="d-col d-champ"><h3>CHAMPION</h3><div class="d-body"><div class="d-cup${champ?' won':''}">${Trophy.img('trophy d-trophy')}${champ?`${Portrait.img(champ,'face d-face')}<b>${champ.short.toUpperCase()}</b><span>${champ.cc} · seed ${t.seed(champ.id)}</span>`:'<b>?</b><span>To be decided</span>'}</div></div></div>`;
    const me=t.player(t.me),opp=t.opponent,mine=champ&&champ.id===t.me,running=!!this.g.tourRun&&t.out&&!t.over;
    $('brHead').textContent=t.over?'CHAMPION CROWNED':t.name.toUpperCase();$('brFans').textContent=t.fans?`${t.fans}k fans`:'';
    $('bracket').classList.toggle('won',!!mine);
    let note;
    if(mine)note=this.ceremony(t,champ);
    else if(champ)note=`<div class="d-next">${Trophy.img('trophy small')}${Portrait.img(champ,'face big')}<div><small>CHAMPION</small><b>${champ.name}</b><span>${t.out?`wins the Pixel Tennis Open. You went out in the ${this.lostIn(t)}.`:'wins the Pixel Tennis Open.'}</span></div></div>`;
    else if(t.out)note=`<div class="d-next"><div><small>OUT IN THE ${this.lostIn(t).toUpperCase()}</small><b>The rest of the draw is being played</b><span>Watch the results come in, or fast-forward to the final.</span></div></div>`;
    else note=`<div class="d-next">${Portrait.img(me,'face big')}<i class="d-vs">VS</i>${Portrait.img(opp,'face big')}<div><small>NEXT · ${['QUARTER-FINAL','SEMI-FINAL','FINAL'][t.round]}</small><b>${opp.name}</b><span>${opp.cc} · seed ${t.seed(opp.id)} · ${opp.overall} OVR · ${opp.style}</span></div></div>`;
    if($('brNote').dataset.k!==note){$('brNote').innerHTML=note;$('brNote').dataset.k=note;}
    $('brGo').innerHTML=(t.over?'New tournament ▶':running?(this.g.tourFast?'Fast-forwarding…':'Fast-forward ▶▶'):`Play the ${['quarter-final','semi-final','final'][t.round]} ▶`)+'<kbd>Enter</kbd>';
    $('brGo').disabled=running&&this.g.tourFast;
    $('bracket').hidden=false;
    if(mine&&!t.feted){t.feted=true;const s=this.g.sound;s.event({type:'crowd',kind:'roar',power:1},0);s.event({type:'crowd',kind:'applause',power:1},0);
      s.voice.say(`Ladies and gentlemen, the champion of the Pixel Tennis Open: ${champ.name}!`);}
  }
  // the champion's panel when it is the person: the cup, the road to the title, confetti
  ceremony(t,p){
    const road=t.rounds.map((r,i)=>{const m=r.find(q=>q.a===t.me||q.b===t.me),o=t.player(m.a===t.me?m.b:m.a);return`<li><i>${['QF','SF','F'][i]}</i> d. ${o.short} <em>${m.line}</em></li>`;}).join('');
    const cols=['#f4d44a','#f4f3ec','#7bb8ea','#ff7a59','#7bd88f'],conf=Array.from({length:36},(_,i)=>`<i style="left:${(i*37+11)%100}%;background:${cols[i%5]};animation-delay:${-(i*.37%4).toFixed(2)}s;animation-duration:${(3+i%5*.45).toFixed(2)}s"></i>`).join('');
    return`<div class="cere"><div class="conf">${conf}</div><div class="cup">${Trophy.img()}<s></s><s></s><s></s></div>${Portrait.img(p,'face big')}
      <div><small>CHAMPION</small><b>${p.name}</b><span>lifts the Pixel Tennis Open Cup${t.fans?` · ${t.fans}k fans`:''}</span><ul>${road}</ul></div></div>`;
  }
  lostIn(t){for(let i=0;i<3;i++)if(t.rounds[i].some(m=>(m.a===t.me||m.b===t.me)&&m.w!=null&&m.w!==t.me))return['quarter-finals','semi-finals','final'][i];return'draw';}
  go(){const t=this.g.tour;if(!t)return;
    if(!t.over&&t.out){this.g.tourFast=true;this.open();return;}          // out: hurry the rest of the draw
    this.close();if(t.over)this.g.endTour();else this.g.playTour();}
  close(){$('bracket').hidden=true;$('brNote').innerHTML='';$('brNote').dataset.k='';}
}
