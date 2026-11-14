// WorldLabels — umpire speech, player tags and line calls placed over the 3D scene
// speech from the chair, tags over the players, electronic line calls at the bounce
class WorldLabels{
  constructor(){this.tags=[{el:$('tag0'),until:0,who:0},{el:$('tag1'),until:0,who:0}];this.ti=0;this.callUntil=0;this.callAt=null;}
  tag(e,m){const q=this.tags[this.ti=(this.ti+1)%2];q.el.textContent=e.text;q.el.className='tagf'+(e.strong?' strong':'')+(m.control.idx===e.who?' me':'');q.until=m.t+(e.strong?1.7:1.05);q.who=e.who;q.el.hidden=false;}
  call(e,m){const el=$('call');el.textContent=e.text;el.className='call'+(e.text==='LET'?' let':'');el.hidden=false;this.callUntil=m.t+1.1;this.callAt=e;}
  place(el,R,x,y,z,mx=60,dy='-100%'){const[sx,sy]=R.project(x,y,z);el.style.transform=`translate(${clamp(sx,mx,innerWidth-mx)}px,${clamp(sy,70,innerHeight-120)}px) translate(-50%,${dy})`;}
  update(m,R){
    for(const q of this.tags){if(m.t>q.until){q.el.hidden=true;continue;}const P=m.players[q.who];this.place(q.el,R,P.x,2.35,P.z,50);}
    const c=m.cue,el=$('tagS');
    if(c&&c.tag){for(const q of this.tags)q.until=0;const P=m.players[c.who],t=`${m.control.is(P)?'Your':P.short+':'} ${c.no===1?'1st':'2nd'} serve · from the ${c.court==='deuce'?'right':'left'}`;
      if(el.textContent!==t)el.textContent=t;el.classList.toggle('second',c.no===2);el.hidden=false;this.place(el,R,P.x,2.5,P.z,90);}
    else el.hidden=true;
    const b=m.bubble,bu=$('bub');
    if(b&&m.t<b.until){bu.hidden=false;if(bu.textContent!==b.text)bu.textContent=b.text;this.place(bu,R,m.ump.x,m.ump.y+1.5,m.ump.z,100,'-115%');}else bu.hidden=true;
    const ce=$('call');if(m.t>this.callUntil)ce.hidden=true;else if(this.callAt)this.place(ce,R,this.callAt.x,.6,this.callAt.z,60);
  }
}
