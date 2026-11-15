// BigScreen — the video screens at each end of the bowl
// the two video screens at the ends of the bowl
class BigScreen{
  constructor(){
    this.cv=document.createElement('canvas');this.cv.width=96;this.cv.height=48;this.g=this.cv.getContext('2d');
    this.tex=new THREE.CanvasTexture(this.cv);this.tex.minFilter=this.tex.magFilter=THREE.NearestFilter;this.tex.generateMipmaps=false;
  }
  // s: {title, rows:[{name,col,sets:[…],pt,serve}], foot, hot}
  // Built to be read from the far end of the court: three-letter names, games and points in double-size letters;
  // only the set title, finished sets and the footer are small
  draw(s){
    const g=this.g;g.fillStyle=hexs(0x101a3a);g.fillRect(0,0,96,48);
    g.fillStyle=hexs(0x25468a);g.fillRect(0,0,96,7);PixelFont.center(g,s.title,48,1,'#f4f3ec');
    s.rows.forEach((r,i)=>{const y=9+i*13;
      g.fillStyle=hexs(r.col);g.fillRect(1,y,3,10);if(r.serve){g.fillStyle='#f4d44a';g.fillRect(5,y+3,3,4);}
      PixelFont.draw(g,BigScreen.code(r.name),10,y,'#f4f3ec',2);
      const done=r.sets.slice(0,-1),cur=r.sets.length?String(r.sets[r.sets.length-1]):'';
      done.forEach((v,j)=>PixelFont.draw(g,String(v),36+j*5,y+5,'#7bb8ea'));
      if(cur)PixelFont.center(g,cur,56,y,'#f4f3ec',2);
      g.fillStyle=hexs(0xf4f3ec);g.fillRect(67,y-1,28,12);PixelFont.center(g,r.pt,81,y,'#101a3a',2);});
    // the footer too in big letters when it fits (BREAK POINT, 176 KM/H), small otherwise
    const ft=s.foot||'',big=PixelFont.width(ft,2)<=94;g.fillStyle=hexs(s.hot?0xf4d44a:0x1a2c5c);g.fillRect(0,36,96,12);PixelFont.center(g,ft,48,big?37:39,s.hot?'#101a3a':'#b0dcf6',big?2:1);
    this.tex.needsUpdate=true;
  }
  // a three-letter code, as on a tour scoreboard: DJO, NAD, DEM
  static code(name){return name.replace(/[^A-Za-z]/g,'').slice(0,3).toUpperCase();}
}
