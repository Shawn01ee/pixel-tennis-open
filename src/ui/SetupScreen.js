// SetupScreen — pick both players, the format and the session
// pick both players, the format and the session, then walk out
class SetupScreen{
  constructor(game){
    this.g=game;this.a=2;this.b=1;this.fmt='short';this.phase=game.R.phaseKey;
    $('fmtRow').innerHTML=MatchFormat.ALL.map(f=>`<button id="fm-${f.key}" aria-pressed="false">${f.name}</button>`).join('');
    $('sesRow').innerHTML=Object.keys(PHASES).map(k=>`<button id="se-${k}" aria-pressed="false">${PHASES[k].name}</button>`).join('');
    for(const f of MatchFormat.ALL)$('fm-'+f.key).onclick=()=>{this.fmt=f.key;this.render();};
    for(const k in PHASES)$('se-'+k).onclick=()=>{this.phase=k;game.setPhase(k);this.render();};
    $('walkOut').onclick=()=>game.play(this.a,this.b,this.fmt,this.phase);
    this.render();
  }
  side(id,title,sel,other){
    const p=ROSTER[sel],r=p.ratings,bar=(n,v)=>`<span>${n}</span><i><u style="width:${v}%"></u></i><em>${v}</em>`;
    $(id).innerHTML=`<h2>${title}</h2><div class="who"><b style="background:${hexs(p.look.shirt)}"></b><strong>${p.name}</strong></div>
      <div class="meta">${p.cc} · No. ${p.rank} · ${p.hand<0?'Left':'Right'}-handed</div>
      <div class="meta">${p.style}</div>
      <div class="bars">${bar('Serve',r.serve)}${bar('Power',r.power)}${bar('Speed',r.speed)}${bar('Spin',r.spin)}${bar('Control',r.control)}${bar('Touch',r.touch)}</div>
      <div class="picks">${ROSTER.map(q=>`<button data-i="${q.id}" aria-pressed="${q.id===sel}" ${q.id===other?'disabled':''}><b style="background:${hexs(q.look.shirt)}"></b><span>${q.short}</span></button>`).join('')}</div>`;
    $(id).querySelectorAll('.picks button').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(id==='sideA')this.a=i;else this.b=i;this.render();});
  }
  render(){
    this.side('sideA','YOU',this.a,this.b);this.side('sideB','OPPONENT',this.b,this.a);
    for(const f of MatchFormat.ALL)$('fm-'+f.key).setAttribute('aria-pressed',String(this.fmt===f.key));
    for(const k in PHASES)$('se-'+k).setAttribute('aria-pressed',String(this.phase===k));
    $('fmtDesc').textContent=MatchFormat.get(this.fmt).desc;
  }
  open(){this.phase=this.g.R.phaseKey;this.render();$('setup').hidden=false;}
  close(){$('setup').hidden=true;}
}
