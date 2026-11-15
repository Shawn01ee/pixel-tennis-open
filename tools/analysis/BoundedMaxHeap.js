// BoundedMaxHeap — keeps the k smallest items seen so far, with the largest of them on top
// A binary max-heap in an array. A new item replaces the top only if it is smaller, so after n pushes the heap holds
// the k smallest: Θ(n log k) time and Θ(k) space, against Θ(n log n) for sorting everything and taking k.
class BoundedMaxHeap{
  constructor(k){this.k=k;this.key=[];this.val=[];}
  get size(){return this.key.length;}
  get top(){return this.key[0];}
  push(key,val){
    const K=this.key,V=this.val;
    if(K.length<this.k){K.push(key);V.push(val);let i=K.length-1;
      while(i>0){const p=(i-1)>>1;if(K[p]>=K[i])break;this.swap(i,p);i=p;}return;}
    if(key>=K[0])return;
    K[0]=key;V[0]=val;let i=0;
    for(;;){const l=2*i+1,r=l+1;let m=i;if(l<K.length&&K[l]>K[m])m=l;if(r<K.length&&K[r]>K[m])m=r;if(m===i)break;this.swap(i,m);i=m;}
  }
  swap(a,b){const K=this.key,V=this.val;[K[a],K[b]]=[K[b],K[a]];[V[a],V[b]]=[V[b],V[a]];}
  items(){return this.key.map((k,i)=>({key:k,val:this.val[i]}));}
}
module.exports=BoundedMaxHeap;
