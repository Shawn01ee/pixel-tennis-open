// Validation — splits, folds and scores
// Shots from the same match share players and conditions, so rows are split by match (grouped): a match is either
// entirely in training or entirely in testing, and the test score is not flattered by near-duplicates.
class Validation{
  // a grouped hold-out split: testFrac of the groups go to the test set
  static groupSplit(groups,testFrac,rng){
    const ids=rng.shuffle([...new Set(groups)]),cut=Math.round(ids.length*testFrac),test=new Set(ids.slice(0,cut)),tr=[],te=[];
    groups.forEach((g,i)=>(test.has(g)?te:tr).push(i));return{train:tr,test:te};
  }
  // grouped k-fold: the groups are shuffled and dealt into k folds; returns [train, validation] index pairs
  static groupKFold(groups,k,rng){
    const ids=rng.shuffle([...new Set(groups)]),fold=new Map(ids.map((g,i)=>[g,i%k])),out=[];
    for(let f=0;f<k;f++){const tr=[],va=[];groups.forEach((g,i)=>(fold.get(g)===f?va:tr).push(i));out.push([tr,va]);}
    return out;
  }
  // confusion matrix for a 0/1 task: [[TN, FP], [FN, TP]]
  static confusion(t,p){const m=[[0,0],[0,0]];for(let i=0;i<t.length;i++)m[t[i]][p[i]]++;return m;}
  static scores(m){
    const[[tn,fp],[fn,tp]]=m,n=tn+fp+fn+tp,prec=tp/(tp+fp||1),rec=tp/(tp+fn||1),f1=2*prec*rec/(prec+rec||1);
    const prec0=tn/(tn+fn||1),rec0=tn/(tn+fp||1),f10=2*prec0*rec0/(prec0+rec0||1);
    return{accuracy:(tp+tn)/n,precision:prec,recall:rec,f1,macroF1:(f1+f10)/2};
  }
  // adjusted Rand index between two labellings: 1 identical, ~0 no better than chance
  static adjustedRand(a,b){
    const n=a.length,c2=x=>x*(x-1)/2,tab=new Map(),ra=new Map(),rb=new Map();
    for(let i=0;i<n;i++){const k=a[i]+'|'+b[i];tab.set(k,(tab.get(k)||0)+1);ra.set(a[i],(ra.get(a[i])||0)+1);rb.set(b[i],(rb.get(b[i])||0)+1);}
    let s=0;for(const v of tab.values())s+=c2(v);let sa=0;for(const v of ra.values())sa+=c2(v);let sb=0;for(const v of rb.values())sb+=c2(v);
    const e=sa*sb/c2(n),mx=(sa+sb)/2;return mx===e?0:(s-e)/(mx-e);
  }
}
module.exports=Validation;
