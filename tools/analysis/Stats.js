// Stats — correlation, entropy, mutual information and scaling: the first look at the data, before any model
class Stats{
  static mean(a){let s=0;for(const v of a)s+=v;return s/a.length;}
  static sd(a){const m=Stats.mean(a);let s=0;for(const v of a)s+=(v-m)*(v-m);return Math.sqrt(s/Math.max(1,a.length-1));}
  // Pearson's r: linear association between two columns, −1..1. Θ(n)
  static pearson(x,y){
    const n=x.length,mx=Stats.mean(x),my=Stats.mean(y);let sxy=0,sxx=0,syy=0;
    for(let i=0;i<n;i++){const a=x[i]-mx,b=y[i]-my;sxy+=a*b;sxx+=a*a;syy+=b*b;}
    return sxx>0&&syy>0?sxy/Math.sqrt(sxx*syy):0;
  }
  // Shannon entropy of discrete values, in bits. Counting goes through a hash map: Θ(n) time, O(distinct) space
  static entropy(vals){
    const c=new Map();for(const v of vals)c.set(v,(c.get(v)||0)+1);
    let h=0;for(const k of c.values()){const p=k/vals.length;h-=p*Math.log2(p);}return h;
  }
  // mutual information I(X;Y) = H(Y) − H(Y|X): how many bits knowing X saves about Y. Θ(n)
  static mutualInfo(x,y){
    const n=x.length,g=new Map();
    for(let i=0;i<n;i++){let a=g.get(x[i]);if(!a)g.set(x[i],a=[]);a.push(y[i]);}
    let hc=0;for(const a of g.values())hc+=a.length/n*Stats.entropy(a);
    return Stats.entropy(y)-hc;
  }
  // equal-frequency bins for a continuous column, so its mutual information can be measured: the cut points come
  // from one sort (Θ(n log n)), each value then finds its bin by binary search (O(log q))
  static bin(x,q=8){
    if(new Set(x).size<=q)return x;          // already discrete (a 0/1 flag, a count): use the values themselves
    const s=Float64Array.from(x).sort(),cuts=[];for(let i=1;i<q;i++)cuts.push(s[Math.floor(i*s.length/q)]);
    return x.map(v=>{let lo=0,hi=cuts.length;while(lo<hi){const m=(lo+hi)>>1;if(v<cuts[m])hi=m;else lo=m+1;}return lo;});
  }
  // z-scores per column; returns the scaled rows and the scaling, to apply the same one to new rows
  static fitScale(X){
    const d=X[0].length,mu=new Array(d).fill(0),sd=new Array(d).fill(0);
    for(const r of X)for(let j=0;j<d;j++)mu[j]+=r[j]/X.length;
    for(const r of X)for(let j=0;j<d;j++)sd[j]+=(r[j]-mu[j])**2/Math.max(1,X.length-1);
    for(let j=0;j<d;j++)sd[j]=Math.sqrt(sd[j])||1;
    return{mu,sd,apply:R=>R.map(r=>r.map((v,j)=>(v-mu[j])/sd[j]))};
  }
}
module.exports=Stats;
