// TouchShot — the shot and serve buttons as one gesture: press a shot, slide to aim, let go to hit
// For a thumb on a phone, but a mouse works the same way. Pressing a shot button and sliding moves the target across
// the far court — further than the thumb moves, so the thumb can stay down by the buttons — and letting go plays the
// shot: the moment of letting go is the shot's timing, exactly as pressing its key is. Sliding sets the target, so,
// as with a click on the court, it ends the slow motion: aiming is paid for in time. A tap without sliding plays the
// shot to where the player was going anyway. The serve buttons slide into the service box instead, and letting go
// serves; a tap only picks the serve.
class TouchShot{
  static SLOP=9;        // px a press may wander and still be a tap
  static REACH=110;     // px of thumb travel that take the target across the full width of the far court
  constructor(game){
    this.g=game;this.d=null;this.tapUntil=0;
    for(const[k]of SHOT_KEYS)this.bind($('sh-'+k),'shot',k);
    for(const[k]of SERVE_KEYS)this.bind($('sv-'+k),'serve',k);
  }
  // a click that a press-and-release has already handled is not handled twice
  get handled(){return performance.now()<this.tapUntil;}
  bind(el,kind,k){
    el.addEventListener('pointerdown',e=>{
      if(e.button>0||this.d)return;const m=this.g.match;if(!m.human)return;
      try{el.setPointerCapture(e.pointerId);}catch(_){}
      this.d={el,kind,k,id:e.pointerId,x0:e.clientX,y0:e.clientY,moved:false,anchor:null,gain:1};el.classList.add('held');m.control.holding=k;
    });
    el.addEventListener('pointermove',e=>{const d=this.d;if(!d||d.id!==e.pointerId)return;
      const dx=e.clientX-d.x0,dy=e.clientY-d.y0;if(!d.moved&&hyp(dx,dy)<TouchShot.SLOP)return;
      if(!d.moved&&!this.start(d))return;d.moved=true;this.aim(d,d.anchor[0]+dx*d.gain,d.anchor[1]+dy*d.gain);});
    const end=(e,cancel)=>{const d=this.d;if(!d||d.id!==e.pointerId)return;this.d=null;d.el.classList.remove('held');this.tapUntil=performance.now()+500;
      const g=this.g,m=g.match,C=m.control;C.holding=null;if(cancel||!m.human){C.preview=null;return;}
      if(d.kind==='shot')g.shot(d.k,true);
      else{g.serve(d.k,true);if(d.moved&&C.preview){const p=C.preview;C.preview=null;g.aim(p.x,p.z);}}};
    el.addEventListener('pointerup',e=>end(e,false));el.addEventListener('pointercancel',e=>end(e,true));
  }
  // the first slide: where on screen the target starts (the one already chosen, or the one the player had in
  // mind), and how far the target moves for a pixel of thumb
  start(d){
    const m=this.g.match,H=m.human,C=m.control,R=this.g.R;if(!H)return false;
    let s;
    if(d.kind==='serve'){const c=m.cue;if(!c||c.who!==H.idx||m.live)return false;const b=c.box;s=C.target||{x:(b.x0+b.x1)/2,z:(b.z0+b.z1)/2};}
    else{const S=H.plan&&H.plan.shot;s=C.target||(S?{x:S.t.x,z:-H.s*S.t.d}:{x:0,z:-H.s*(CT.L-3)});}
    d.anchor=R.project(s.x,0,s.z);
    const u=-H.s*(CT.L-3),a=R.project(-CT.SW,0,u),b=R.project(CT.SW,0,u);
    d.gain=clamp(hyp(a[0]-b[0],a[1]-b[1])/TouchShot.REACH,1,3.2);
    return true;
  }
  // the target under the moved point, held inside the far court (a rally ball) or the service box (a serve)
  aim(d,sx,sy){
    const g=this.g,m=g.match,H=m.human,C=m.control;if(!H)return;
    const p=g.R.pick(sx,sy);
    if(d.kind==='serve'){const c=m.cue;if(!c)return;const b=c.box,i=.15;
      C.preview={x:clamp(p.x,b.x0+i,b.x1-i),z:clamp(p.z,b.z0+i,b.z1-i)};return;}
    if(m.stage!=='play')return;
    const u=clamp(-H.s*p.z,1.0,CT.L-.15),x=clamp(p.x,-CT.SW+.15,CT.SW-.15);
    g.aim(x,-H.s*u,false);
  }
}
