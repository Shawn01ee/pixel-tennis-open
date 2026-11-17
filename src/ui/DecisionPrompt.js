// DecisionPrompt — the prompt and timer while the game waits for the person
// what the game is waiting for from the person, and how long is left; worded for the keys on a computer and for the
// buttons on a touch screen
class DecisionPrompt{
  constructor(){this.key='';}
  update(m){
    const C=m.control,el=$('prompt'),H=m.human,touch=Prefs.touch;let show=false,title='',sub='',frac=1,serve=false,chal=false;
    if(H&&C.serveWait&&!C.auto){show=true;serve=true;title=C.serveWait.no===1?'YOUR SERVE':'SECOND SERVE';
      const tp=C.serveType?SERVES[C.serveType].name:'Type: auto';
      sub=C.holding&&SERVES[C.holding]?`${SERVES[C.holding].name} · slide into the box, let go to serve`:touch?`${tp} · tap Wide, Body or T, or slide a serve into the box`:`${tp} · press 1 Wide · 2 Body · 3 T, or click the box`;frac=1-(m.t-C.serveWait.t0)/15;}
    else if(H&&C.challenge){show=true;serve=true;chal=true;const q=C.challenge;title='CHALLENGE?';
      sub=`Called ${q.out?'OUT':'IN'} · ${touch?'tap here':'press C or click here'} · ${q.left} left`;frac=clamp((q.until-m.t)/(q.until-q.t0),0,1);}
    else if(H&&C.decide&&!C.auto){show=true;const d=C.decide;title=`YOUR SHOT · ${(WING[d.kind==='ground'?d.wing:d.kind]||'').toUpperCase()}`;
      const sh=C.shot?SHOT_KEYS.find(s=>s[0]===C.shot)[1]:null;
      const held=C.holding?(SHOT_KEYS.find(s=>s[0]===C.holding)||[])[1]:null;
      if(held)sub=`${held} · ${C.target?'aimed · ':'slide to aim · '}let go in the green`;
      else if(touch)sub=sh?`${sh}${C.target?' · aimed':''}`:C.target?'Aimed · tap a shot in the green':'Hold a shot, slide to aim, let go in the green';
      else sub=C.target?(sh?`${sh} · aimed`:'Aimed · press the shot key in the green'):sh?`${sh} · now click the far court`:'Pick a shot (A S D F G), then click the far court';
      frac=clamp((d.tc-m.t)/Math.max(.2,d.tc-d.t0),0,1);}
    el.hidden=!show;$('slowfx').hidden=!(show&&!serve&&!C.target);
    if(!show)return;
    el.classList.toggle('serve',serve);el.classList.toggle('chal',chal);
    const k=title+sub;if(k!==this.key){this.key=k;$('promptT').textContent=title;$('promptS').textContent=sub;}
    $('promptBar').style.transform=`scaleX(${frac.toFixed(3)})`;
    // the timing zones: the bar's end is the time left before contact; play the shot while it is in the bright zone
    // for Perfect, the pale one for Good
    const z=$('promptZone'),g=$('promptGood'),timing=show&&!serve&&!C.shot;z.hidden=g.hidden=!timing;
    if(timing){const d=C.decide,T=Math.max(.2,d.tc-d.t0),pc=v=>(clamp(v/T,0,1)*100).toFixed(1)+'%';
      z.style.left=pc(.05);z.style.width=pc(.3);g.style.left=pc(.35);g.style.width=pc(Math.min(.35,Math.max(0,T-.35)));}
  }
}
