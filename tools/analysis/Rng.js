// Rng — a small seeded generator (mulberry32), so every split, fold and clustering in the analysis is reproducible
class Rng{
  constructor(seed=1){this.s=seed>>>0;}
  next(){let t=this.s+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;}
  int(n){return Math.floor(this.next()*n);}
  // Fisher–Yates shuffle in place: Θ(n) time, O(1) extra space
  shuffle(a){for(let i=a.length-1;i>0;i--){const j=this.int(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
}
module.exports=Rng;
