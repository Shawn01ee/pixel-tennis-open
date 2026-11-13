// Movement physics and footfalls.
// Run: node tests/locomotion.test.js
const{loadSim}=require('./load');
const{Locomotion,Gait,ROSTER}=loadSim(['Locomotion','Gait','ROSTER'],['render/Gait.js']);
const DT=1/120;let fails=0;const check=(ok,msg)=>{console.log(`${ok?'PASS':'FAIL'}  ${msg}`);if(!ok)fails++;};

// 1. the planner's timeTo matches what the controller actually does, for every player
let worst=0;
for(const st of ROSTER){const L=Locomotion.forProfile(st);
  for(const d of[1,2,4,8]){const b={x:0,z:0,vx:0,vz:0};let t=0;while(b.x<d&&t<5){L.step(b,100,0,DT,{arrive:false});t+=DT;}worst=Math.max(worst,Math.abs(t-L.timeTo(d)));}}
check(worst<=2.5*DT,`timeTo agrees with the controller within ${(worst*1000).toFixed(1)} ms (8 players × 4 distances)`);

// 2. top speeds and first-step pushes are human
const L0=Locomotion.forProfile(ROSTER[1]),L1=Locomotion.forProfile(ROSTER[2]);
check(L0.vmax>5.2&&L1.vmax<6.8,`top speeds ${L0.vmax.toFixed(2)}–${L1.vmax.toFixed(2)} m/s`);
check(L0.a0>12&&L1.a0<18&&L0.timeTo(4)<1.3&&L1.timeTo(4)>.85,`explosive first step: push from rest ${L0.a0.toFixed(1)}–${L1.a0.toFixed(1)} m/s²; 4 m takes ${L0.timeTo(4).toFixed(2)}–${L1.timeTo(4).toFixed(2)} s`);

// 3. acceleration never exceeds the body's limits, even cutting back the other way at full speed
{const L=L1,b={x:0,z:0,vx:L.vmax,vz:0};let amax=0;
  for(let i=0;i<240;i++){const vx=b.vx,vz=b.vz;L.step(b,-10,3,DT);amax=Math.max(amax,Math.hypot(b.vx-vx,b.vz-vz)/DT);}
  check(amax<=Math.hypot(Math.max(L.a0,L.brake),L.cut)+1e-6,`peak acceleration ${amax.toFixed(1)} m/s² within limits`);}

// 4. arriving: from a sprint, stop on the spot without overshooting
{const L=L1,b={x:0,z:0,vx:L.vmax*.95,vz:0};let over=0;for(let i=0;i<600;i++){L.step(b,4,0,DT);over=Math.max(over,b.x-4);}
  check(over<.05&&Math.abs(b.x-4)<.06&&Math.hypot(b.vx,b.vz)<.2,`arrives within ${Math.abs(b.x-4).toFixed(3)} m, overshoot ${over.toFixed(3)} m`);}

// 5. feet: planted feet do not move; feet stay within reach of the hips; stride follows speed
for(const v of[1.5,2.8,5.5]){
  const g=new Gait(),a={x:0,z:0,yaw:0,vx:0,vz:v};let drift=0,reach=0,steps=0,lastSwing=[false,false];
  for(let i=0;i<360;i++){const prev=g.feet.map(f=>({...f}));a.z+=v*DT;g.update(a,DT,1,.13);if(i>0)drift=Math.max(drift,Gait.drift(prev,g.feet));
    for(let k=0;k<2;k++){const f=g.feet[k];if(i>60)reach=Math.max(reach,Math.hypot(f.x-a.x,f.z-a.z));const sw=f.u<1;if(sw&&!lastSwing[k])steps++;lastSwing[k]=sw;}}
  const cad=steps/3,stride=v/cad;
  check(drift===0&&reach<.62,`${v} m/s: planted-foot drift ${drift} m, furthest foot ${reach.toFixed(2)} m from hips, ${cad.toFixed(2)} steps/s, ${stride.toFixed(2)} m a step`);
}
// 6. starting from rest the way a player does (an explosive first step to full speed): the feet keep up
{const L=Locomotion.forProfile(ROSTER[2]),g=new Gait(),b={x:0,z:0,vx:0,vz:0,yaw:Math.PI/2};let reach=0;
  for(let i=0;i<150;i++){L.step(b,20,0,DT,{arrive:false});g.update(b,DT,1,.25);if(i>2)for(const f of g.feet)if(f.u>=1)reach=Math.max(reach,Math.hypot(f.x-b.x,f.z-b.z));}
  check(reach<.62,`sprinting away from a standstill, a planted foot is never more than ${reach.toFixed(2)} m from the hips`);}
// 6. stopping: feet settle back under the body
{const g=new Gait(),a={x:0,z:0,yaw:0,vx:0,vz:4};for(let i=0;i<120;i++){a.z+=4*DT;g.update(a,DT);}a.vz=0;for(let i=0;i<120;i++)g.update(a,DT);
  const off=Math.max(...g.feet.map((f,i)=>Math.hypot(f.x-(a.x+(i?-.13:.13)),f.z-a.z)));check(off<.2&&g.feet.every(f=>f.u>=1),`after stopping, feet settle within ${off.toFixed(2)} m of their stance`);}
console.log(fails?`\n${fails} FAILED`:'\nall locomotion checks passed');process.exitCode=fails?1:0;
