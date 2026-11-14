// The ball must behave like a real tennis ball: checked against published figures, not against our own code.
// Run: node tests/physics-realism.test.js
const{loadSim}=require('./load');
const{Ball,BallPhysics,SURFACES,HIT,DT,BALL}=loadSim(['Ball','BallPhysics','SURFACES','HIT','DT','BALL']);
let fails=0;const check=(ok,msg)=>{console.log(`${ok?'PASS':'FAIL'}  ${msg}`);if(!ok)fails++;};
const hard=new BallPhysics(SURFACES.hard);
// fly a ball until its first bounce; report the state just before and just after
function shot(ph,v,elDeg,rpm,h=1,z0=-11.885){
  const b=new Ball(0,h,z0);b.launch(v,elDeg*Math.PI/180,0,rpm,0);let t=0,pre=null;
  const I=.55*BALL.M*BALL.R*BALL.R,E=()=>.5*BALL.M*b.speed**2+.5*I*(b.wx*b.wx+b.wy*b.wy+b.wz*b.wz)+BALL.M*9.81*b.y;
  for(let i=0;i<120*8;i++){const p={vy:b.vy,vh:Math.hypot(b.vx,b.vz),v:b.speed,E:E()};const ev=ph.step(b,DT,false);t+=DT;if(ev&HIT.BOUNCE){pre=p;break;}}
  return{t,dist:b.z-z0,pre,post:{vy:b.vy,vh:Math.hypot(b.vx,b.vz),v:b.speed,E:E()}};
}
// 1. ITF rule: dropped from 254 cm onto concrete, a ball rebounds 135–147 cm; an acrylic court over a cushion
//    gives a little less, so 125–147 cm is accepted here
{const b=new Ball(0,2.54+BALL.R,0);let top=0,hit=false;for(let i=0;i<120*4;i++){const ev=hard.step(b,DT,false);if(ev&HIT.BOUNCE)hit=true;else if(hit){top=Math.max(top,b.y-BALL.R);if(b.vy<0)break;}}
 check(top>1.25&&top<1.47,`drop test: 254 cm drop rebounds ${(top*100).toFixed(0)} cm (ITF on concrete: 135–147 cm; cushioned hard court: from 125)`);}
// 2. terminal velocity: m 57 g, r 3.3 cm, drag coefficient 0.5–0.6 in air gives 21–23 m/s
{const b=new Ball(0,5000,0);for(let i=0;i<120*30;i++)hard.stepOnce(b,DT,false);
 check(-b.vy>20.5&&-b.vy<23.5,`terminal velocity ${(-b.vy).toFixed(1)} m/s (expected 21–23 m/s)`);}
// 3. a 200 km/h flat serve loses roughly a quarter of its speed in the air and about another quarter at the bounce
{const s=shot(hard,200/3.6,-6.5,300,2.85);
 const pre=s.pre.v*3.6,post=s.post.v*3.6;
 check(pre>135&&pre<165,`200 km/h serve reaches the court at ${pre.toFixed(0)} km/h after ${s.dist.toFixed(1)} m (expected 135–165)`);
 check(post>100&&post<135,`…and leaves it at ${post.toFixed(0)} km/h (expected 100–135)`);}
// 4. spin in the air: topspin dips and lands shorter, backspin floats and lands longer, for the same launch;
//    the dipping ball comes down steeper, so it bounces up higher than the flat one
{const top=shot(hard,30,8,3000),flat=shot(hard,30,8,0),back=shot(hard,30,8,-2500);
 check(top.dist<flat.dist-1&&back.dist>flat.dist+1,`same launch at 108 km/h: topspin lands at ${top.dist.toFixed(1)} m, no spin ${flat.dist.toFixed(1)} m, backspin ${back.dist.toFixed(1)} m`);
 check(top.post.vy>flat.post.vy,`the topspin ball rises faster off the court (${top.post.vy.toFixed(1)} m/s) than the flat one (${flat.post.vy.toFixed(1)} m/s)`);}
// 4b. spin at the bounce: the same steep impact with topspin shoots through, with backspin it checks up
//     (at a shallow, skidding impact a slice and a flat ball lose the same speed: both slide the whole contact)
{const hit=rpm=>{const b=new Ball(0,BALL.R+.02,0);b.launch(22,-30*Math.PI/180,0,rpm,0);let n=0;while(!(hard.step(b,DT,false)&HIT.BOUNCE)&&n++<200);return Math.hypot(b.vx,b.vz)*3.6;};
 const t=hit(3000),f=hit(0),k=hit(-2500);
 check(t>f&&f>k,`same 30° impact at 79 km/h: topspin leaves at ${t.toFixed(0)} km/h, flat ${f.toFixed(0)}, slice ${k.toFixed(0)}`);}
// 5. surfaces: clay takes more pace off the ball and bounces it higher than grass
{const c=shot(new BallPhysics(SURFACES.clay),30,5,1500),g=shot(new BallPhysics(SURFACES.grass),30,5,1500);
 check(c.post.vh<g.post.vh&&c.post.vy>g.post.vy,`same shot: clay ${(c.post.vh*3.6).toFixed(0)} km/h rising ${c.post.vy.toFixed(1)} m/s, grass ${(g.post.vh*3.6).toFixed(0)} km/h rising ${g.post.vy.toFixed(1)} m/s`);}
// 6. a bounce never creates energy (motion + spin together; spin may turn into speed, but the total cannot grow)
{let worst=0,at='';for(const v of[10,20,30,45,60])for(const el of[-12,-5,3,12,30])for(const rpm of[-3000,0,3000,5000]){const s=shot(hard,v,el,rpm,1.2);if(s.pre){const r=s.post.E/s.pre.E;if(r>worst){worst=r;at=`${v} m/s, ${el}°, ${rpm} rpm`;}}}
 check(worst<=1.001,`no bounce creates energy (largest total-energy ratio across 100 shots: ${worst.toFixed(3)} at ${at})`);}
console.log(fails?`\n${fails} FAILED`:'\nall realism checks passed');process.exit(fails?1:0);
