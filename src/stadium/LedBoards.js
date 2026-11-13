// LedBoards — scrolling LED text for the courtside boards and the stand ribbon
// scrolling LED text shared by the courtside boards and the ribbon round the stands
class LedBoards{
  constructor(){
    this.cv=document.createElement('canvas');this.cv.width=512;this.cv.height=16;this.g=this.cv.getContext('2d');
    this.tex=new THREE.CanvasTexture(this.cv);this.tex.minFilter=this.tex.magFilter=THREE.NearestFilter;this.tex.generateMipmaps=false;this.tex.wrapS=THREE.RepeatWrapping;
    this.key='';this.flash=0;this.draw(['PIXEL TENNIS OPEN','SUMMER OF TENNIS']);
  }
  draw(msgs,hot=false){
    const k=msgs.join('|')+hot;if(k===this.key)return;this.key=k;
    const g=this.g;g.fillStyle=hexs(hot?0x1a2c5c:0x101a3a);g.fillRect(0,0,512,16);
    const n=msgs.length,w=512/n,cols=hot?['#f4d44a','#f4f3ec']:['#f4f3ec','#7bb8ea','#f4d44a'];
    msgs.forEach((m,i)=>{const cx=w*i+w/2;g.fillStyle=hexs(0x0e0f1a);g.fillRect(w*i,0,1,16);
      PixelFont.center(g,'*',w*i+10,5,hexs(0x4a8ed4),1);PixelFont.center(g,m,cx,3,cols[i%cols.length],2);});
    this.tex.needsUpdate=true;
  }
  scroll(dt){this.tex.offset.x=(this.tex.offset.x+dt*.02)%1;}
}
