// BigScreen — the video screens at each end of the bowl, laid out like a stadium scoreboard
// A top band with the event and the set; a row per player (kit colour, serve marker, country, surname, the games of
// each set, the point score in a white box); a bottom band with the serve speed, or the big point in yellow.
// The game renders to a small target, and a screen spans anything from some 60 to 280 of its pixels across depending
// on the view and the window. Drawn larger than it is seen, a board's letters are averaged into a blur (smoothed) or
// lose strokes (not), so it is drawn at about the size it is seen and shown texel for pixel, with no smoothing: 160×64
// in Silkscreen at its own 8-pixel grid when it is seen at least that big, else 110×44 in the game's 3×5 pixel type.
class BigScreen{
  static W=160;static H=64;static NAME_X=35;
  static MODES={big:[160,64],small:[110,44]};
  constructor(){
    this.cv=document.createElement('canvas');this.cv.width=BigScreen.W;this.cv.height=BigScreen.H;this.g=this.cv.getContext('2d');this.mode='big';
    this.tex=new THREE.CanvasTexture(this.cv);this.tex.magFilter=THREE.NearestFilter;this.tex.minFilter=THREE.NearestFilter;this.tex.generateMipmaps=false;
    this.last=null;
    // the first draw may come before the web font has loaded: draw again once it has
    if(typeof document!=='undefined'&&document.fonts)document.fonts.load('700 8px Silkscreen').then(()=>{if(this.last)this.draw(this.last);}).catch(()=>{});
  }
  // the size the screen is seen at, in pixels of the render target: switches the layout (with some slack, so it does not
  // flicker at the edge) and redraws; true when it switched
  fit(px){
    const want=this.mode==='big'?(px<BigScreen.MODES.big[0]*.94?'small':'big'):(px>BigScreen.MODES.big[0]*1.06?'big':'small');
    if(want===this.mode)return false;this.mode=want;const[w,h]=BigScreen.MODES[want];this.cv.width=w;this.cv.height=h;this.tex.dispose();
    if(this.last)this.draw(this.last);return true;
  }
  // text with hard pixel edges: drawn alone, alpha thresholded, coloured, then placed; shrunk to fit maxW if needed
  text(str,x,y,size,col,align='left',maxW=1e9){
    if(!str)return;const t=BigScreen.tmp||(BigScreen.tmp=document.createElement('canvas')),c=t.getContext('2d',{willReadFrequently:true});
    let px=size,w=0;const font=()=>`700 ${px}px Silkscreen, 'Courier New', monospace`;
    for(;;){c.font=font();w=Math.ceil(c.measureText(str).width);if(w<=maxW||px<=8)break;px-=2;}
    t.width=w+2;t.height=Math.ceil(px*1.3);c.font=font();c.textBaseline='top';c.fillStyle='#fff';c.fillText(str,1,Math.round(px*.08));
    const im=c.getImageData(0,0,t.width,t.height),d=im.data;for(let i=3;i<d.length;i+=4)d[i]=d[i]>=110?255:0;c.putImageData(im,0,0);
    c.globalCompositeOperation='source-in';c.fillStyle=col;c.fillRect(0,0,t.width,t.height);c.globalCompositeOperation='source-over';
    const X=align==='center'?x-w/2:align==='right'?x-w:x;this.g.drawImage(t,Math.round(X)-1,Math.round(y+(size-px)/2));
  }
  // s: {title, rows:[{name,cc,col,sets:[…],pt,serve}], foot, hot}
  // One size of lettering throughout (8 px, the font's own grid), so the board reads as one piece. Every surname is set
  // at that size, never squeezed to fit: the name column is wide enough for the longest one (DE MINAUR, 58 px)
  draw(s){
    this.last=s;if(this.mode==='small'){this.drawSmall(s);this.tex.needsUpdate=true;return;}
    const g=this.g,W=BigScreen.W,H=BigScreen.H,ink='#0b1530',F=8;
    g.fillStyle='#0c1838';g.fillRect(0,0,W,H);
    // top band: the set
    g.fillStyle='#1d4590';g.fillRect(0,0,W,12);g.fillStyle='#f4d44a';g.fillRect(0,12,W,1);
    this.text(s.title,W/2,2,F,'#f4d44a','center',W-6);
    // players: kit colour, serve marker, country, surname, finished sets, the set in play, the points
    s.rows.forEach((r,i)=>{const y=14+i*17;
      if(i)g.fillStyle='#1f3c78',g.fillRect(2,y-1,W-4,1);
      g.fillStyle=hexs(r.col);g.fillRect(1,y+1,3,14);
      if(r.serve){g.fillStyle=ink;g.fillRect(5,y+5,5,5);g.fillStyle='#f4d44a';g.fillRect(6,y+6,3,3);}
      this.text(r.cc||'',12,y+4,F,'#7bb8ea');
      this.text((r.name||'').toUpperCase(),BigScreen.NAME_X,y+4,F,'#f4f3ec');
      // up to four finished sets (best of five) to the left of the set in play
      const n=r.sets.length,done=r.sets.slice(0,-1);done.forEach((v,j)=>this.text(String(v),121-(done.length-1-j)*7,y+4,F,'#6f93c8','center'));
      if(n)this.text(String(r.sets[n-1]),131,y+4,F,'#f4f3ec','center');
      g.fillStyle=r.pt?'#f4f3ec':'#16305f';g.fillRect(138,y+1,20,14);if(r.pt)this.text(r.pt,148,y+4,F,'#0c1838','center',19);});
    // bottom band
    g.fillStyle=s.hot?'#f4d44a':'#13285a';g.fillRect(0,49,W,15);g.fillStyle=s.hot?'#c9a62a':'#1f3c78';g.fillRect(0,49,W,1);
    this.text(s.foot||'',W/2,53,F,s.hot?'#0c1838':'#b0dcf6','center',W-6);
    this.tex.needsUpdate=true;
  }
  // the same board at 110×44 in the 3×5 type (4 pixels a letter): a surname keeps its first nine letters
  drawSmall(s){
    const g=this.g,W=110,P=PixelFont,cut=(t,n)=>String(t||'').toUpperCase().slice(0,n);
    g.fillStyle='#0c1838';g.fillRect(0,0,W,44);
    g.fillStyle='#1d4590';g.fillRect(0,0,W,9);g.fillStyle='#f4d44a';g.fillRect(0,9,W,1);P.center(g,cut(s.title,27),W/2,2,'#f4d44a');
    s.rows.forEach((r,i)=>{const y=11+i*11;
      if(i){g.fillStyle='#1f3c78';g.fillRect(2,y-1,W-4,1);}
      g.fillStyle=hexs(r.col);g.fillRect(1,y,2,10);
      if(r.serve){g.fillStyle='#f4d44a';g.fillRect(4,y+3,3,3);}
      P.draw(g,cut(r.cc,3),9,y+3,'#7bb8ea');P.draw(g,cut(r.name,9),24,y+3,'#f4f3ec');
      const n=r.sets.length,done=r.sets.slice(0,-1);done.forEach((v,j)=>P.center(g,String(v),79-(done.length-1-j)*6,y+3,'#6f93c8'));
      if(n)P.center(g,String(r.sets[n-1]),86,y+3,'#f4f3ec');
      g.fillStyle=r.pt?'#f4f3ec':'#16305f';g.fillRect(92,y,17,10);if(r.pt)P.center(g,cut(r.pt,4),101,y+3,'#0c1838');});
    g.fillStyle=s.hot?'#f4d44a':'#13285a';g.fillRect(0,34,W,10);g.fillStyle=s.hot?'#c9a62a':'#1f3c78';g.fillRect(0,34,W,1);
    P.center(g,cut(s.foot,27),W/2,37,s.hot?'#0c1838':'#b0dcf6');
  }
}
