// VersusScreen — the two players face off before a match: portraits slide in from either side, VS slams down
// Goes on by itself after three seconds, or at once with Enter or a tap.
class VersusScreen{
  constructor(game){this.g=game;this.done=null;$('vs').onclick=()=>this.go();}
  get on(){return!$('vs').hidden;}
  open(a,b,round,sub,done){
    const side=(p,cls,who)=>`<div class="vs-side ${cls}" style="--kit:${hexs(p.look.shirt)}"><div class="vs-band"></div>
      <div class="vs-pic">${Portrait.img(p,'face vs-face')}</div><small>${who}</small><h2>${p.name.toUpperCase()}</h2>
      <div class="vs-meta"><b>${p.cc}</b> · ${p.legend?'LEGEND':'RANK '+p.rank} · <em>${p.overall}</em> OVR</div><p>${p.style}</p></div>`;
    $('vsBody').innerHTML=side(a,'l','YOU')+`<div class="vs-mid"><div class="vs-round">${round}</div><div class="vs-x">VS</div><div class="vs-sub">${sub}</div></div>`+side(b,'r','OPPONENT');
    $('vs').hidden=false;this.done=done;clearTimeout(this.tm);clearTimeout(this.tm2);
    this.tm2=setTimeout(()=>this.g.sfx('slam'),520);this.tm=setTimeout(()=>this.go(),3200);
  }
  go(){if(!this.done)return;const d=this.done;this.done=null;clearTimeout(this.tm);clearTimeout(this.tm2);$('vs').hidden=true;d();}
}
