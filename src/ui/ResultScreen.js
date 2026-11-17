// ResultScreen — the end-of-match card, and the bar that stays once the card is put away to look at the court
class ResultScreen{
  constructor(game){this.g=game;const next=()=>game.flow.active?game.flow.afterMatch():game.tour?game.continueTour():game.rematch();
    $('resAgain').onclick=next;$('resNew').onclick=()=>game.openSetup();$('resView').onclick=()=>this.watch();
    $('aftGo').onclick=next;$('aftNew').onclick=()=>game.openSetup();$('aftRes').onclick=()=>{if(this.last)this.open(...this.last);};}
  open(m,rows){
    this.last=[m,rows];$('after').hidden=true;
    const r=m.result,H=m.human,won=H&&r.winner===H;
    $('resH').textContent=H?(won?'YOU WIN · GAME, SET AND MATCH':'GAME, SET AND MATCH'):'GAME, SET AND MATCH';
    $('resW').textContent=`${r.winner.st.name} d. ${r.loser.st.name}`;
    $('resF').innerHTML=`<div class="win">${Portrait.img(r.winner.st,'face big')}<span>WINNER</span></div><div class="lose">${Portrait.img(r.loser.st,'face big')}</div>`;$('resL').textContent=r.line+(r.longest>=8?`  ·  longest rally ${r.longest}`:'');
    const[a,b]=m.players;$('resT').innerHTML=`<tr><th>${a.st.name}</th><th></th><th>${b.st.name}</th></tr>`+rows.map(q=>`<tr><td>${q[0]}</td><td>${q[1]}</td><td>${q[2]}</td></tr>`).join('');
    // in a tournament the only way on is through the draw
    const tour=!!this.g.tour||this.g.flow.active;$('resNew').hidden=tour;$('resAgain').textContent=tour?'Continue ▶':'Rematch';
    $('result').hidden=false;
  }
  // the card goes, the way on stays: a bar at the foot of the screen with the same choices (Enter = the main one)
  watch(){
    $('result').hidden=true;if(!this.last)return;const[m]=this.last,tour=!!this.g.tour||this.g.flow.active,H=m.human,won=H&&m.result.winner===H;
    $('aftW').textContent=`${won?'You win':m.result.winner.st.short+' wins'} ${m.result.line}`;
    $('aftNew').hidden=tour;$('aftGo').innerHTML=(tour?'Continue ▶':'Rematch ▶')+'<kbd>Enter</kbd>';$('after').hidden=false;
  }
  get watching(){return!$('after').hidden;}
  close(){$('result').hidden=true;$('after').hidden=true;this.last=null;}
}
