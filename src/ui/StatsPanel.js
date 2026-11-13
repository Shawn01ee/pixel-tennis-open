// StatsPanel — side-by-side match statistics
class StatsPanel{
  constructor(){this.html='';}
  update(m){
    const[a,b]=m.players,x=a.ms,y=b.ms,pc=(n,d)=>d?Math.round(n/d*100)+'%':'–';
    const rows=[[x.aces,'Aces',y.aces],[x.df,'Double faults',y.df],[pc(x.sv1in,x.sv1),'1st serve in',pc(y.sv1in,y.sv1)],[pc(x.won1,x.sv1in),'1st serve pts won',pc(y.won1,y.sv1in)],
      [pc(x.won2,x.sv2),'2nd serve pts won',pc(y.won2,y.sv2)],[x.win,'Winners',y.win],[x.ue,'Errors',y.ue],[`${x.bpW}/${x.bpT}`,'Break points won',`${y.bpW}/${y.bpT}`],
      [x.fast?x.fast:'–','Fastest serve',y.fast?y.fast:'–'],[x.pts,'Points won',y.pts]];
    const html=`<table><tr><th>${a.short}</th><th></th><th>${b.short}</th></tr>${rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</table>`;
    if(html!==this.html){this.html=html;$('statsP').innerHTML=html;}
    return rows;
  }
}
