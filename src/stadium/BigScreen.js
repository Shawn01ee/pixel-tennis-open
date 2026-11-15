// BigScreen — the video screens at each end of the bowl, laid out like a stadium scoreboard
// A top band with the event and the set; a row per player (kit colour, serve marker, country, surname, the games of
// each set, the point score in a white box); a bottom band with the serve speed, or the big point in yellow.
// Lettering is Silkscreen at whole multiples of its 8-pixel grid, thresholded to hard edges so it stays pixel-crisp.
class BigScreen{
  static W=256;static H=128;
  constructor(){
    this.cv=document.createElement('canvas');this.cv.width=BigScreen.W;this.cv.height=BigScreen.H;this.g=this.cv.getContext('2d');
    this.tex=new THREE.CanvasTexture(this.cv);this.tex.minFilter=this.tex.magFilter=THREE.NearestFilter;this.tex.generateMipmaps=false;
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
  // What has to be read from the far end — surnames, games, points — is large; the rest is the frame around it
  draw(s){
    this.last=s;const g=this.g,W=BigScreen.W,H=BigScreen.H,ink='#0b1530';
    g.fillStyle='#0c1838';g.fillRect(0,0,W,H);
    // top band
    g.fillStyle='#1d4590';g.fillRect(0,0,W,16);g.fillStyle='#f4d44a';g.fillRect(0,16,W,2);
    this.text('PIXEL TENNIS OPEN',6,4,8,'#cfe4ff');this.text(s.title,W-6,4,8,'#f4d44a','right');
    // players: kit colour, serve marker, country, surname; finished sets small, the set in play and the points large
    s.rows.forEach((r,i)=>{const y=20+i*38;
      if(i)g.fillStyle='#1f3c78',g.fillRect(4,y-2,W-8,1);
      g.fillStyle=hexs(r.col);g.fillRect(3,y+1,5,33);
      if(r.serve){g.fillStyle=ink;g.fillRect(11,y+13,10,10);g.fillStyle='#f4d44a';g.fillRect(12,y+14,8,8);}
      this.text(r.cc||'',24,y+1,8,'#7bb8ea');
      this.text((r.name||'').toUpperCase(),24,y+10,24,'#f4f3ec','left',122);
      const n=r.sets.length,done=r.sets.slice(0,-1);done.forEach((v,j)=>this.text(String(v),156+j*12-(done.length-1)*12,y+15,16,'#6f93c8','center'));
      if(n)this.text(String(r.sets[n-1]),182,y+10,24,'#f4f3ec','center');
      g.fillStyle=r.pt?'#f4f3ec':'#16305f';g.fillRect(202,y+2,50,32);if(r.pt)this.text(r.pt,227,y+6,24,'#0c1838','center',46);});
    // bottom band
    g.fillStyle=s.hot?'#f4d44a':'#13285a';g.fillRect(0,98,W,30);g.fillStyle=s.hot?'#c9a62a':'#1f3c78';g.fillRect(0,98,W,2);
    this.text(s.foot||'',W/2,105,16,s.hot?'#0c1838':'#b0dcf6','center',W-12);
    this.tex.needsUpdate=true;
  }
}
