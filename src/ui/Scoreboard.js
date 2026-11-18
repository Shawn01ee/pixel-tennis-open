// Scoreboard — the broadcast scoreboard
class Scoreboard{
  constructor(){this.key='';}
  update(m){
    const sc=m.score;
    if(!sc){const k='pre'+m.players.map(p=>p.short);if(k!==this.key){this.key=k;$('sbT').innerHTML=this.rows(m,null);$('sbMode').textContent='Walk-on';$('sbBadge').hidden=true;$('sbSpeed').textContent='';}return;}
    const big=m.stage==='play'&&m.big&&!sc.over?m.big:null;
    const key=[sc.pts,sc.games,sc.sets,sc.server,sc.over,sc.mode,m.kmh,m.serveLabel,big&&big.label,m.control.idx,m.stage,...m.players.map(P=>Math.round(P.sta.energy*50))].join();
    if(key===this.key)return;this.key=key;
    $('sbT').innerHTML=this.rows(m,sc,big);
    $('sbMode').textContent=sc.over?'Final':sc.f.tbOnly?`Tiebreak · to ${sc.tbTarget}`:sc.mode==='tb'?`Set ${sc.setNo} · Tiebreak to ${sc.tbTarget}`:sc.f.sets>1?`Set ${sc.setNo}`:sc.f.name;
    const b=$('sbBadge');b.hidden=!big;if(big){b.textContent=big.label.toUpperCase();b.className='badge'+(big.kind==='set'?' set':big.kind==='match'?' match':'');}
    $('sbSpeed').innerHTML=m.kmh?`<b>${m.kmh}</b> km/h · ${m.serveKind} ${m.serveLabel}`:'';
  }
  // energy left: green, then amber, then red as the match wears on
  static gauge(P){const e=P.sta.energy,c=e>.6?'var(--lime)':e>.35?'var(--ball)':'var(--coral)';
    return`<span class="en" title="Energy ${Math.round(e*100)}%"><u style="width:${(e*100).toFixed(0)}%;background:${c}"></u></span>`;}
  rows(m,sc,big){
    return m.players.map((P,i)=>{
      const st=P.st,you=m.control.is(P),sv=sc&&sc.server===i&&!sc.over;
      const sets=sc?sc.done.map(d=>{const won=d.g[i]>d.g[1-i];return`<td class="set ${won?'won':''}">${d.g[i]}${d.tb!=null&&!won?`<sup>${d.tb}</sup>`:''}</td>`;}).join(''):'';
      const cur=sc&&!sc.over?`<td class="cur">${sc.games[i]}</td>`:'';
      const pt=!sc?'':sc.over?(sc.winner===i?'✓':''):sc.label(i),hot=big&&big.w===i?'hot':'';
      return`<tr><td class="sv">${sv?'<i></i>':''}</td><td class="nm">${Portrait.img(st)}<b style="background:${hexs(st.look.shirt)}"></b><span class="seed">${st.rank}</span>${st.short}<span class="cc">${st.cc}</span>${you?'<span class="you">YOU</span>':''}${Scoreboard.gauge(P)}</td>${sets}${cur}<td class="pt"><span class="${hot}">${pt}</span></td></tr>`;
    }).join('');
  }
}
