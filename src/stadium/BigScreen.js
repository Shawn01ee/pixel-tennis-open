// BigScreen — the video screens at each end of the bowl
// the two video screens at the ends of the bowl
class BigScreen{
  constructor(){
    this.cv=document.createElement('canvas');this.cv.width=96;this.cv.height=48;this.g=this.cv.getContext('2d');
    this.tex=new THREE.CanvasTexture(this.cv);this.tex.minFilter=this.tex.magFilter=THREE.NearestFilter;this.tex.generateMipmaps=false;
  }
  // s: {title, rows:[{name,col,sets:[…],pt,serve}], foot, hot}
  draw(s){
    const g=this.g;g.fillStyle=hexs(0x101a3a);g.fillRect(0,0,96,48);
    g.fillStyle=hexs(0x25468a);g.fillRect(0,0,96,9);PixelFont.center(g,s.title,48,2,'#f4f3ec');
    s.rows.forEach((r,i)=>{const y=13+i*10;
      g.fillStyle=hexs(r.col);g.fillRect(3,y,3,5);if(r.serve){g.fillStyle='#f4d44a';g.fillRect(8,y+1,3,3);}
      PixelFont.draw(g,r.name.slice(0,9),13,y,'#f4f3ec');
      r.sets.forEach((v,j)=>PixelFont.draw(g,String(v),52+j*7,y,j===r.sets.length-1?'#f4f3ec':'#7bb8ea'));
      g.fillStyle=hexs(0xf4f3ec);g.fillRect(78,y-1,16,7);PixelFont.center(g,r.pt,86,y,'#101a3a');});
    g.fillStyle=hexs(s.hot?0xf4d44a:0x1a2c5c);g.fillRect(0,36,96,12);PixelFont.center(g,s.foot||'',48,39,s.hot?'#101a3a':'#b0dcf6');
    this.tex.needsUpdate=true;
  }
}
