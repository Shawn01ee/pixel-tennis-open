// Portrait — a pixel-art head-and-shoulders of a player, drawn from the roster's description of their face
// 26 × 30 pixels, shown enlarged with hard edges. Each face is assembled from a few parts — head shape, hair style,
// brows, beard — in the player's own colours, so a new player needs a description, not a drawing.
class Portrait{
  static W=26;static H=30;static cache=new Map();
  static mix(a,b,t){const ch=s=>[(s>>16)&255,(s>>8)&255,s&255],A=ch(a),B=ch(b);return(Math.round(lerp(A[0],B[0],t))<<16)|(Math.round(lerp(A[1],B[1],t))<<8)|Math.round(lerp(A[2],B[2],t));}
  // a data URL, drawn once per player
  static url(p){let u=Portrait.cache.get(p.id);if(!u){u=Portrait.draw(p).toDataURL();Portrait.cache.set(p.id,u);}return u;}
  static img(p,cls='face'){return`<img class="${cls}" src="${Portrait.url(p)}" alt="" width="${Portrait.W}" height="${Portrait.H}">`;}
  static draw(p){
    const W=Portrait.W,H=Portrait.H,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
    const f=Object.assign({hair:'short',beard:'none',brow:1,shape:'oval',eye:0x3a2a20},p.face||{}),L=p.look,mix=Portrait.mix;
    const px=(x,y,c,w=1,h=1)=>{g.fillStyle=hexs(c);g.fillRect(x,y,w,h);};
    const skin=L.skin,skD=mix(skin,0x5a2a1a,.28),skL=mix(skin,0xffffff,.18),hair=L.hair,hD=mix(hair,0x000000,.35),hL=mix(hair,0xffffff,.22),INK=0x0e0f1a;
    const long=f.shape==='long',x0=long?9:8,x1=long?16:17,y0=long?6:7,y1=long?22:21,ey=y0+6,sq=f.shape==='square';
    // backdrop: the court, with the kit colour as a band behind the shoulders
    px(0,0,0x1a2c5c,W,H);for(let y=0;y<H;y++)for(let x=0;x<W;x++)if((x+y*2)%7===0)px(x,y,0x25468a);
    px(0,H-8,mix(L.shirt,0x101a3a,.72),W,8);
    // shoulders, shirt and neck
    const sleeveless=('sleeve'in L)&&L.sleeve==null,shirt=L.shirt,shD=mix(shirt,0x000000,.28);
    for(let y=25;y<H;y++){const a=y===25?6:y===26?4:3,b=W-1-a;for(let x=a;x<=b;x++){const edge=x<a+3||x>b-3;px(x,y,sleeveless&&edge?(x>b-2?skD:skin):(x>b-4?shD:shirt));}}
    for(let y=y1-1;y<=25;y++)for(let x=10;x<=15;x++)px(x,y,y<=y1+1?skD:x>=14?skD:skin);
    px(11,25,skin,4,1);px(12,26,skin,2,1);px(10,25,shD);px(15,25,shD);px(11,26,shD);px(14,26,shD);
    if(f.chain){px(11,24,0xf4d44a);px(12,25,0xf4d44a,2,1);px(14,24,0xf4d44a);}
    // head
    const inset=y=>y===y0?2:y===y0+1?1:y===y1?(sq?2:3):y===y1-1?(sq?1:2):y===y1-2?(sq?0:1):0;
    const face=(x,y)=>y>=y0&&y<=y1&&x>=x0+inset(y)&&x<=x1-inset(y);
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(face(x,y))px(x,y,x>=x1-1-inset(y)+1&&x===x1-inset(y)?skD:x===x0+inset(y)&&y<y0+8?skL:skin);
    for(let y=ey-1;y<=ey+1;y++){px(x0-1,y,skin);px(x1+1,y,skD);}
    // eyes, brows, nose, mouth
    const bc=mix(hair,INK,f.brow>1?.55:.3);
    px(x0+2,ey,0xf4f3ec);px(x0+3,ey,f.eye);px(x1-3,ey,f.eye);px(x1-2,ey,0xf4f3ec);
    px(x0+1,ey-2,bc,3,1);px(x1-3,ey-2,bc,3,1);if(f.brow>1){px(x0+2,ey-3,bc,2,1);px(x1-3,ey-3,bc,2,1);}
    const cx=(x0+x1)>>1;px(cx+1,ey+1,skD,1,3);px(cx,ey+3,skD);
    px(cx-1,ey+5,0x8a4338,4,1);px(cx,ey+6,skD,2,1);
    // beard: stubble is a dither of hair colour over the jaw; a moustache is a solid bar
    const beardC=mix(skin,hair,.3);
    if(f.beard==='stubble'||f.beard==='beard')for(let y=ey+3;y<=y1;y++)for(let x=x0;x<=x1;x++){if(!face(x,y))continue;const mouth=y===ey+5&&x>=cx-1&&x<=cx+2,nose=y===ey+3&&(x===cx||x===cx+1);
      if(mouth||nose)continue;if(f.beard==='beard'||(x+y)%2===0)if(y>ey+3||x<cx-1||x>cx+2)px(x,y,f.beard==='beard'?mix(skin,hair,.72):beardC);}
    if(f.beard==='moustache'||f.beard==='beard')px(cx-2,ey+4,mix(hair,INK,.2),6,1);
    if(f.freckles){px(x0+2,ey+2,skD);px(x0+4,ey+3,skD);px(x1-2,ey+2,skD);px(x1-4,ey+3,skD);}
    // hair
    const band=L.band,H_=(x,y,c=hair)=>px(x,y,c),tex=(x,y)=>hash2(x*3+p.id,y*5)>.7?hL:hash2(x+7,y*3+p.id)>.75?hD:hair;
    const cap=(top,l,r,rows)=>{for(let y=top;y<top+rows;y++){const k=y-top,ins=k===0?2:k===1?1:0;for(let x=l+ins;x<=r-ins;x++)H_(x,y,k===0?hL:tex(x,y));}};
    switch(f.hair){
      case'short': cap(y0-3,x0-1,x1+1,4);for(let y=y0+1;y<=y0+3;y++){H_(x0-1,y);H_(x1+1,y,hD);}H_(x0,y0+1);H_(x1,y0+1,hD);break;
      case'crop':  cap(y0-2,x0-1,x1+1,3);for(let x=x0;x<=x1;x+=2)H_(x,y0-3,hL);for(let y=y0+1;y<=y0+2;y++){H_(x0-1,y);H_(x1+1,y,hD);}break;
      case'fade':  cap(y0-3,x0,x1,4);for(let y=y0;y<=y0+3;y++){H_(x0-1,y,mix(skin,hair,.55));H_(x1+1,y,mix(skD,hair,.55));}H_(x0,y0,hair);H_(x1,y0,hD);break;
      case'wavy':  cap(y0-4,x0-2,x1+2,5);for(let x=x0-1;x<=x1+1;x+=3)H_(x,y0-5,hL);for(let y=y0+1;y<=y0+4;y++){H_(x0-2,y);H_(x0-1,y);H_(x1+1,y,hD);H_(x1+2,y,hD);}break;
      case'bandana':cap(y0-3,x0-1,x1+1,3);for(let y=y0+1;y<=y0+10;y++){H_(x0-2,y,tex(x0-2,y));H_(x0-1,y);H_(x1+1,y,hD);H_(x1+2,y,tex(x1+2,y));}break;
      case'long':  cap(y0-4,x0-2,x1+2,5);for(let y=y0+1;y<=y0+11;y++){H_(x0-2,y,tex(x0-2,y));H_(x0-1,y);H_(x1+1,y,hD);H_(x1+2,y,tex(x1+2,y));}if(y0+12<H)H_(x0-2,y0+12,hD),H_(x1+2,y0+12,hD);break;
      case'curly': for(let y=y0-5;y<=y0+1;y++)for(let x=x0-3;x<=x1+3;x++){const e=x===x0-3||x===x1+3||y===y0-5;if(e&&hash2(x*7,y*11+p.id)<.45)continue;if(y>=y0&&x>x0&&x<x1)continue;H_(x,y,tex(x,y));}
                   for(let y=y0+2;y<=y0+5;y++)for(const x of[x0-3,x0-2,x0-1,x1+1,x1+2,x1+3]){if((x===x0-3||x===x1+3)&&hash2(x*5,y*9)<.5)continue;H_(x,y,tex(x,y));}break;
      case'thin':  for(let y=y0-2;y<y0;y++)for(let x=x0+1;x<=x1-1;x++)px(x,y,y===y0-2&&(x===x0+1||x===x1-1)?0x1a2c5c:x===x0+1?skL:skin);
                   for(let x=x0+2;x<=x1-2;x+=2)H_(x,y0-2,mix(skin,hair,.6));for(let y=y0-1;y<=y0+4;y++){H_(x0-1,y,y<y0+1?hL:hair);H_(x1+1,y,hD);}H_(x0,y0-1);H_(x1,y0-1,hD);H_(x0,y0);H_(x1,y0,hD);break;
    }
    if(band!=null&&(f.hair==='bandana'||f.hair==='wavy'||f.hair==='long')){const by=y0;px(x0-1,by,band,x1-x0+3,f.hair==='bandana'?2:1);px(x0-1,by+(f.hair==='bandana'?1:0),mix(band,0x000000,.18),x1-x0+3,1);
      if(f.hair==='bandana'){px(x1+2,by+1,band,2,1);px(x1+3,by+2,band,1,2);px(x1+2,by+3,mix(band,0x000000,.18));}}
    return cv;
  }
}
