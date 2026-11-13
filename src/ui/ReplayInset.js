// ReplayInset — the ball-tracking inset for close calls
// the ball-tracking inset: true scale, 0.56 m across, the line on the left and the court to its right
class ReplayInset{
  constructor(){this.until=0;}
  show(e,t){
    const cv=$('elcC'),g=cv.getContext('2d'),w=cv.width,h=cv.height,sc=w/.56;
    g.fillStyle='#25468a';g.fillRect(0,0,w*.5,h);g.fillStyle='#3166b4';g.fillRect(w*.5,0,w*.5,h);
    for(let i=0;i<260;i++){g.fillStyle=['#1a2c5c','#4a8ed4'][i%2];g.fillRect(R()*w|0,R()*h|0,1,1);}
    const lx=w*.5;g.fillStyle='#f4f3ec';g.fillRect(lx,0,.05*sc,h);
    const mx=lx+(e.m-BALL.R*.6)*sc,hw=BALL.R*.62*sc;
    g.fillStyle='#f4d44a';g.beginPath();g.ellipse(mx,h/2,hw,hw*2.4,.1,0,TAU);g.fill();
    g.fillStyle='#dcae2c';g.beginPath();g.ellipse(mx,h/2,hw*.55,hw*1.6,.1,0,TAU);g.fill();
    const mm=Math.max(1,Math.round(Math.abs(e.m)*1000));
    $('elcV').textContent=e.m>=0?(e.m<.012?'IN · touches the line':`IN · ${mm} mm inside`):`OUT · ${mm} mm`;$('elcV').className=e.m>=0?'good':'bad';
    $('elc').hidden=false;this.until=t+2.8;
  }
  update(t){if(t>this.until)$('elc').hidden=true;}
}
