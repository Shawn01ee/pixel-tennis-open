// ResultScreen — the end-of-match card
class ResultScreen{
  constructor(game){this.g=game;$('resAgain').onclick=()=>game.rematch();$('resNew').onclick=()=>game.openSetup();$('resView').onclick=()=>this.close();}
  open(m,rows){
    const r=m.result,H=m.human,won=H&&r.winner===H;
    $('resH').textContent=H?(won?'YOU WIN · GAME, SET AND MATCH':'GAME, SET AND MATCH'):'GAME, SET AND MATCH';
    $('resW').textContent=`${r.winner.st.name} d. ${r.loser.st.name}`;
    $('resF').innerHTML=`<div class="win">${Portrait.img(r.winner.st,'face big')}<span>WINNER</span></div><div class="lose">${Portrait.img(r.loser.st,'face big')}</div>`;$('resL').textContent=r.line+(r.longest>=8?`  ·  longest rally ${r.longest}`:'');
    const[a,b]=m.players;$('resT').innerHTML=`<tr><th>${a.st.name}</th><th></th><th>${b.st.name}</th></tr>`+rows.map(q=>`<tr><td>${q[0]}</td><td>${q[1]}</td><td>${q[2]}</td></tr>`).join('');
    $('result').hidden=false;
  }
  close(){$('result').hidden=true;}
}
