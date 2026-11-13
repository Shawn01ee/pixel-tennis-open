// Loads the browser-free part of the game (core → match) into a Node VM, in manifest order.
const fs=require('fs'),vm=require('vm'),path=require('path');
const SRC=path.join(__dirname,'..','src');
const SIM=['core/','physics/','rules/','players/','match/'];
function loadSim(expose,extra=[]){
  const files=JSON.parse(fs.readFileSync(path.join(SRC,'manifest.json'),'utf8')).filter(f=>SIM.some(d=>f.startsWith(d))||extra.includes(f));
  const ctx=vm.createContext({Math,Date,console,Float32Array,Int8Array,Object,Array,JSON});
  vm.runInContext(files.map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n')+`\n;this.API={${expose.join(',')}};`,ctx);
  return ctx.API;
}
module.exports={loadSim};
