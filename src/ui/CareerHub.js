// CareerHub — the career between events: this week's events to enter (or a week of training), the world ranking
// around the player, and the career so far (record, titles, the thirteen beaten, milestones, settings)
class CareerHub{
  static TABS=[['week','THIS WEEK'],['rank','RANKING'],['career','CAREER']];
  static FMTS=['tb','one','bo3'];
  constructor(flow){this.f=flow;this.tab='week';
    $('chTabs').innerHTML=CareerHub.TABS.map(([k,n])=>`<button data-t="${k}" aria-pressed="false">${n}</button>`).join('');
    $('chTabs').querySelectorAll('button').forEach(b=>b.onclick=()=>{this.tab=b.dataset.t;this.f.g.sfx('click');this.render();});
    $('chMenu').onclick=()=>this.f.leave();
  }
  get on(){return!$('chub').hidden;}
  open(tab){if(tab)this.tab=tab;this.render();$('chub').hidden=false;$('chub').scrollTop=0;}
  close(){$('chub').hidden=true;}
  get c(){return this.f.c;}
  // a world player's place as it stands with the person on the ranking: one lower from the person's place down
  place(p){const r=this.c.rank;return r!=null&&p>=r?p+1:p;}
  render(){
    const c=this.c;if(!c)return;const me=c.profile();Portrait.cache.delete(900);
    $('chHead').innerHTML=`${Portrait.img(me,'face')}<div class="ch-id"><b>${c.s.me.name.toUpperCase()}</b><span>${c.s.me.cc} · ${CareerWorld.ARCH[c.s.me.arch]} · ${c.year}, week ${c.week}</span></div>
      <div class="ch-stats"><div class="ch-stat"><small>RANK</small><b>${WorldRanking.label(c.rank)}</b></div><div class="ch-stat"><small>POINTS</small><b>${c.points}</b></div>
      <div class="ch-stat"><small>LEVEL</small><b>${Math.round(c.level)}</b></div></div>`;
    $('chTabs').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.t===this.tab)));
    $('chBody').innerHTML=this.tab==='rank'?this.ranking():this.tab==='career'?this.record():this.week();
    const B=$('chBody');B.querySelectorAll('[data-enter]').forEach(b=>b.onclick=()=>this.f.enter(Calendar.byId(+b.dataset.enter)));
    const rb=B.querySelector('#chRest');if(rb)rb.onclick=()=>this.f.rest();
    const cb=B.querySelector('#chCont');if(cb)cb.onclick=()=>this.f.showEvent();
    B.querySelectorAll('[data-fmt]').forEach(b=>b.onclick=()=>{c.s.fmt=b.dataset.fmt;c.save();this.f.g.sfx('click');this.render();});
    const del=B.querySelector('#chDel');if(del)del.onclick=()=>{if(del.dataset.sure){this.f.erase();return;}del.dataset.sure='1';del.textContent='Tap again to delete the career for good';};
    const n=c.s.news&&c.s.news[0];$('chNews').innerHTML=n?`<i>${n.big?'★':'›'}</i>${n.text}`:'';$('chNews').classList.toggle('big',!!(n&&n.big));
  }
  week(){
    const c=this.c,E=c.event;
    if(E)return`<div class="ce-list"><button class="ce-card go" id="chCont"><span class="tier t-${E.ev.tier}">${E.tier.name.toUpperCase()}</span><b>${E.ev.name}</b><span>You are in the ${CAREER_DATA.ROUND_NAMES[E.roundName].toLowerCase()}.</span><em>Continue ▶</em></button></div>`;
    const evs=[...c.events].sort((a,b)=>(c.canEnter(b).ok?1:0)-(c.canEnter(a).ok?1:0)).map(ev=>{const T=CAREER_DATA.TIERS[ev.tier],can=c.canEnter(ev),P=CAREER_DATA.POINTS[ev.tier];
      return`<button class="ce-card${can.ok?'':' locked'}" ${can.ok?`data-enter="${ev.id}"`:'disabled'}><span class="tier t-${ev.tier}">${T.name.toUpperCase()}</span><b>${ev.name}</b>
        <span>${T.draw} players · ${T.sets===3?'best of five':'best of three'}${ev.len>1?' · two weeks':''} · ${ev.surface} court</span><span>Champion <strong>+${P.W}</strong> · final +${P.F} · semi-final +${P.SF}</span>
        <em>${can.ok?'Enter ▶':can.why}</em></button>`;}).join('');
    const exp=c.expiring(4),def=exp.length?`<p class="ch-def">Points dropping off in the next four weeks: ${exp.map(r=>`${r.pts} (${r.name})`).join(', ')}.</p>`:'';
    return`<p class="ch-lead">Week ${c.week} of ${c.year}. Enter one event, or spend the week on the practice court.</p>${def}<div class="ce-list">${evs}
      <button class="ce-card rest" id="chRest"><span class="tier">TRAINING</span><b>A week of practice</b><span>No points, but you come back a better player (+${Career.XP.train} experience).</span><em>Train ▶</em></button></div>`;
  }
  ranking(){
    const c=this.c,r=c.rank,size=WorldRanking.SIZE,row=(pl,name,cc,pts,face,me)=>`<tr class="${me?'me':''}"><td>${pl}</td><td>${face}</td><td class="nm">${name}</td><td>${cc}</td><td>${pts}</td></tr>`;
    const world=p=>{const e=c.world.at(p),q=c.world.profile(e);return row(this.place(p),q.name,q.cc,WorldRanking.points(p),Portrait.img(q,'face'),false);};
    const mine=row(WorldRanking.label(r),c.s.me.name,c.s.me.cc,c.points,Portrait.img(c.profile(),'face'),true);
    let rows='';for(let p=1;p<=10;p++){if(r!=null&&r===p)rows+=mine;rows+=world(p);}
    if(r==null||r>10){const from=Math.max(11,(r??size)-5),to=Math.min(size,(r??size)+4);if(from>11)rows+=`<tr class="gap"><td colspan="5">…</td></tr>`;
      for(let p=from;p<=to;p++){if(r===p)rows+=mine;rows+=world(p);}if(r==null||r>size)rows+=mine;}
    return`<p class="ch-lead">The ranking counts the points won over the last 52 weeks. Everyone else holds the points of his place on the real ATP ranking of 16 November 2026.</p>
      <table class="ch-rank"><tr><th>#</th><th></th><th>PLAYER</th><th></th><th>POINTS</th></tr>${rows}</table>`;
  }
  record(){
    const c=this.c,s=c.s,stars=[...ROSTER].sort((a,b)=>a.rank-b.rank);
    const titles=s.titles.length?s.titles.map(t=>`<li><i class="tier t-${t.tier}">${CAREER_DATA.TIERS[t.tier].short}</i>${t.name} <span>${t.year}</span></li>`).join(''):'<li class="none">No titles yet.</li>';
    const miles=Career.MILESTONES.map(([k,n])=>`<li class="${s.miles[k]?'done':''}">${s.miles[k]?'★':'☆'} ${n}</li>`).join('');
    const fmt=CareerHub.FMTS.map(k=>`<button data-fmt="${k}" aria-pressed="${s.fmt===k}">${MatchFormat.get(k).name}</button>`).join('');
    return`<div class="ch-rec"><div class="ch-box"><h3>RECORD</h3><p><b>${s.played.w}–${s.played.l}</b> in matches · best ranking <b>${WorldRanking.label(s.best)}</b> · ${s.titles.length} title${s.titles.length===1?'':'s'}${s.fans?` · ${s.fans}k fans`:''}</p>
      <p>Level <b>${Math.round(c.level)}</b> Elo — the level of a player ranked about ${EloModel.rankAt(c.level)}. It rises with every match, more with wins, and with training.</p><h3>TITLES</h3><ul class="ch-titles">${titles}</ul></div>
      <div class="ch-box"><h3>THE THIRTEEN</h3><div class="ch-stars">${stars.map(p=>`<span class="${s.beat['s'+p.id]?'won':''}" title="${p.name}">${Portrait.img(p,'face')}<i>${p.short}</i></span>`).join('')}</div>
      <h3>MILESTONES</h3><ul class="ch-miles">${miles}</ul></div>
      <div class="ch-box"><h3>YOUR MATCHES</h3><p>Played as</p><div class="seg">${fmt}</div><p class="ch-small">Every other match on the tour is played to the real format, decided by the players' Elo ratings.</p>
      <h3>CAREER</h3><button id="chDel">Delete this career</button></div></div>`;
  }
}
