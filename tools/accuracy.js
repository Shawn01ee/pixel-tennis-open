// Where aimed shots land: the person aims every rally ball at one spot with a drive; how close does each player put it?
//   node tools/accuracy.js [sets=6]
const{loadSim}=require('../tests/load.js');
const{Match,ROSTER,MatchFormat}=loadSim(['Match','ROSTER','MatchFormat']);
const N=+(process.argv[2]||6),TX=3.3,TD=10.4;
for(const p of ROSTER){let n=0,sx=0,sz=0,d=0,inn=0;
  for(let k=0;k<N;k++){const m=new Match({a:p,b:ROSTER[(p.id+3)%8],human:0,format:MatchFormat.get('short')});let i=0;
    while(!(m.stage==='over'&&m.result)&&i<120*60*90){const C=m.control,H=m.human;
      if(C.serveWait&&!C.target&&!C.zone)m.setZone('t');
      if(C.decide&&!C.target){if(C.shot!=='drive')m.setShot('drive');m.aimAt(TX,-H.s*TD);}
      m.tick();i++;
      for(const e of m.events)if(e.type==='hit'&&e.aimed&&e.kind==='drive'&&m.tr.hasB){const ex=m.tr.fbx-TX,ez=Math.abs(m.tr.fbz)-TD;n++;sx+=ex*ex;sz+=ez*ez;d+=Math.hypot(ex,ez);
        if(Math.abs(m.tr.fbx)<=4.115&&Math.abs(m.tr.fbz)<=11.885&&m.tr.fbz*H.s<0)inn++;}
      m.events.length=0;}}
  console.log(`${p.short.padEnd(10)} acc ${String(p.acc).padEnd(4)} err ${String(p.err).padEnd(4)} aimed drives ${String(n).padStart(4)}: miss ${(d/n).toFixed(2)} m on average, spread ${Math.sqrt(sx/n).toFixed(2)} m wide × ${Math.sqrt(sz/n).toFixed(2)} m deep, ${(inn/n*100).toFixed(0)}% in`);}
