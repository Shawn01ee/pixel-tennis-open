// Input — keyboard, mouse and touch
class Input{
  constructor(game){
    const g=game,cv=g.R.canvas;let down=null,pinch=0;const touches=new Map();
    // physical key codes, so the shortcuts survive a Korean or any other keyboard layout
    addEventListener('keydown',e=>{
      if(e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;const c=e.code;
      if(!$('setup').hidden){if(c==='Enter'){$('walkOut').click();e.preventDefault();}return;}
      if(!$('result').hidden)return;
      const m=g.match,serving=g.dock.serving(m);
      const shot=SHOT_KEYS.find(s=>s[3]===c),srv=SERVE_KEYS.find(s=>s[3]===c),zn=ZONE_KEYS.find(s=>s[2]===c||'Numpad'+s[3]===c);
      if(c==='Space')g.toggleAuto();
      else if(c==='KeyX')g.toggleFast();
      else if(c==='KeyP'||c==='Escape')g.togglePause();
      else if(c==='KeyM')g.toggleSound();
      else if(c==='KeyV')g.setCam((g.cam.mode+1)%CameraRig.MODES.length);
      else if(c==='KeyQ')g.cam.turn(-1);else if(c==='KeyE')g.cam.turn(1);
      else if(serving&&srv)g.serve(srv[0]);
      else if(serving&&zn)g.zone(zn[0]);
      else if(!serving&&shot)g.shot(shot[0]);
      else return;
      e.preventDefault();
    });
    cv.addEventListener('wheel',e=>{e.preventDefault();g.cam.mul=clamp(g.cam.mul*Math.exp(-e.deltaY*.0011),.7,3);},{passive:false});
    cv.addEventListener('pointerdown',e=>{try{window.focus();}catch(_){}touches.set(e.pointerId,[e.clientX,e.clientY]);down={x:e.clientX,y:e.clientY};});
    cv.addEventListener('pointermove',e=>{if(!touches.has(e.pointerId))return;touches.set(e.pointerId,[e.clientX,e.clientY]);
      if(touches.size===2){const[a,b]=[...touches.values()],d=hyp(a[0]-b[0],a[1]-b[1]);if(pinch){g.cam.mul=clamp(g.cam.mul*d/pinch,.7,3);down=null;}pinch=d;}});
    for(const n of['pointerup','pointercancel'])cv.addEventListener(n,e=>{touches.delete(e.pointerId);pinch=0;});
    cv.addEventListener('pointerup',e=>{if(!down)return;const dx=e.clientX-down.x,dy=e.clientY-down.y;down=null;
      if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5){g.cam.turn(dx>0?-1:1);return;}
      if(hyp(dx,dy)>12)return;g.click(e.clientX,e.clientY);});
  }
}
