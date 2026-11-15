// KMeans — Lloyd's algorithm from k-means++ starts, best of several restarts, scored by inertia and silhouette
// One iteration assigns n rows to k centres and re-averages: Θ(n·k·d). The silhouette compares every pair: Θ(n²·d),
// trivial for the thirteen players clustered here.
class KMeans{
  constructor(k,rng,{restarts=50,iters=100}={}){this.k=k;this.rng=rng;this.restarts=restarts;this.iters=iters;}
  static d2(a,b){let s=0;for(let i=0;i<a.length;i++)s+=(a[i]-b[i])**2;return s;}
  fit(X){
    let best=null;
    for(let r=0;r<this.restarts;r++){
      // k-means++: each further centre is drawn with probability proportional to its squared distance from the nearest
      const C=[X[this.rng.int(X.length)].slice()];
      while(C.length<this.k){const w=X.map(x=>Math.min(...C.map(c=>KMeans.d2(x,c))));let u=this.rng.next()*w.reduce((a,b)=>a+b,0),i=0;
        for(;i<X.length-1;i++){u-=w[i];if(u<=0)break;}C.push(X[i].slice());}
      let lab=new Array(X.length).fill(-1);
      for(let it=0;it<this.iters;it++){
        const nl=X.map(x=>{let b=0,bd=Infinity;C.forEach((c,j)=>{const q=KMeans.d2(x,c);if(q<bd){bd=q;b=j;}});return b;});
        const same=nl.every((v,i)=>v===lab[i]);lab=nl;if(same)break;
        for(let j=0;j<this.k;j++){const m=X.filter((_,i)=>lab[i]===j);if(m.length)C[j]=m[0].map((_,q)=>m.reduce((s,x)=>s+x[q],0)/m.length);}
      }
      const inertia=X.reduce((s,x,i)=>s+KMeans.d2(x,C[lab[i]]),0);
      if(!best||inertia<best.inertia)best={inertia,labels:lab,centres:C};
    }
    Object.assign(this,best);return this;
  }
  // mean silhouette: for each row, how much closer it is to its own cluster than to the nearest other one (−1..1)
  static silhouette(X,lab){
    const k=Math.max(...lab)+1;let s=0;
    for(let i=0;i<X.length;i++){
      const dist=new Array(k).fill(0),cnt=new Array(k).fill(0);
      for(let j=0;j<X.length;j++){if(i===j)continue;dist[lab[j]]+=Math.sqrt(KMeans.d2(X[i],X[j]));cnt[lab[j]]++;}
      const a=cnt[lab[i]]?dist[lab[i]]/cnt[lab[i]]:0;let b=Infinity;for(let c=0;c<k;c++)if(c!==lab[i]&&cnt[c])b=Math.min(b,dist[c]/cnt[c]);
      s+=cnt[lab[i]]?(b-a)/Math.max(a,b):0;
    }
    return s/X.length;
  }
}
module.exports=KMeans;
