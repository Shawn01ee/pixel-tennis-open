// PauseMenu — the in-match menu: the match stops while it is open. Resume, How to play, the settings, and the ways
// out, which depend on the match: in a career, step out (the match waits, to be taken up again from the event) or
// retire (a loss, the score marked "ret."); in a tournament, retire or leave the tournament; in an exhibition, retire
// or go back to the main menu. Leaving for good and retiring ask first.
class PauseMenu{
  constructor(game){this.g=game;this.ask=null;
    $('resume').onclick=()=>this.close();$('pmHow').onclick=()=>game.howto.open();
    $('pmNo').onclick=()=>this.confirm(null);$('pmYes').onclick=()=>{const f=this.ask;this.confirm(null);if(f)f();};}
  get on(){return!$('pause').hidden;}
  open(){
    const g=this.g,m=g.match,H=m.human,career=g.flow.active,tour=!!g.tour&&!career,over=!!m.result;if(!H)return;
    g.paused=true;$('pause').hidden=false;this.confirm(null);
    const O=m.other(H),sc=m.score;
    $('pmWhere').textContent=`${g.venue.name} · ${H.st.short} v ${O.st.short}${sc?` · ${sc.line(0)||''}${sc.over?'':` ${sc.games[0]}–${sc.games[1]}`}`:''}`.trim();
    const act=(id,label,sub,danger=false)=>`<button id="${id}"${danger?' class="danger"':''}>${label}${sub?`<small>${sub}</small>`:''}</button>`;let h='';
    if(career)h+=act('pmOut','Step out','The match waits: take it up again from the event')+(over?'':act('pmRet','Retire','You lose the match; the score is marked "ret."',true));
    else if(tour)h+=(over?'':act('pmRet','Retire','You lose the match and go out of the tournament',true))+act('pmLeave','Leave the tournament','Back to the main menu; the draw is lost',true);
    else h+=(over?'':act('pmRet','Retire','You lose the match',true))+act('pmMenu','Main menu','Leave this match');
    $('pmActs').innerHTML=h;
    const on=(id,f)=>{const b=$(id);if(b)b.onclick=f;};
    on('pmOut',()=>{this.close();g.flow.suspend();});
    on('pmRet',()=>this.confirm(`Retire from the match against ${O.st.name}? It counts as a loss.`,'Retire',()=>{this.close();g.retire();}));
    on('pmLeave',()=>this.confirm('Leave the tournament? The draw so far is lost.','Leave',()=>{this.close();g.endTour();}));
    on('pmMenu',()=>{this.close();g.openSetup();});
    g.menu.update();$('resume').focus();
  }
  close(){if(!this.on)return;$('pause').hidden=true;this.g.paused=false;this.confirm(null);}
  // a question over the menu; yes runs f
  confirm(q,yes='Yes',f=null){this.ask=f;$('pmConfirm').hidden=!q;if(q){$('pmQ').textContent=q;$('pmYes').textContent=yes;$('pmNo').focus();}}
  get asking(){return!$('pmConfirm').hidden;}
}
