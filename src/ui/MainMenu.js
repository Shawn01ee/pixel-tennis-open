// MainMenu — tournament, exhibition, how to play; a preview of the highlighted choice beside the list
class MainMenu{
  static ITEMS=[['career','CAREER','Your own player, from outside the top 300 to the top of the real ranking.'],
    ['tour','TOURNAMENT','Eight players, three rounds at one of the four majors. Win three matches and lift the cup.'],
    ['exh','EXHIBITION','One match, against anyone in the field.'],['how','HOW TO PLAY','Shots, aiming, serving and challenges.']];
  constructor(game){
    this.g=game;this.i=0;
    $('mList').innerHTML=MainMenu.ITEMS.map(([,t,d],i)=>`<button data-i="${i}"><i aria-hidden="true">▶</i><b>${t}</b><small>${d}</small></button>`).join('');
    $('mList').querySelectorAll('button').forEach(b=>{b.onmouseenter=()=>this.hi(+b.dataset.i);b.onclick=()=>{this.hi(+b.dataset.i);this.choose();};});
  }
  get on(){return!$('menu').hidden;}
  open(){this.render();$('menu').hidden=false;}
  close(){$('menu').hidden=true;}
  hi(i){if(i===this.i)return;this.i=i;this.g.sfx('click');this.render();}
  move(d){this.hi((this.i+d+MainMenu.ITEMS.length)%MainMenu.ITEMS.length);}
  choose(){const k=MainMenu.ITEMS[this.i][0];this.g.sfx('chime');if(k==='how'){this.g.howto.open();return;}this.close();if(k==='career'){this.g.flow.open();return;}this.g.setup.open(k);}
  back(){this.g.sfx('click');this.close();this.g.title.open();}
  render(){
    $('mList').querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-current',String(i===this.i)));
    const k=MainMenu.ITEMS[this.i][0],legends=ROSTER.filter(p=>p.legend).length,side=$('mSide');
    if(k==='career'){const c=Career.load();side.innerHTML=`<div class="ms-cup">${Trophy.img('trophy ms-trophy')}</div><h3>${c?'YOUR CAREER':'A CAREER ON TOUR'}</h3>
      <ul>${c?`<li><b>${c.s.me.name}</b></li><li>Ranked <b>${WorldRanking.label(c.rank)}</b> · ${c.points} points · ${c.s.titles.length} titles</li><li>${c.year}, week ${c.week}</li>`:
      `<li>Make your player and model his game on one of the thirteen</li><li>Challengers, ATP 250s and 500s, Masters 1000s and the four majors, on hard, clay and grass</li><li>Real ranking points, against the real ATP ranking</li><li>Get better with every match; beat all thirteen</li>`}</ul>`;}
    else if(k==='tour')side.innerHTML=`<div class="ms-cup">${Trophy.img('trophy ms-trophy')}</div><h3>THE FOUR MAJORS</h3>
      <ul>${Venue.MAJORS.map(v=>`<li><b>${v.month}</b> ${v.name}: ${SURFACES[v.surface].name.toLowerCase()}${v.white?', players in white':''}${v.phase==='night'?', under the lights':''}</li>`).join('')}<li><b>8</b> players, seeded; an interview after every match, a ceremony for the champion</li></ul>`;
    else if(k==='exh'){const pick=[...ROSTER].sort((a,b)=>a.rank-b.rank).slice(0,6);
      side.innerHTML=`<div class="ms-faces">${pick.map(p=>Portrait.img(p,'face ms-face')).join('')}</div><h3>ANY TWO PLAYERS</h3>
      <ul><li><b>${ROSTER.length}</b> players: today's best and the legends</li><li>Short set, full set or best of three</li><li>Day, twilight or night session</li><li>Opponent level: rookie, pro or legend</li></ul>`;}
    else side.innerHTML=`<h3>HOW TO PLAY</h3><dl class="ms-keys">${HowToPlay.html()}</dl>`;
  }
}
