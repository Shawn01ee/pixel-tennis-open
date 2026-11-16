// SetupScreen — choosing players (yours, and in an exhibition the opponent) with the match settings beneath
// A large card for the highlighted player beside the field as a grid of portraits. Arrow keys move through the
// grid, Enter goes on, Esc goes back; the settings step with ◀ ▶.
class SetupScreen{
  static SESSION={day:'Midday sun, sharp shadows.',twilight:'Low sun, long shadows, the lights coming on.',night:'Under the floodlights.'};
  constructor(game){
    this.g=game;this.a=2;this.b=1;this.fmt='one';this.level='pro';this.mode='tour';this.step=0;this.phase=game.R.phaseKey;
    $('sBack').onclick=()=>this.back();$('walkOut').onclick=()=>this.go();
    this.opts=[{k:'fmt',name:'FORMAT',list:()=>MatchFormat.MENU.map(f=>[f.key,f.name,f.desc])},
      {k:'phase',name:'SESSION',list:()=>Object.keys(PHASES).map(k=>[k,PHASES[k].name,SetupScreen.SESSION[k]||''])},
      {k:'level',name:'OPPONENTS',list:()=>Difficulty.ALL.map(d=>[d.key,d.name,d.desc])}];
    $('sOpts').innerHTML=this.opts.map((o,i)=>`<div class="s-opt"><span>${o.name}</span><div class="s-cyc"><button data-o="${i}" data-d="-1" aria-label="Previous ${o.name.toLowerCase()}">◀</button><b id="so-${o.k}"></b><button data-o="${i}" data-d="1" aria-label="Next ${o.name.toLowerCase()}">▶</button></div><small id="sd-${o.k}"></small></div>`).join('');
    $('sOpts').querySelectorAll('button').forEach(b=>b.onclick=()=>this.cycle(+b.dataset.o,+b.dataset.d));
  }
  get on(){return!$('setup').hidden;}
  get sel(){return this.step===1?this.b:this.a;}
  set sel(i){if(this.step===1)this.b=i;else this.a=i;}
  open(mode=this.mode){this.mode=mode;this.step=0;this.phase=this.g.R.phaseKey;this.render();$('setup').hidden=false;}
  close(){$('setup').hidden=true;}
  cycle(i,d){const o=this.opts[i],L=o.list(),j=Math.max(0,L.findIndex(q=>q[0]===this[o.k])),n=L[(j+d+L.length)%L.length][0];
    this[o.k]=n;if(o.k==='phase')this.g.setPhase(n);this.g.sfx('click');this.render();}
  pick(i){if(this.step===1&&i===this.a)return;if(this.sel!==i){this.sel=i;this.g.sfx('click');this.render();}}
  // arrow keys through the grid; when choosing an opponent your own player is stepped over
  move(dx,dy){
    const n=ROSTER.length,cols=getComputedStyle($('sGrid')).gridTemplateColumns.split(' ').length||5;let i=this.sel;
    for(let k=0;k<n;k++){i=dy?i+dy*cols:i+dx;if(i<0)i=dy?i+Math.ceil(n/cols)*cols:n-1;if(i>=n)i=dy?i%cols:0;if(i<n&&!(this.step===1&&i===this.a))break;}
    if(i<n)this.pick(i);
  }
  go(){
    this.g.sfx('chime');
    if(this.mode==='tour'){this.close();this.g.startTour(this.a,this.fmt,this.phase,this.level);return;}
    if(this.step===0){this.step=1;if(this.b===this.a)this.b=(this.a+1)%ROSTER.length;this.render();return;}
    this.close();this.g.exhibition(this.a,this.b,this.fmt,this.phase,this.level);
  }
  back(){this.g.sfx('click');if(this.step===1){this.step=0;this.render();return;}this.close();this.g.mainMenu.open();}
  render(){
    const p=ROSTER[this.sel],r=p.ratings,mine=this.step===0;
    $('sTitle').textContent=mine?'SELECT YOUR PLAYER':'SELECT YOUR OPPONENT';$('sMode').textContent=this.mode==='tour'?'TOURNAMENT':'EXHIBITION';
    const bar=(n,v)=>`<span>${n}</span><i><u style="width:${v}%"></u></i><em>${v}</em>`;
    const hero=$('sHero');hero.style.setProperty('--kit',hexs(p.look.shirt));
    hero.innerHTML=`<div class="h-top"><div class="h-pic">${Portrait.img(p,'face h-face')}<span class="h-rank">${p.legend?'LEGEND':'RANK '+p.rank}</span></div>
      <div class="h-id"><small>${mine?'YOU':'OPPONENT'}</small><h2>${p.name.toUpperCase()}</h2>
        <div class="h-meta"><b>${p.cc}</b> · ${p.hand<0?'Left':'Right'}-handed · ${p.ohb?'one':'two'}-handed backhand${p.fiveSets?` · five-set record ${p.fiveSets}`:''}</div>
        <p class="h-style">${p.style}</p><div class="h-ovr"><b>${p.overall}</b><span>OVERALL</span></div></div></div>
      <div class="h-bars">${bar('Serve',r.serve)}${bar('Power',r.power)}${bar('Speed',r.speed)}${bar('Spin',r.spin)}${bar('Control',r.control)}${bar('Accuracy',r.accuracy)}${bar('Touch',r.touch)}${bar('Stamina',r.stamina)}</div>`;
    $('sGrid').innerHTML=ROSTER.map(q=>{const dis=!mine&&q.id===this.a;
      return`<button class="s-card${q.legend?' lg':''}${q.id===this.sel?' on':''}" data-i="${q.id}" aria-pressed="${q.id===this.sel}" ${dis?'disabled':''} title="${q.name}">${Portrait.img(q,'face')}<span class="c-name">${q.short}</span><span class="c-rk">${q.legend?'LEGEND':'#'+q.rank}</span>${dis?'<span class="c-you">YOU</span>':''}</button>`;}).join('');
    $('sGrid').querySelectorAll('.s-card').forEach(b=>b.onclick=()=>this.pick(+b.dataset.i));
    for(const o of this.opts){const it=o.list().find(q=>q[0]===this[o.k]);$('so-'+o.k).textContent=it?it[1]:'';$('sd-'+o.k).textContent=it?it[2]:'';}
    $('walkOut').innerHTML=(this.mode==='tour'?'ENTER THE DRAW':mine?'CHOOSE OPPONENT':'WALK OUT')+' ▶<kbd>Enter</kbd>';
  }
}
