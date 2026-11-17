// CareerCreate — making the career's player: a name, a country, which hand, the backhand, whose game to model his own
// on (one of the thirteen: his serve, shots, movement and choices, at the career's starting level), and a look
class CareerCreate{
  static CC=['ARG','AUS','AUT','BEL','BRA','CAN','CHI','CHN','COL','CRO','CZE','DEN','ESP','FIN','FRA','GBR','GER','GRE','HUN','IND','ITA','JPN','KAZ','KOR','MEX','NED','NOR','POL','POR','RSA','SRB','SUI','SWE','USA'];
  static SKINS=[['Fair',SKIN.fair],['Tan',SKIN.tan],['Olive',SKIN.olive],['Bronze',SKIN.bronze]];
  static BEARD=['none','stubble','moustache','beard'];
  static BAND=[['None',null],['White',WHITE],['Red',0xdc4a3c],['Navy',0x1f2f6a]];
  constructor(flow){
    this.f=flow;this.v={cc:'ARG',hand:1,ohb:0,arch:'Sinner',shirt:0,shorts:0,skin:1,style:0,hair:0,beard:0,band:0};
    const L=(a,f)=>a.map((x,i)=>[i,f(x,i)]);
    this.opts=[
      ['cc','COUNTRY',()=>CareerCreate.CC.map(c=>[c,c])],
      ['hand','PLAYS',()=>[[1,'Right-handed'],[-1,'Left-handed']]],
      ['ohb','BACKHAND',()=>[[0,'Two-handed'],[1,'One-handed']]],
      ['arch','GAME',()=>[...ROSTER].sort((a,b)=>a.rank-b.rank).map(p=>[p.short,`Like ${p.short}`])],
      ['shirt','SHIRT',()=>L(CareerWorld.SHIRT,(c,i)=>`<i class="swatch" style="background:${hexs(c)}"></i>Kit ${i+1}`)],
      ['shorts','SHORTS',()=>[[0,'White'],[1,'Dark']]],
      ['skin','SKIN',()=>L(CareerCreate.SKINS,s=>s[0])],
      ['style','HAIR',()=>L(CareerWorld.STYLES,s=>s[0].toUpperCase()+s.slice(1))],
      ['hair','HAIR COLOUR',()=>L(CareerWorld.HAIR,(c,i)=>`<i class="swatch" style="background:${hexs(c)}"></i>Shade ${i+1}`)],
      ['beard','FACE',()=>L(CareerCreate.BEARD,s=>s==='none'?'Clean-shaven':s[0].toUpperCase()+s.slice(1))],
      ['band','HEADBAND',()=>L(CareerCreate.BAND,b=>b[0])],
    ];
    $('ccOpts').innerHTML=this.opts.map(([k,n],i)=>`<span>${n}</span><div class="s-cyc"><button data-o="${i}" data-d="-1" aria-label="Previous ${n.toLowerCase()}">◀</button><b id="cco-${k}"></b><button data-o="${i}" data-d="1" aria-label="Next ${n.toLowerCase()}">▶</button></div>`).join('');
    $('ccOpts').querySelectorAll('button').forEach(b=>b.onclick=()=>this.cycle(+b.dataset.o,+b.dataset.d));
    $('ccFirst').oninput=$('ccLast').oninput=()=>this.preview();
    $('ccGo').onclick=()=>this.go();$('ccBack').onclick=()=>this.back();
  }
  get on(){return!$('ccreate').hidden;}
  open(){this.render();$('ccreate').hidden=false;}
  close(){$('ccreate').hidden=true;}
  cycle(i,d){const[k,,list]=this.opts[i],L=list(),j=Math.max(0,L.findIndex(q=>q[0]===this.v[k]));this.v[k]=L[(j+d+L.length)%L.length][0];this.f.g.sfx('click');this.render();}
  // what the form says, as the career's record of its player
  me(){
    const v=this.v,clean=s=>s.replace(/[^\p{L}\p{N} .'\-]/gu,'').trim(),first=clean($('ccFirst').value)||'Alex',last=clean($('ccLast').value)||'Rookie';
    return{name:`${first} ${last}`,short:last,cc:v.cc,hand:v.hand,ohb:!!v.ohb,arch:v.arch,
      look:{shirt:CareerWorld.SHIRT[v.shirt],shorts:v.shorts?INK:WHITE,skin:CareerCreate.SKINS[v.skin][1],hair:CareerWorld.HAIR[v.hair],band:CareerCreate.BAND[v.band][1],racket:WHITE},
      face:{hair:CareerWorld.STYLES[v.style],brow:1,shape:'oval',beard:CareerCreate.BEARD[v.beard]}};
  }
  render(){for(const[k,,list]of this.opts){const it=list().find(q=>q[0]===this.v[k]);$('cco-'+k).innerHTML=it?it[1]:'';}this.preview();}
  preview(){
    const me=this.me(),A=ROSTER.find(p=>p.short===me.arch),p=CareerProfile.make(A,Career.START.level,{...me,id:900,rank:999});Portrait.cache.delete(900);
    const r=WorldRanking.rankOf(Career.START.points.reduce((a,b)=>a+b,0));
    $('ccPrev').style.setProperty('--kit',hexs(me.look.shirt));
    $('ccPrev').innerHTML=`${Portrait.img(p,'face')}<small>YOUR PLAYER</small><h2>${me.name.toUpperCase()}</h2>
      <p><b>${me.cc}</b> · ${me.hand<0?'Left':'Right'}-handed · ${me.ohb?'one':'two'}-handed backhand</p>
      <p class="cc-game">${CareerWorld.ARCH[A.short]}: plays like ${A.name}, at the level of a player ranked about ${EloModel.rankAt(Career.START.level)}</p>
      <p>Starts ranked <b>${r}</b> with ${Career.START.points.reduce((a,b)=>a+b,0)} points from last season</p>`;
  }
  go(){this.f.g.sfx('chime');this.close();this.f.start(this.me());}
  back(){this.f.g.sfx('click');this.close();this.f.g.mainMenu.open();}
}
