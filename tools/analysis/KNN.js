// KNN — k-nearest-neighbour classifier on scaled features, distance-weighted vote
// Fitting stores the rows (Θ(1)); a query scans every stored row once and keeps the k closest in a bounded max-heap:
// Θ(n·d + n log k) per query, Θ(n·d) memory. Fine for the few thousand rows here; a k-d tree would only pay off in
// low dimensions, and these rows have about twenty.
const BoundedMaxHeap=require('./BoundedMaxHeap.js');
class KNN{
  constructor(k=15){this.k=k;}
  fit(X,y){this.X=X;this.y=y;return this;}
  proba(x){
    const H=new BoundedMaxHeap(this.k),X=this.X,d=x.length;
    for(let i=0;i<X.length;i++){const r=X[i];let s=0;for(let j=0;j<d;j++){const q=r[j]-x[j];s+=q*q;}H.push(s,i);}
    let w1=0,w=0;for(const{key,val}of H.items()){const wt=1/(Math.sqrt(key)+1e-6);w+=wt;if(this.y[val])w1+=wt;}
    return w1/w;
  }
  predict(X){return X.map(x=>this.proba(x)>=.5?1:0);}
}
module.exports=KNN;
