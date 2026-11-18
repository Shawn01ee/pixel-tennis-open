// Trophy — each event's cup, drawn in pixels: the four majors in the manner of the real four, the rest after the
// trophies of the ATP tour. 46 × 54 pixels, shown enlarged with hard edges, each standing on the bottom row. A shape is a
// list of half-widths, one per row, shaded as metal (or marble, or wood) in stadium light; handles are drawn as lines.
//   ao       the Pixel Tennis Open (Australian Open): a wide vase after the Warwick Vase, like the Norman Brookes
//            Challenge Cup — flared lip, big vine handles, no lid
//   rg       the Terre Battue Open (Roland Garros): a wide silver bowl with vine leaves at the rim and swan-necked handles
//            on a tall marble base, like the Coupe des Mousquetaires
//   wb       the Old Lawn Championships (Wimbledon): a silver-gilt cup with a lid crowned by a pineapple, no plinth
//   us       the Big City Open (US Open): a tall sterling loving cup with long handles on a black base, as Tiffany's
//   masters  a Masters 1000: a tall lidded cup on a wooden plinth with a name plate
//   a500     an ATP 500: a silver bowl with ring handles on a wooden plinth
//   a250     an ATP 250: a smaller two-handled cup on a wooden plinth
//   ch       a Challenger: a small cup on a navy plinth
class Trophy{
  static W=46;static H=54;static cache=new Map();
  static SILVER=['#fbfdff','#dfe6f0','#b3bdcc','#838ea3','#566078'];
  static GOLD=['#fdf0a0','#f4d44a','#dcae2c','#a4781c','#6a4a12'];
  static MARBLE=['#f4f3ec','#e4dcc4','#c8cdd8','#9aa1b3'];
  static WOOD=['#5a3d2c','#3f2a20','#2a1c17'];
  static BLACK=['#4a4f63','#2f3344','#1c1f2e'];
  static NAVY=['#3166b4','#25468a','#1a2c5c'];
  static NAMES={ao:'The Pixel Tennis Open Cup',rg:'The Terre Battue Open Cup',wb:'The Old Lawn Championships Cup',us:'The Big City Open Cup',
    masters:'A Masters 1000 trophy',a500:'An ATP 500 trophy',a250:'An ATP 250 trophy',ch:'A Challenger trophy'};
  static MAJOR={pto:'ao',tbo:'rg',olc:'wb',bco:'us'};
  // the cup for an event: a major's by its venue (key or name), else by its tier
  static keyFor(tier,venue){
    if(tier==='gs'||!tier){const v=typeof venue==='string'?(Venue.MAJORS.find(m=>m.key===venue||m.name===venue)||null):venue;return Trophy.MAJOR[v&&v.key]||'ao';}
    return tier==='m1000'?'masters':tier==='a500'?'a500':tier==='a250'?'a250':'ch';
  }
  static url(key='ao'){if(!Trophy.cache.has(key))Trophy.cache.set(key,Trophy.draw(key).toDataURL());return Trophy.cache.get(key);}
  static img(cls='trophy',key='ao'){return`<img class="${cls}" src="${Trophy.url(key)}" alt="${Trophy.NAMES[key]||''}" width="${Trophy.W}" height="${Trophy.H}">`;}
  // metal seen in stadium light: a bright streak left of centre, a fainter one near the right edge
  static tone(u){const d=Math.abs(u+.38);return d<.13?0:d<.42?1:u>.55&&u<.8?1:d<.85?2:d<1.15?3:4;}
  static draw(key){
    const W=Trophy.W,H=Trophy.H,cx=W>>1,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
    const px=new Map(),put=(x,y,c)=>px.set(x+','+y,c);
    const shade=(pal,t)=>pal[Math.min(pal.length-1,Math.round(t*(pal.length-1)/4))];
    const row=(y,hw,pal,k=0)=>{for(let x=-hw;x<=hw;x++)put(cx+x,y,shade(pal,Math.min(4,Trophy.tone(hw?x/hw:0)+k)));};
    const rows=(y0,hws,pal,band=-1)=>hws.forEach((w,i)=>row(y0+i,w,pal,i===band?1:0));
    // a handle: a 2-pixel line through the points (x from the centre), mirrored on both sides
    const handle=(pts,pal)=>{for(const s of[-1,1])for(let i=0;i+1<pts.length;i++){const[a,b]=[pts[i],pts[i+1]],n=Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]),1);
      for(let j=0;j<=n;j++){const x=Math.round(a[0]+(b[0]-a[0])*j/n),y=Math.round(a[1]+(b[1]-a[1])*j/n);put(cx+s*x,y,pal[s<0?1:3]);put(cx+s*(x+1),y,pal[s<0?2:4]);}}};
    const plinth=(y0,h,hw,pal,plate=true)=>{row(y0,hw-1,pal);for(let y=y0+1;y<y0+h-2;y++)row(y,hw,pal);row(y0+h-2,hw+2,pal);row(y0+h-1,hw+2,pal);
      if(plate){const S=Trophy.SILVER,p0=y0+Math.round(h/2)-2;for(let y=p0;y<=p0+3;y++)for(let x=-hw+3;x<=hw-3;x++)put(cx+x,y,y===p0?S[1]:y===p0+3?S[3]:S[2]);
        for(let x=-hw+5;x<=hw-5;x++)if(x%2)put(cx+x,p0+1,S[4]);}};
    const S=Trophy.SILVER,G=Trophy.GOLD;
    switch(key){
      case'rg':{
        handle([[15,13],[18,10],[20,6],[19,3],[17,2],[16,4]],S);                           // swans' necks
        row(8,17,S,1);for(const x of[2,6,10,14])for(const s of[-1,1]){put(cx+s*x,7,S[2]);put(cx+s*(x+1),7,S[3]);}  // vine leaves
        rows(9,[17,16,16,15,14,12,10,8,5],S);rows(18,[2,2,3,5,7],S);
        const M=Trophy.MARBLE;row(23,11,M);for(let y=24;y<44;y++)row(y,10,M);row(44,11,M);
        for(const[x,y]of[[-6,27],[-5,28],[-4,29],[3,31],[4,32],[5,33],[-2,36],[-1,37],[6,39],[-7,41]])put(cx+x,y,M[3]);break;}
      case'wb':{
        put(cx,0,G[3]);put(cx-1,1,G[3]);put(cx+1,1,G[3]);put(cx-2,2,G[4]);put(cx+2,2,G[4]);put(cx,2,G[3]);    // the pineapple's crown
        [2,3,3,3,2].forEach((w,i)=>{for(let x=-w;x<=w;x++)put(cx+x,3+i,G[(x+i)%2?1:3]);});                     // and its body
        rows(8,[2,4,7,9,11],G);row(13,12,G,1);
        handle([[12,15],[16,17],[17,21],[16,25],[12,27]],G);
        rows(14,[12,12,12,12,12,12,11,11,11,10,10,9,9,8,7,6,5,4,3],G,3);rows(33,[2,3,2,4,6,8,9],G);break;}
      case'us':{
        handle([[12,7],[17,9],[18,14],[17,19],[12,23]],S);
        row(5,13,S,1);rows(6,[12,12,12,12,12,11,11,11,11,10,10,10,9,9,9,8,8,7,7,6,5,4,3,2,2],S,2);rows(31,[2,2,3,6,8],S);
        plinth(36,12,10,Trophy.BLACK);break;}
      case'masters':{
        [1,1,2,1].forEach((w,i)=>row(1+i,w,S));[3,6,9,11].forEach((w,i)=>row(5+i,w,S));
        row(9,13,S);row(10,13,S,1);
        const bowl=[12,12,12,12,12,12,11,11,10,10,9,8,7,6,4,3];bowl.forEach((w,i)=>row(11+i,w,S,i===3||i===5?1:0));
        for(let x=-11;x<=11;x++)if((x+22)%3!==1)put(cx+x,15,S[3]);
        [2,2,3,2].forEach((w,i)=>row(27+i,w,S));[4,6,8].forEach((w,i)=>row(31+i,w,S,i===2?1:0));
        for(const s of[-1,1])for(let y=10;y<=21;y++){const q=(y-10)/11,o=14+Math.round(4.2*Math.sin(PI*q)),e=bowl[Math.max(0,y-11)]+1;
          const c=S[s<0?1:3],c2=S[s<0?2:4];put(cx+s*o,y,c);put(cx+s*(o+1),y,c2);if(y<=11||y>=20)for(let x=e;x<o;x++)put(cx+s*x,y,c);}
        plinth(34,16,10,Trophy.WOOD);break;}
      case'a500':{
        handle([[15,19],[18,19],[19,21],[18,23],[15,23]],S);
        row(18,15,S,1);rows(19,[15,14,13,12,10,8,6],S);rows(26,[2,2,5,7],S);plinth(30,10,9,Trophy.WOOD);break;}
      case'a250':{
        handle([[10,13],[14,15],[14,19],[10,21]],S);
        row(12,10,S,1);rows(13,[10,10,10,9,9,8,7,6,5,4,3,2],S,2);rows(25,[2,2,5,6],S);plinth(29,10,8,Trophy.WOOD);break;}
      case'ch':{
        handle([[8,17],[11,18],[11,21],[8,23]],S);
        row(16,8,S,1);rows(17,[8,8,8,7,6,5,4,3,2],S);rows(26,[2,2,5],S);plinth(29,8,7,Trophy.NAVY,false);break;}
      default:{   // ao
        handle([[15,10],[18,8],[20,10],[19,14],[16,17],[13,19]],S);                        // the vine handles
        row(9,16,S,1);row(10,15,S);for(let x=-14;x<=14;x++)if(x%2)put(cx+x,11,S[3]);            // flared lip, egg-and-dart
        rows(11,[14,14,13,13,12,12,11,10,9,7,5],S,0);rows(22,[3,2,3,6,8],S);row(27,9,S,1);row(28,9,S,1);
        plinth(29,13,10,Trophy.WOOD);}
    }
    // a dark outline around the whole silhouette, then everything set down on the bottom row
    const ink='#141a2e',edge=[];
    for(const k of px.keys()){const[x,y]=k.split(',').map(Number);for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const q=(x+dx)+','+(y+dy);if(!px.has(q))edge.push(q);}}
    for(const q of edge)px.set(q,ink);
    let top=1e9,bot=-1e9;for(const k of px.keys()){const y=+k.split(',')[1];top=Math.min(top,y);bot=Math.max(bot,y);}
    const dy=H-1-bot;
    for(const[k,c]of px){const[x,y]=k.split(',').map(Number);g.fillStyle=c;g.fillRect(x,y+dy,1,1);}
    return cv;
  }
}
