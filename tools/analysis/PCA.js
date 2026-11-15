// PCA — principal components of standardised rows, by the cyclic Jacobi eigenvalue method
// The d×d covariance costs Θ(n·d²); Jacobi rotations diagonalise it in O(d³) per sweep, a handful of sweeps for the
// d ≈ 15 used here. Components come out sorted by the variance they explain.
class PCA{
  fit(X){
    const n=X.length,d=X[0].length,C=Array.from({length:d},()=>new Array(d).fill(0));
    for(const r of X)for(let a=0;a<d;a++)for(let b=a;b<d;b++)C[a][b]+=r[a]*r[b]/(n-1);
    for(let a=0;a<d;a++)for(let b=0;b<a;b++)C[a][b]=C[b][a];
    const V=Array.from({length:d},(_,i)=>Array.from({length:d},(_,j)=>i===j?1:0));
    for(let sweep=0;sweep<60;sweep++){
      let off=0;for(let a=0;a<d;a++)for(let b=a+1;b<d;b++)off+=C[a][b]*C[a][b];if(off<1e-18)break;
      for(let p=0;p<d;p++)for(let q=p+1;q<d;q++){
        if(Math.abs(C[p][q])<1e-15)continue;
        const th=(C[q][q]-C[p][p])/(2*C[p][q]),t=Math.sign(th||1)/(Math.abs(th)+Math.sqrt(th*th+1)),c=1/Math.sqrt(t*t+1),s=t*c;
        for(let k=0;k<d;k++){const kp=C[k][p],kq=C[k][q];C[k][p]=c*kp-s*kq;C[k][q]=s*kp+c*kq;}
        for(let k=0;k<d;k++){const pk=C[p][k],qk=C[q][k];C[p][k]=c*pk-s*qk;C[q][k]=s*pk+c*qk;}
        for(let k=0;k<d;k++){const vp=V[k][p],vq=V[k][q];V[k][p]=c*vp-s*vq;V[k][q]=s*vp+c*vq;}
      }
    }
    const order=[...Array(d).keys()].sort((a,b)=>C[b][b]-C[a][a]);
    this.values=order.map(i=>C[i][i]);this.vectors=order.map(i=>V.map(r=>r[i]));
    const tot=this.values.reduce((a,b)=>a+Math.max(0,b),0);this.explained=this.values.map(v=>Math.max(0,v)/tot);
    return this;
  }
  transform(X,k=2){return X.map(r=>this.vectors.slice(0,k).map(v=>v.reduce((s,w,j)=>s+w*r[j],0)));}
}
module.exports=PCA;
