// BigScreen — the video screens at each end of the bowl, laid out like a stadium scoreboard
// A top band with the event and the set; a row per player (kit colour, serve marker, country, surname, the games of
// each set, the point score in a white box); a bottom band with the serve speed, or the big point in yellow.
// Lettering is Silkscreen at whole multiples of its 8-pixel grid, thresholded to hard edges so it stays pixel-crisp.
class BigScreen{
  static W=320;static H=128;static NAME_X=70;
  constructor(){
    this.cv=document.createElement('canvas');this.cv.width=BigScreen.W;this.cv.height=BigScreen.H;this.g=this.cv.getContext('2d');
    // hard pixels close up; seen from the far end (smaller than the canvas) it is averaged down, so no stroke of a letter drops out
    this.tex=new THREE.CanvasTexture(this.cv);this.tex.magFilter=THREE.NearestFilter;this.tex.minFilter=THREE.LinearMipmapLinearFilter;this.tex.generateMipmaps=true;
    this.last=null;
    // the first draw may come before the web font has loaded: draw again once it has
    if(typeof document!=='undefined'&&document.fonts)document.fonts.load('700 16px Silkscreen').then(()=>{if(this.last)this.draw(this.last);}).catch(()=>{});
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
  // One size of lettering throughout (16 px, twice the font's grid), so the board reads as one piece. Every surname is
  // set at that size, never squeezed to fit: the name column is wide enough for the longest one (DE MINAUR, 116 px)
  draw(s){
    this.last=s;const g=this.g,W=BigScreen.W,H=BigScreen.H,ink='#0b1530',F=16;
    g.fillStyle='#0c1838';g.fillRect(0,0,W,H);
    // top band: the set
    g.fillStyle='#1d4590';g.fillRect(0,0,W,24);g.fillStyle='#f4d44a';g.fillRect(0,24,W,2);
    this.text(s.title,W/2,4,F,'#f4d44a','center',W-12);
    // players: kit colour, serve marker, country, surname, finished sets, the set in play, the points
    s.rows.forEach((r,i)=>{const y=29+i*34;
      if(i)g.fillStyle='#1f3c78',g.fillRect(4,y-2,W-8,1);
      g.fillStyle=hexs(r.col);g.fillRect(3,y+1,5,29);
      if(r.serve){g.fillStyle=ink;g.fillRect(11,y+11,9,9);g.fillStyle='#f4d44a';g.fillRect(12,y+12,7,7);}
      this.text(r.cc||'',22,y+7,F,'#7bb8ea');
      this.text((r.name||'').toUpperCase(),BigScreen.NAME_X,y+7,F,'#f4f3ec');
      // up to four finished sets (best of five) to the left of the set in play
      const n=r.sets.length,done=r.sets.slice(0,-1);done.forEach((v,j)=>this.text(String(v),242-(done.length-1-j)*14,y+7,F,'#6f93c8','center'));
      if(n)this.text(String(r.sets[n-1]),262,y+7,F,'#f4f3ec','center');
      g.fillStyle=r.pt?'#f4f3ec':'#16305f';g.fillRect(276,y+2,40,27);if(r.pt)this.text(r.pt,296,y+7,F,'#0c1838','center',38);});
    // bottom band
    g.fillStyle=s.hot?'#f4d44a':'#13285a';g.fillRect(0,98,W,30);g.fillStyle=s.hot?'#c9a62a':'#1f3c78';g.fillRect(0,98,W,2);
    this.text(s.foot||'',W/2,106,F,s.hot?'#0c1838':'#b0dcf6','center',W-12);
    this.tex.needsUpdate=true;
  }
}
