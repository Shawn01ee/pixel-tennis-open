// The picture's sharpness: one stall must not coarsen it, a slow device must, and a fast one must get it back.
const fs=require('fs'),path=require('path'),vm=require('vm');
const ctx=vm.createContext({Math});vm.runInContext(fs.readFileSync(path.join(__dirname,'..','src','app','FrameWatch.js'),'utf8')+';this.FrameWatch=FrameWatch;',ctx);
const{FrameWatch}=ctx;let fails=0;const check=(ok,what)=>{console.log((ok?'PASS ':'FAIL ')+what);if(!ok)fails++;};
const run=(w,t,frames,dt)=>{for(let i=0;i<frames;i++){t+=dt;w.tick(t);}return t;};
{const w=new FrameWatch(()=>{});let t=run(w,0,400,16);t+=2000;w.tick(t);t=run(w,t,600,16);check(w.step===0,'a 2-second stall at 60 fps leaves the picture sharp');}
{const w=new FrameWatch(()=>{});let t=run(w,0,60,16);for(let i=0;i<20;i++){t+=200;w.tick(t);}t=run(w,t,600,16);check(w.step===0,'twenty 200-ms hitches in steady 60 fps leave it sharp');}
{const w=new FrameWatch(()=>{});run(w,0,200,16);check(w.step===0,'nothing is judged in the first three seconds');}
{const w=new FrameWatch(()=>{});let t=run(w,0,250,45);t=run(w,t,400,45);check(w.step>=1,`a device drawing at 22 fps gets coarser pixels (step ${w.step})`);
 const s=w.step;t=run(w,t,800,15);check(w.step<s,`once it draws at 66 fps it gets them back (step ${s} → ${w.step})`);}
{const w=new FrameWatch(()=>{});run(w,0,3000,60);check(w.step===FrameWatch.MAX,`never coarser than ${FrameWatch.MAX} steps`);}
console.log(fails?`\n${fails} FAILED`:'\nall frame-watch checks passed');process.exitCode=fails?1:0;
