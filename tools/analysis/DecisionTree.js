// DecisionTree — a CART classifier: binary splits chosen by the largest drop in Gini impurity
// At each node every feature is tried: its values are sorted (Θ(n log n)) and swept once with running class counts,
// so every threshold is scored in Θ(n). One level of the tree costs Θ(d·n log n) over all its nodes, the whole tree
// Θ(depth·d·n log n) time and Θ(n) extra space. Depth and leaf size are the knobs cross-validation picks.
class DecisionTree{
  constructor({maxDepth=5,minLeaf=40}={}){this.maxDepth=maxDepth;this.minLeaf=minLeaf;}
  static gini(n1,n){if(!n)return 0;const p=n1/n;return 2*p*(1-p);}
  fit(X,y,names=[]){
    this.names=names;this.imp=new Array(X[0].length).fill(0);this.n=X.length;
    this.root=this.grow(X,y,X.map((_,i)=>i),0);return this;
  }
  grow(X,y,idx,depth){
    const n=idx.length;let n1=0;for(const i of idx)n1+=y[i];
    const node={n,p:n1/n};
    if(depth>=this.maxDepth||n<2*this.minLeaf||n1===0||n1===n)return node;
    const g0=DecisionTree.gini(n1,n),d=X[0].length;let best=null;
    for(let j=0;j<d;j++){
      const s=idx.slice().sort((a,b)=>X[a][j]-X[b][j]);let l1=0;
      for(let k=0;k<n-1;k++){
        l1+=y[s[k]];const L=k+1;
        if(L<this.minLeaf||n-L<this.minLeaf||X[s[k]][j]===X[s[k+1]][j])continue;
        const g=(L*DecisionTree.gini(l1,L)+(n-L)*DecisionTree.gini(n1-l1,n-L))/n,gain=g0-g;
        if(!best||gain>best.gain)best={gain,j,t:(X[s[k]][j]+X[s[k+1]][j])/2};
      }
    }
    if(!best||best.gain<1e-5)return node;
    this.imp[best.j]+=best.gain*n;
    const L=[],R=[];for(const i of idx)(X[i][best.j]<=best.t?L:R).push(i);
    node.j=best.j;node.t=best.t;node.l=this.grow(X,y,L,depth+1);node.r=this.grow(X,y,R,depth+1);
    return node;
  }
  proba(x){let q=this.root;while(q.l)q=x[q.j]<=q.t?q.l:q.r;return q.p;}
  predict(X){return X.map(x=>this.proba(x)>=.5?1:0);}
  // share of the total impurity drop each feature is responsible for
  importance(){const s=this.imp.reduce((a,b)=>a+b,0)||1;return this.imp.map(v=>v/s);}
  // the tree as readable rules, the leaves with their sample counts and win rates
  rules(fmt=(j,t)=>`${this.names[j]} ≤ ${t.toFixed(2)}`){
    const out=[],walk=(q,pad,cond)=>{
      if(!q.l){out.push(`${pad}${cond}→ hitter wins ${(q.p*100).toFixed(0)}% (${q.n} shots)`);return;}
      out.push(`${pad}${cond}${q.n} shots, ${(q.p*100).toFixed(0)}%`);
      walk(q.l,pad+'  ',`if ${fmt(q.j,q.t)}: `);walk(q.r,pad+'  ',`else: `);};
    walk(this.root,'','');return out;
  }
}
module.exports=DecisionTree;
