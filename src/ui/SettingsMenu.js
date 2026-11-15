// SettingsMenu — camera, session, sound and pause
class SettingsMenu{
  constructor(game){
    this.g=game;
    $('camRow').innerHTML=CameraRig.MODES.map((n,i)=>`<button id="cam-${i}" aria-pressed="false">${n}${i===0?'<kbd>V</kbd>':''}</button>`).join('');
    $('phaseRow').innerHTML=Object.keys(PHASES).map(k=>`<button id="ph-${k}" aria-pressed="false">${PHASES[k].name}</button>`).join('');
    CameraRig.MODES.forEach((n,i)=>$('cam-'+i).onclick=()=>game.setCam(i));
    for(const k in PHASES)$('ph-'+k).onclick=()=>game.setPhase(k);
    $('tl').onclick=()=>game.cam.turn(-1);$('tr').onclick=()=>game.cam.turn(1);
    $('snd').onclick=()=>game.toggleSound();$('pauseB').onclick=()=>game.togglePause();$('newB').onclick=()=>game.openSetup();
    // what the computer players learned from this person's matches: save it as a file, or forget it
    $('expB').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([Tactics.exportFile()],{type:'application/json'}));a.download='pixel-tennis-open-learning.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);};
    $('fgtB').onclick=()=>{Tactics.forget();Tactics.points=0;if(game.match)game.match.tactics.q=Tactics.load();this.update();game.say('Learning from your matches was reset.');};
    const pop=(b,p,other)=>{$(b).onclick=()=>{const open=$(p).hidden;$(p).hidden=!open;$(b).setAttribute('aria-expanded',String(open));$(other[1]).hidden=true;$(other[0]).setAttribute('aria-expanded','false');};};
    pop('statsT','statsP',['menuT','menuP']);pop('menuT','menuP',['statsT','statsP']);
  }
  update(){
    const on=(id,v)=>{const e=$(id);if(e)e.setAttribute('aria-pressed',String(v));};
    CameraRig.MODES.forEach((n,i)=>on('cam-'+i,this.g.cam.mode===i));for(const k in PHASES)on('ph-'+k,this.g.R.phaseKey===k);
    on('snd',this.g.sound.on);
    const t=`${Tactics.points} points learned from in this browser`;if($('lrnN').textContent!==t)$('lrnN').textContent=t;
  }
}
