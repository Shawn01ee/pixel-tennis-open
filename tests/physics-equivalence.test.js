// The OOP physics must reproduce the original functional physics exactly.
// Run: node tests/physics-equivalence.test.js
const fs=require('fs'),vm=require('vm'),path=require('path'),{loadSim}=require('./load');
const ORIG=path.join(__dirname,'..','..','original','01-physics.js');
// the reference implementation is kept outside this repository; without it there is nothing to compare against
if(!fs.existsSync(ORIG)){console.log('SKIP: reference physics not present');process.exit(0);}
const O=vm.createContext({Math,Date,Float32Array,Int8Array,Object});vm.runInContext(fs.readFileSync(ORIG,'utf8'),O);
const{Ball,BallPhysics,ShotSolver,SURFACES}=loadSim(['Ball','BallPhysics','ShotSolver','SURFACES']);
let maxd=0,n=0,fail=0;
for(const surf of['hard','clay','grass'])for(const v of[12,25,38,50])for(const rpm of[-2500,0,900,3000])for(const el of[-.05,.08,.2,.45]){
  const side=rpm===900?400:0;
  const a=vm.runInContext(`(()=>{const b=mkBall(0.4,0.95,-11.5);const v=${v},el=${el},az=0.06;b.vx=v*Math.cos(el)*Math.sin(az);b.vy=v*Math.sin(el);b.vz=v*Math.cos(el)*Math.cos(az);setSpin(b,b.vx,b.vz,${rpm},${side});
    const o=[];for(let i=0;i<500;i++){const e=stepBall(b,DT,SURF.${surf},true);o.push(b.x,b.y,b.z,e);if(b.bc>=2||b.rolling)break;}return o;})()`,O);
  const b=new Ball(.4,.95,-11.5);b.launch(v,el,.06,rpm,side);const ph=new BallPhysics(SURFACES[surf]),o=[];
  for(let i=0;i<500;i++){const e=ph.step(b,1/120,true);o.push(b.x,b.y,b.z,e);if(b.bc>=2||b.rolling)break;}
  if(a.length!==o.length){fail++;continue;}
  for(let i=0;i<a.length;i++)maxd=Math.max(maxd,Math.abs(a[i]-o[i]));n++;
}
const sa=JSON.stringify(vm.runInContext(`solveShot({x:1,y:.9,z:11},{x:-2.5,y:0,z:-9},{v:33,rpm:2400,clear:.15,surf:SURF.hard})`,O));
const sb=JSON.stringify(new ShotSolver(new BallPhysics(SURFACES.hard)).solve({x:1,y:.9,z:11},{x:-2.5,y:0,z:-9},{v:33,rpm:2400,clear:.15}));
const ok=fail===0&&maxd===0&&sa===sb;
console.log(`${n} trajectories, length mismatches ${fail}, max |diff| ${maxd}; solver ${sa===sb?'identical':'DIFFERENT'} → ${ok?'PASS':'FAIL'}`);
process.exitCode=ok?0:1;
