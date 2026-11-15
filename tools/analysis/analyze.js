// The analysis of the self-play data: node tools/analysis/analyze.js   (after collect.js; learning-cv.js optional)
//   1. data analysis      class balance and entropy, Pearson correlation, mutual information, feature selection
//   2. structure          PCA of the players' playing styles, K-means clustering, agreement with the known styles
//   3. machine learning   decision tree and KNN predicting whether a shot's hitter wins the point
//   4. evaluation         grouped train/test split, 5-fold grouped cross-validation, confusion matrix, precision,
//                         recall, F1 — and, from learning-cv.js, cross-validation of the tactics learning itself
// Writes training/analysis/README.md and its charts.
const fs=require('fs'),path=require('path');
const Stats=require('./Stats.js'),PCA=require('./PCA.js'),KMeans=require('./KMeans.js'),KNN=require('./KNN.js'),DecisionTree=require('./DecisionTree.js'),Validation=require('./Validation.js'),Rng=require('./Rng.js');
const OUT=path.join(__dirname,'..','..','training','analysis'),SEED=20261115;
const D=JSON.parse(fs.readFileSync(path.join(OUT,'data.json'),'utf8')),rows=D.rows,y=rows.map(r=>r.y),groups=rows.map(r=>r.match);
const NUM=['stretch','height','inPace','inSpin','depth','oppDepth','oppNet','gap','isReturn','rally','power','control','accuracy','spin','oppSpeed','oppControl'];
const LABEL={stretch:'how stretched',height:'contact height',inPace:'incoming pace',inSpin:'incoming topspin',depth:'hitter distance from net',oppDepth:'opponent distance from net',
  oppNet:'opponent at the net',gap:'aim distance from opponent',isReturn:'return of serve',rally:'shots so far',power:'power rating',control:'control rating',accuracy:'accuracy rating',
  spin:'spin rating',oppSpeed:'opponent speed rating',oppControl:'opponent control rating',tac:'tactic chosen',wing:'stroke'};
const TACS=[...new Set(rows.map(r=>r.tac))].sort(),WINGS=['fh','bh','volley','smash'];
const names=[...NUM,...WINGS.map(w=>'wing='+w),...TACS.map(t=>'tac='+t)];
const X=rows.map(r=>[...NUM.map(k=>r[k]),...WINGS.map(w=>r.wing===w?1:0),...TACS.map(t=>r.tac===t?1:0)]);
const f2=v=>v.toFixed(2),f3=v=>v.toFixed(3),pc=v=>(v*100).toFixed(1)+'%';
const log=s=>console.log(s);
// ── 1. data analysis ──
const Hy=Stats.entropy(y),base=Stats.mean(y);
const corr=NUM.map(k=>({k,r:Stats.pearson(rows.map(q=>q[k]),y)}));
const mi=[...NUM.map(k=>({k,mi:Stats.mutualInfo(Stats.bin(rows.map(q=>q[k]),8),y)})),{k:'tac',mi:Stats.mutualInfo(rows.map(q=>q.tac),y)},{k:'wing',mi:Stats.mutualInfo(rows.map(q=>q.wing),y)}].sort((a,b)=>b.mi-a.mi);
const pairs=[];for(let a=0;a<NUM.length;a++)for(let b=a+1;b<NUM.length;b++){const r=Stats.pearson(rows.map(q=>q[NUM[a]]),rows.map(q=>q[NUM[b]]));if(Math.abs(r)>=.4)pairs.push({a:NUM[a],b:NUM[b],r});}
pairs.sort((p,q)=>Math.abs(q.r)-Math.abs(p.r));
const tacRate=TACS.map(t=>{const s=rows.filter(r=>r.tac===t);return{t,n:s.length,p:Stats.mean(s.map(r=>r.y))};}).sort((a,b)=>b.p-a.p);
log(`${rows.length} shots · hitter wins ${pc(base)} · H(y) = ${f3(Hy)} bits`);
// columns belonging to a raw feature (a categorical feature is several one-hot columns)
const colsOf=k=>k==='tac'?TACS.map(t=>names.indexOf('tac='+t)):k==='wing'?WINGS.map(w=>names.indexOf('wing='+w)):[names.indexOf(k)];
const pick=(R,cols)=>R.map(r=>cols.map(c=>r[c]));
// ── evaluation helpers ──
const rng=new Rng(SEED),split=Validation.groupSplit(groups,.2,rng),TR=split.train,TE=split.test;
const sub=(idx,n,r)=>idx.length<=n?idx:r.shuffle(idx.slice()).slice(0,n);
const at=(A,idx)=>idx.map(i=>A[i]);
function cvScore(make,cols,{knn=false,folds=5,cap=5000}={}){
  const r=new Rng(SEED+1),F=Validation.groupKFold(at(groups,TR),folds,r),out=[];
  for(const[a,b]of F){
    let tr=a.map(i=>TR[i]),va=b.map(i=>TR[i]);if(knn){tr=sub(tr,cap,r);va=sub(va,Math.round(cap/4),r);}
    let Xt=pick(at(X,tr),cols),Xv=pick(at(X,va),cols);
    if(knn){const sc=Stats.fitScale(Xt);Xt=sc.apply(Xt);Xv=sc.apply(Xv);}        // scaling fitted on the training fold only
    const m=make().fit(Xt,at(y,tr)),s=Validation.scores(Validation.confusion(at(y,va),m.predict(Xv)));out.push(s);
  }
  const avg=k=>Stats.mean(out.map(s=>s[k])),sd=k=>Stats.sd(out.map(s=>s[k]));
  return{acc:avg('accuracy'),accSd:sd('accuracy'),f1:avg('macroF1'),f1Sd:sd('macroF1')};
}
const ALL=names.map((_,i)=>i);
// feature selection: the m most informative raw features by mutual information, judged by cross-validated tree
const sel=[3,6,9,12,mi.length].map(m=>{const keep=mi.slice(0,m).map(q=>q.k),cols=keep.flatMap(colsOf),s=cvScore(()=>new DecisionTree({maxDepth:5,minLeaf:60}),cols);log(`top ${m} by MI: macro-F1 ${f3(s.f1)}`);return{m,keep,cols,...s};});
const bestSel=sel.reduce((a,b)=>b.f1>a.f1+.002?b:a);
// hyper-parameters by cross-validation on the training set only
const depthCV=[2,3,4,6,8,10,12,14].map(d=>{const s=cvScore(()=>new DecisionTree({maxDepth:d,minLeaf:60}),bestSel.cols);log(`tree depth ${d}: macro-F1 ${f3(s.f1)} ± ${f3(s.f1Sd)}`);return{d,...s};});
const bestD=depthCV.reduce((a,b)=>b.f1>a.f1+.002?b:a);
const kCV=[5,15,45,95].map(k=>{const s=cvScore(()=>new KNN(k),bestSel.cols,{knn:true});log(`knn k=${k}: macro-F1 ${f3(s.f1)} ± ${f3(s.f1Sd)}`);return{k,...s};});
const bestK=kCV.reduce((a,b)=>b.f1>a.f1+.002?b:a);
// the held-out test set, touched once
const test={};
{const yt=at(y,TE);
  test.majority=Validation.scores(Validation.confusion(yt,yt.map(()=>base>=.5?1:0)));test.majority.cm=Validation.confusion(yt,yt.map(()=>base>=.5?1:0));
  const tr=new Map();for(const i of TR){const t=rows[i].tac,q=tr.get(t)||[0,0];q[0]+=y[i];q[1]++;tr.set(t,q);}
  const pt=TE.map(i=>{const q=tr.get(rows[i].tac);return q&&q[0]/q[1]>=.5?1:0;});test.tactic={...Validation.scores(Validation.confusion(yt,pt)),cm:Validation.confusion(yt,pt)};
  const dt=new DecisionTree({maxDepth:bestD.d,minLeaf:60}).fit(pick(at(X,TR),bestSel.cols),at(y,TR)),pd=dt.predict(pick(at(X,TE),bestSel.cols));
  test.tree={...Validation.scores(Validation.confusion(yt,pd)),cm:Validation.confusion(yt,pd)};
  const r=new Rng(SEED+2),trK=sub(TR,8000,r),Xk=pick(at(X,trK),bestSel.cols),sc=Stats.fitScale(Xk),kn=new KNN(bestK.k).fit(sc.apply(Xk),at(y,trK)),pk=kn.predict(sc.apply(pick(at(X,TE),bestSel.cols)));
  test.knn={...Validation.scores(Validation.confusion(yt,pk)),cm:Validation.confusion(yt,pk)};}
// an interpretable tree over the raw situation (depth 3), fitted on the training set
const small=new DecisionTree({maxDepth:3,minLeaf:200}).fit(pick(at(X,TR),ALL),at(y,TR),names);
const imp=new DecisionTree({maxDepth:bestD.d,minLeaf:60}).fit(pick(at(X,TR),ALL),at(y,TR),names).importance().map((v,i)=>({k:names[i],v})).sort((a,b)=>b.v-a.v).slice(0,8);
// ── 2. structure: the players' styles ──
const STYLE={Djokovic:'offensive baseliner',Nadal:'offensive baseliner',Sinner:'offensive baseliner',Agassi:'offensive baseliner',Zverev:'offensive baseliner',
  Murray:'counterpuncher',Medvedev:'counterpuncher','de Minaur':'counterpuncher',Borg:'counterpuncher',Federer:'all-court',Alcaraz:'all-court',Sampras:'serve and volley',McEnroe:'serve and volley'};
const P=D.profiles,PF=Object.keys(P[0].f),PX=P.map(p=>PF.map(k=>p.f[k])),ps=Stats.fitScale(PX),Z=ps.apply(PX);
const pca=new PCA().fit(Z),XY=pca.transform(Z,2);
const load=c=>PF.map((k,j)=>({k,w:pca.vectors[c][j]})).sort((a,b)=>Math.abs(b.w)-Math.abs(a.w)).slice(0,4);
const kmRuns=[2,3,4,5].map(k=>{const km=new KMeans(k,new Rng(SEED+k)).fit(Z);return{k,km,sil:KMeans.silhouette(Z,km.labels),ari:Validation.adjustedRand(km.labels,P.map(p=>STYLE[p.name]))};});
const bestKM=kmRuns.reduce((a,b)=>b.sil>a.sil?b:a);
// leave-one-out KNN: does a player's measured play predict the style the tennis world gives them?
const loo=P.map((p,i)=>{const others=P.map((_,j)=>j).filter(j=>j!==i),H=new (require('./BoundedMaxHeap.js'))(3);
  for(const j of others)H.push(KMeans.d2(Z[i],Z[j]),j);const votes=new Map();for(const{key,val}of H.items()){const s=STYLE[P[val].name];votes.set(s,(votes.get(s)||0)+1/(Math.sqrt(key)+1e-6));}
  const pred=[...votes.entries()].sort((a,b)=>b[1]-a[1])[0][0],nn=H.items().sort((a,b)=>a.key-b.key)[0].val;return{name:p.name,truth:STYLE[p.name],pred,nearest:P[nn].name};});
const looAcc=loo.filter(q=>q.truth===q.pred).length/loo.length;
// ── 4b. the tactics learning, cross-validated ──
let lcv=null;try{lcv=JSON.parse(fs.readFileSync(path.join(OUT,'learning-cv.json'),'utf8'));}catch(e){}
// ── charts ──
const THEMES={light:{bg:'#fcfcfb',ink:'#0b0b0b',sub:'#52514e',grid:'#e4e3df',cat:['#2a78d6','#eb6834','#1baf7a','#eda100','#e87ba4']},dark:{bg:'#1a1a19',ink:'#f0efec',sub:'#c3c2b7',grid:'#383835',cat:['#3987e5','#d95926','#199e70','#c98500','#d55181']}};
const FONT='font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif"',esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
function miChart(th){
  const W=760,L=210,Rm=70,T=56,rh=22,H=T+mi.length*rh+30,pw=W-L-Rm,mx=Math.max(...mi.map(q=>q.mi))*1.1,Xs=v=>L+pw*v/mx;let g='';
  const step=mx>.04?.01:mx>.02?.005:.002;for(let v=0;v<=mx;v+=step)g+=`<line x1="${Xs(v)}" x2="${Xs(v)}" y1="${T-4}" y2="${T+mi.length*rh}" stroke="${th.grid}"/><text x="${Xs(v)}" y="${T+mi.length*rh+16}" text-anchor="middle" font-size="12" fill="${th.sub}">${v.toFixed(3)}</text>`;
  mi.forEach((q,i)=>{const yy=T+i*rh+3;g+=`<text x="${L-10}" y="${yy+12}" text-anchor="end" font-size="13" fill="${th.ink}">${esc(LABEL[q.k]||q.k)}</text><rect x="${L}" y="${yy}" width="${Math.max(2,Xs(q.mi)-L).toFixed(1)}" height="${rh-7}" rx="3" fill="${th.cat[0]}"><title>${esc(LABEL[q.k]||q.k)}: ${q.mi.toFixed(4)} bits</title></rect><text x="${(Xs(q.mi)+6).toFixed(1)}" y="${yy+12}" font-size="12" fill="${th.ink}">${q.mi.toFixed(4)}</text>`;});
  return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" ${FONT} role="img" aria-label="Mutual information between each feature and winning the point"><rect width="${W}" height="${H}" fill="${th.bg}"/>
<text x="16" y="24" font-size="16" font-weight="600" fill="${th.ink}">What a shot's situation says about winning the point</text>
<text x="16" y="42" font-size="12" fill="${th.sub}">Mutual information with "the hitter wins the point", in bits (the outcome itself carries ${f3(Hy)} bits)</text>${g}</svg>\n`;
}
function pcaChart(th){
  const W=760,H=520,L=56,R=40,T=60,B=50,xs=XY.map(p=>p[0]),ys=XY.map(p=>p[1]),x0=Math.min(...xs)-.8,x1=Math.max(...xs)+.8,y0=Math.min(...ys)-.8,y1=Math.max(...ys)+.8;
  const X_=v=>L+(W-L-R)*(v-x0)/(x1-x0),Y_=v=>T+(H-T-B)*(1-(v-y0)/(y1-y0)),lab=bestKM.km.labels;let g='';
  for(let v=Math.ceil(x0);v<=x1;v++)g+=`<line x1="${X_(v)}" x2="${X_(v)}" y1="${T}" y2="${H-B}" stroke="${th.grid}"/><text x="${X_(v)}" y="${H-B+16}" text-anchor="middle" font-size="12" fill="${th.sub}">${v}</text>`;
  for(let v=Math.ceil(y0);v<=y1;v++)g+=`<line x1="${L}" x2="${W-R}" y1="${Y_(v)}" y2="${Y_(v)}" stroke="${th.grid}"/><text x="${L-8}" y="${Y_(v)+4}" text-anchor="end" font-size="12" fill="${th.sub}">${v}</text>`;
  XY.forEach((p,i)=>{const c=th.cat[lab[i]%th.cat.length];g+=`<circle cx="${X_(p[0]).toFixed(1)}" cy="${Y_(p[1]).toFixed(1)}" r="6" fill="${c}" stroke="${th.bg}" stroke-width="2"><title>${esc(P[i].name)} · cluster ${lab[i]+1} · ${esc(STYLE[P[i].name])}</title></circle><text x="${(X_(p[0])+10).toFixed(1)}" y="${(Y_(p[1])+4).toFixed(1)}" font-size="13" fill="${th.ink}">${esc(P[i].name)}</text>`;});
  const leg=[...Array(bestKM.k).keys()].map(c=>`<circle cx="${L+c*110+6}" cy="${T-14}" r="5" fill="${th.cat[c]}"/><text x="${L+c*110+16}" y="${T-10}" font-size="12" fill="${th.ink}">cluster ${c+1}</text>`).join('');
  return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" ${FONT} role="img" aria-label="The players' measured playing styles on the first two principal components, coloured by K-means cluster"><rect width="${W}" height="${H}" fill="${th.bg}"/>
<text x="16" y="22" font-size="16" font-weight="600" fill="${th.ink}">Playing styles, as measured in self-play</text>
<text x="16" y="38" font-size="12" fill="${th.sub}">First two principal components of ${PF.length} style measures (${pc(pca.explained[0]+pca.explained[1])} of the variance) · colour: K-means, k = ${bestKM.k}</text>
${leg}${g}<text x="${(L+W-R)/2}" y="${H-12}" text-anchor="middle" font-size="12" fill="${th.sub}">PC1 (${pc(pca.explained[0])}): ${esc(load(0).slice(0,2).map(q=>(q.w>0?'+':'−')+q.k).join(', '))}</text>
<text x="14" y="${(T+H-B)/2}" font-size="12" fill="${th.sub}" transform="rotate(-90 14 ${(T+H-B)/2})" text-anchor="middle">PC2 (${pc(pca.explained[1])}): ${esc(load(1).slice(0,2).map(q=>(q.w>0?'+':'−')+q.k).join(', '))}</text></svg>\n`;
}
for(const k in THEMES){fs.writeFileSync(path.join(OUT,`mi-${k}.svg`),miChart(THEMES[k]));fs.writeFileSync(path.join(OUT,`styles-${k}.svg`),pcaChart(THEMES[k]));}
// ── the page ──
const cmT=(cm,name)=>`| ${name} | ${cm[1][1]} | ${cm[1][0]} | ${cm[0][1]} | ${cm[0][0]} |`;
const sc=(s,name)=>`| ${name} | ${pc(s.accuracy)} | ${pc(s.precision)} | ${pc(s.recall)} | ${f3(s.f1)} | ${f3(s.macroF1)} |`;
const clusters=[...Array(bestKM.k).keys()].map(c=>P.filter((_,i)=>bestKM.km.labels[i]===c).map(p=>p.name));
let lcvMd='*Not run yet: `node tools/analysis/learning-cv.js`.*';
const se=A=>{const p=A.tw/A.tt,q=A.uw/A.ut;return 200*Math.sqrt(p*(1-p)/A.tt+q*(1-q)/A.ut);};
if(lcv){const R=lcv.results,ins=R.map(r=>r.inSample.advantage),out=R.map(r=>r.heldOut.advantage),pool=(k)=>{const a=R.reduce((s,r)=>({tw:s.tw+r[k].tw,tt:s.tt+r[k].tt,uw:s.uw+r[k].uw,ut:s.ut+r[k].ut}),{tw:0,tt:0,uw:0,ut:0});return(a.tw/a.tt-a.uw/a.ut)*100;};
  lcvMd=`| Fold | Test players (never met in training) | In-sample advantage | Held-out advantage |\n|---|---|---|---|\n${R.map(r=>`| ${r.fold} | ${r.test.join(', ')} | +${r.inSample.advantage.toFixed(1)} pts | ${r.heldOut.advantage>=0?'+':''}${r.heldOut.advantage.toFixed(1)} pts |`).join('\n')}\n| **All folds** | | **+${pool('inSample').toFixed(1)} pts** | **${pool('heldOut')>=0?'+':''}${pool('heldOut').toFixed(1)} pts** |\n\n`+
  `With ${Math.round(R.reduce((s,r)=>s+r.heldOut.tt,0)/R.length).toLocaleString('en-US')} points per version per fold, one fold's figure is good to about ±${(se(R[0].heldOut)).toFixed(1)} points and the pooled one to about ±${se(R.reduce((a,r)=>({tw:a.tw+r.heldOut.tw,tt:a.tt+r.heldOut.tt,uw:a.uw+r.heldOut.uw,ut:a.ut+r.heldOut.ut}),{tw:0,tt:0,uw:0,ut:0})).toFixed(1)} (two standard errors). `+
  (pool('heldOut')>=pool('inSample')-2*se(R.reduce((a,r)=>({tw:a.tw+r.heldOut.tw,tt:a.tt+r.heldOut.tt,uw:a.uw+r.heldOut.uw,ut:a.ut+r.heldOut.ut}),{tw:0,tt:0,uw:0,ut:0}))?
   '**What is learned carries over to opponents never met: the held-out advantage is as large as the in-sample one, so the players are learning tennis, not the habits of particular opponents.** ':
   '**The held-out advantage is clearly smaller than the in-sample one: part of what is learned is specific to the opponents met in training.** ')+
  `Advantage = share of points the trained player wins minus the share its untrained twin wins against the same opponent, in percentage points. Each fold trains ${lcv.rounds} rounds from scratch; each comparison is ${lcv.sets} short sets with each version.`;}
const pool2=k=>{if(!lcv)return'';const R=lcv.results,a=R.reduce((s,r)=>({tw:s.tw+r[k].tw,tt:s.tt+r[k].tt,uw:s.uw+r[k].uw,ut:s.ut+r[k].ut}),{tw:0,tt:0,uw:0,ut:0}),v=(a.tw/a.tt-a.uw/a.ut)*100;return(v>=0?'+':'')+v.toFixed(1);};
const md=`# What the self-play data says

The players' learning (see [the training page](../README.md)) leaves behind a lot of tennis: every shot, the
situation it was played in, the choice made and whether it won the point. This page analyses that data in four
steps — look at it, find its structure, model it, then test the models honestly on data they have not seen. It is
rebuilt by \`tools/analysis/collect.js\` and \`tools/analysis/analyze.js\`.

**The data:** ${rows.length.toLocaleString('en-US')} shots from ${new Set(groups).size} short sets of self-play (every
player against every other, twice). Each row: ${NUM.length} numbers describing the situation (how stretched the
hitter is, contact height, incoming pace and spin, both players' positions, where the shot is aimed relative to the
opponent, the rally length, the ratings involved), the stroke, the tactic chosen, and the label — whether the hitter
went on to win the point (${pc(base)} of rows).

## What it found

${(()=>{const t=k=>tacRate.find(q=>q.t===k)||{p:0,n:0};return[
`- **The learning generalises.** ${lcv?`Tactics learned from scratch win ${pool2('inSample')} points more than untrained play against opponents met in training, and ${pool2('heldOut')} against opponents never met (4-fold cross-validation over players).`:'(run learning-cv.js)'}`,
`- **Situation predicts the point better than chance, not by much.** On unseen matches a decision tree is right ${pc(test.tree.accuracy)} of the time (macro-F1 ${f3(test.tree.macroF1)}) against ${pc(test.majority.accuracy)} for always guessing the hitter wins; the most informative single facts are ${mi.slice(0,3).map(q=>LABEL[q.k]).join(', ')}.`,
`- **Measured play recovers the real styles.** K-means on 14 style measures puts the counterpunchers together and the offensive baseliners together (adjusted Rand ${f3(bestKM.ari)} against the known labels); KNN guesses ${loo.filter(q=>q.truth===q.pred).length} of 13 players' styles from their play alone.`,
`- **Net play is out of balance.** A pass down the line wins ${pc(t('passline').p)} of its points, a plain volley only ${pc(t('volley').p)} and a smash ${pc(t('smash').p)}; on tour the player at the net wins most of those points and a smash nearly always does. This is why serve-and-volley players struggle in the game, and it is the next thing to fix.`].join('\n');})()}

## 1. Looking at the data

**Entropy.** The label carries H = ${f3(Hy)} bits — almost a coin flip. Most of a point is decided by what happens
*after* any single shot, so no feature of one shot can say much; the question is which say anything at all.

**Mutual information** measures, in bits, how much knowing a feature reduces that uncertainty (continuous features
cut into eight equal-count bins first):

<picture><source media="(prefers-color-scheme: dark)" srcset="mi-dark.svg"><img src="mi-light.svg" alt="Mutual information between each feature and winning the point"></picture>

**Pearson correlation** with the label (linear only; mutual information also catches non-linear links):

| Feature | r |
|---|---|
${corr.slice().sort((a,b)=>Math.abs(b.r)-Math.abs(a.r)).map(q=>`| ${LABEL[q.k]} | ${q.r>=0?'+':''}${f3(q.r)} |`).join('\n')}

**Features that move together** (|r| ≥ 0.4), so a model gains little from having both:

${pairs.length?pairs.map(p=>`- ${LABEL[p.a]} ↔ ${LABEL[p.b]}: r = ${f2(p.r)}`).join('\n'):'- none'}

**Win rate by tactic** (training rows):

| Tactic | Shots | Hitter wins the point |
|---|---|---|
${tacRate.map(t=>`| ${t.t} | ${t.n.toLocaleString('en-US')} | ${pc(t.p)} |`).join('\n')}

**Feature selection.** Keeping only the *m* features with the most mutual information, a depth-5 tree scores
(5-fold cross-validation on the training set, macro-F1):

| Features kept | Macro-F1 | Accuracy |
|---|---|---|
${sel.map(s=>`| ${s.m}${s.m===bestSel.m?' ← used':''} | ${f3(s.f1)} ± ${f3(s.f1Sd)} | ${pc(s.acc)} |`).join('\n')}

Kept: ${bestSel.keep.map(k=>LABEL[k]||k).join(', ')}.

## 2. Structure: the players' styles

Each player's play is summed up in ${PF.length} measures taken from the matches, not from the ratings: ${PF.join(', ')}
(shares of shots by kind, average distance from the net, rally length, serve and return points won, winners and
errors per point). Standardised, then **PCA**: the first two components hold ${pc(pca.explained[0])} and
${pc(pca.explained[1])} of the variance.

- PC1: ${load(0).map(q=>`${q.k} ${q.w>0?'+':'−'}${f2(Math.abs(q.w))}`).join(', ')}
- PC2: ${load(1).map(q=>`${q.k} ${q.w>0?'+':'−'}${f2(Math.abs(q.w))}`).join(', ')}

<picture><source media="(prefers-color-scheme: dark)" srcset="styles-dark.svg"><img src="styles-light.svg" alt="Players on the first two principal components, coloured by K-means cluster"></picture>

**K-means** on the standardised measures, k chosen by silhouette:

| k | Silhouette | Agreement with the known styles (adjusted Rand) |
|---|---|---|
${kmRuns.map(r=>`| ${r.k}${r.k===bestKM.k?' ← chosen':''} | ${f3(r.sil)} | ${f3(r.ari)} |`).join('\n')}

${clusters.map((c,i)=>`- **Cluster ${i+1}:** ${c.map(n=>`${n} (${STYLE[n]})`).join(', ')}`).join('\n')}

The known styles are the tennis world's labels: serve and volley (Sampras, McEnroe), all-court (Federer, Alcaraz),
offensive baseliner (Djokovic, Nadal, Sinner, Agassi, Zverev) and counterpuncher (Murray, Medvedev, de Minaur, Borg).

**KNN, leave-one-out:** each player's style predicted from the three most similar other players (distance-weighted
vote, measures standardised): **${loo.filter(q=>q.truth===q.pred).length} of ${loo.length}** right (${pc(looAcc)}).

| Player | Known style | Predicted from play | Most similar player |
|---|---|---|---|
${loo.map(q=>`| ${q.name} | ${q.truth} | ${q.pred}${q.pred===q.truth?'':' ✗'} | ${q.nearest} |`).join('\n')}

## 3. Models: can a shot's situation predict the point?

Task: from one shot's situation and choice, predict whether its hitter wins the point. Two classifiers, on the
features kept above:

- **Decision tree** (CART, Gini impurity, leaves of at least 60 shots). Depth by cross-validation:
${depthCV.map(r=>`depth ${r.d}: ${f3(r.f1)}`).join(' · ')} → **depth ${bestD.d}**.
- **KNN** (z-scored features, scaling fitted on each training fold only, distance-weighted vote; up to 5,000
training rows per fold to keep the Θ(n²) cost reasonable). k by cross-validation: ${kCV.map(r=>`k=${r.k}: ${f3(r.f1)}`).join(' · ')}
→ **k = ${bestK.k}**.

What a depth-3 tree on every feature learns (training set):

\`\`\`
${small.rules().join('\n')}
\`\`\`

Most important features of the chosen tree (share of the impurity it removes): ${imp.map(q=>`${q.k} ${pc(q.v)}`).join(', ')}.

## 4. Evaluation on unseen matches

**Split.** Shots of one match share players and conditions, so the split is by match: ${pc(TE.length/rows.length)} of
rows (${new Set(at(groups,TE)).size} whole matches) are held out as the **test set** and used once, at the end.
Everything above — feature selection, depth, k — was chosen by **5-fold cross-validation inside the training set**,
also grouped by match.

| Model (test set) | Accuracy | Precision | Recall | F1 | Macro-F1 |
|---|---|---|---|---|---|
${sc(test.majority,'Always "the hitter wins" (baseline)')}
${sc(test.tactic,'Tactic only (its training win rate)')}
${sc(test.tree,`Decision tree, depth ${bestD.d}`)}
${sc(test.knn,`KNN, k = ${bestK.k}`)}

Positive class: the hitter wins the point.

**Confusion matrices** (test set):

| Model | True positive | False negative | False positive | True negative |
|---|---|---|---|---|
${cmT(test.tactic.cm,'Tactic only')}
${cmT(test.tree.cm,'Decision tree')}
${cmT(test.knn.cm,'KNN')}

**Reading it.** ${test.tree.accuracy>test.majority.accuracy+.01?`The models beat the baseline by ${((Math.max(test.tree.accuracy,test.knn.accuracy)-test.majority.accuracy)*100).toFixed(1)} points of accuracy`:'The models barely beat the baseline'}:
a single shot's situation does carry information about the point — chiefly ${mi.slice(0,3).map(q=>LABEL[q.k]).join(', ')} — but
tennis points are long chains of shots, and most of the outcome is decided later. That is the honest ceiling for
this task, and it is why the players learn from whole points rather than from single shots.

### Cross-validating the tactics learning itself

The question that matters for the players: is what they learn real, or just fitted to the opponents they trained
against? The thirteen players are dealt into folds; in each, the players outside the fold learn from scratch against
each other only, then play opponents they trained against (in-sample) and the fold's players, whom they never met
(held out).

${lcvMd}

## Complexity of what runs here

| Step | Time | Space | Notes |
|---|---|---|---|
| Pearson, entropy, mutual information | Θ(n) per feature | O(distinct values) | counting in a hash map |
| Binning for mutual information | Θ(n log n) | Θ(n) | one sort for the cut points, then binary search per value |
| Grouped split / k-fold | Θ(n) | Θ(n) | Fisher–Yates shuffle of the match ids |
| Decision tree, fit | Θ(depth · d · n log n) | Θ(n) | each node sorts its rows per feature and sweeps the thresholds once |
| Decision tree, predict | Θ(depth) per row | — | |
| KNN, predict | Θ(n·d + n log k) per row | Θ(k) heap | a bounded max-heap keeps the k nearest; sorting all n would be Θ(n log n) |
| PCA | Θ(n·d²) + O(d³) per Jacobi sweep | Θ(d²) | d = ${PF.length} |
| K-means | Θ(n·k·d) per iteration | Θ(k·d) | k-means++ starts, best of 50 restarts |
| Silhouette | Θ(n²·d) | Θ(k) | n = 13 players |

## Algorithms and data structures in the code, and where they are not used

Used where the problem calls for them:

| Where | Problem | What is used | Cost |
|---|---|---|---|
| \`tools/loadorder.py\` (every build) | 79 source files must load after whatever they use while loading | a graph of load-time dependencies; **topological sort** (Kahn's algorithm) with a **min-heap** so ties keep the manifest's order; **BFS** for how far a load-time call can reach; **DFS** with white/grey/black colours to name a cycle | O((V + E) log V) for the sort, O(V·(V + E)) for the reach; V = 79 files |
| \`KNN\` | the k nearest of n rows | a bounded **max-heap** (priority queue) | Θ(n log k) instead of Θ(n log n) |
| \`DecisionTree\` | the best threshold for a feature | **sorting** the node's rows once, then one sweep | Θ(n log n) instead of Θ(n²) |
| \`Stats.bin\` | which bin each value falls in | **binary search** over the sorted cut points | O(log q) per value |
| \`Stats.entropy\`, mutual information | counting outcomes per value | **hash map** | Θ(n) |
| \`Validation\` | random splits and folds | **Fisher–Yates** shuffle | Θ(n) |
| the game's \`Tactics\` | the learned value of a tactic in a situation, looked up at every choice | nested **hash maps** (player → situation → tactic) | O(1) per lookup |
| the game's \`Tournament\` | the draw | a complete **binary tree** stored level by level (quarter-finals → final); a winner moves to slot ⌊i/2⌋ of the next round | O(1) per result |

Not used, on purpose:

- **Dijkstra, Floyd–Warshall, Prim.** Players run straight lines across an open court; the only obstacle is the net,
  and the one walking route that has to avoid it (to and from the tunnel) is three fixed waypoints. A shortest-path
  search would recompute what is already known. Nothing needs a spanning tree.
- **Warshall's transitive closure** would also give the load-time reach above; with 79 files either is instant, and
  a BFS from the few files that are actually called while loading does less work than closing the whole graph (Θ(V³)).
- **BST / AVL tree.** Nothing ordered changes while it is being searched: rankings and seedings of thirteen players
  are sorted once.
- **Linked lists, stacks, queues for the match itself.** A match is a handful of coroutines (the point, the ball
  kids, the walk-on) stepped every tick; with at most a dozen of them, a list scanned once per tick is the simplest
  thing that works. A priority queue of timed events would only pay off with thousands.

## Reproduce

\`\`\`
node tools/analysis/collect.js 2        # play every pairing twice and record every shot (a few minutes)
node tools/analysis/learning-cv.js 4 3  # 4-fold cross-validation of the tactics learning (about half an hour)
node tools/analysis/analyze.js          # this page and its charts
\`\`\`
`;
fs.writeFileSync(path.join(OUT,'README.md'),md);log('wrote training/analysis/README.md and four charts');
