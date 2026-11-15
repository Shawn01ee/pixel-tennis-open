// Trophy — the Pixel Tennis Open Cup, drawn in pixels
// A tall silver two-handled cup with a domed lid on a dark plinth, in the manner of the great summer hard-court
// trophies. 46 × 54 pixels, shown enlarged with hard edges. The silhouette is a list of half-widths, one per row.
class Trophy{
  static W=46;static H=54;static cached=null;
  static SILVER=['#fbfdff','#dfe6f0','#b3bdcc','#838ea3','#566078'];
  static WOOD=['#5a3d2c','#3f2a20','#2a1c17'];
  static url(){return Trophy.cached||(Trophy.cached=Trophy.draw().toDataURL());}
  static img(cls='trophy'){return`<img class="${cls}" src="${Trophy.url()}" alt="The Pixel Tennis Open Cup" width="${Trophy.W}" height="${Trophy.H}">`;}
  // silver seen in stadium light: a bright streak left of centre, a fainter one near the right edge
  static tone(u){const d=Math.abs(u+.38);return d<.13?0:d<.42?1:u>.55&&u<.8?1:d<.85?2:d<1.15?3:4;}
  static draw(){
    const W=Trophy.W,H=Trophy.H,cx=W>>1,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
    const px=new Map(),put=(x,y,c)=>px.set(x+','+y,c),S=Trophy.SILVER,Wd=Trophy.WOOD;
    const row=(y,hw,pal=S,k=0)=>{for(let x=-hw;x<=hw;x++){const t=Trophy.tone(hw?x/hw:0);put(cx+x,y,pal===S?S[Math.min(4,t+k)]:pal[t<2?0:t<4?1:2]);}};
    // finial and lid
    [1,1,2,1].forEach((w,i)=>row(1+i,w));[3,6,9,11].forEach((w,i)=>row(5+i,w));
    // rim, bowl with an engraved band, tapering to the stem
    row(9,13);row(10,13,S,1);
    const bowl=[12,12,12,12,12,12,11,11,10,10,9,8,7,6,4,3];bowl.forEach((w,i)=>row(11+i,w,S,i===3||i===5?1:0));
    for(let x=-11;x<=11;x++)if((x+22)%3!==1)put(cx+x,15,S[3]);                   // the band's pattern
    // stem with a knop, and the foot
    [2,2,3,2].forEach((w,i)=>row(27+i,w));[4,6,8].forEach((w,i)=>row(31+i,w,S,i===2?1:0));
    // the two looped handles
    for(const s of[-1,1])for(let y=10;y<=21;y++){const q=(y-10)/11,o=14+Math.round(4.2*Math.sin(PI*q)),e=bowl[Math.max(0,y-11)]+1;
      const c=S[s<0?1:3],c2=S[s<0?2:4];put(cx+s*o,y,c);put(cx+s*(o+1),y,c2);
      if(y<=11||y>=20)for(let x=e;x<o;x++)put(cx+s*x,y,c);}
    // plinth: dark wood with a silver plate for the champions' names
    row(34,9,Wd);row(35,9,Wd);for(let y=36;y<=47;y++)row(y,10,Wd);row(48,12,Wd);row(49,12,Wd);
    for(let y=39;y<=43;y++)for(let x=-7;x<=7;x++)put(cx+x,y,y===39?S[1]:y===43?S[3]:S[2]);
    for(let x=-5;x<=5;x++){if(x%2)put(cx+x,40,S[4]);if((x+1)%3)put(cx+x,42,S[4]);}
    // a dark outline around the whole silhouette
    const ink='#141a2e',edge=[];
    for(const k of px.keys()){const[x,y]=k.split(',').map(Number);for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const q=(x+dx)+','+(y+dy);if(!px.has(q))edge.push(q);}}
    for(const q of edge)px.set(q,ink);
    for(const[k,c]of px){const[x,y]=k.split(',').map(Number);g.fillStyle=c;g.fillRect(x,y,1,1);}
    return cv;
  }
}
