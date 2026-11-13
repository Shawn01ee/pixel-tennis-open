// Palette — the 64-colour palette and its OKLab lookup table
// small render target, no AA, depth outlines, 64 colours matched in OKLab
THREE.ColorManagement.enabled=false;
const PAL=[
 0x0e0f1a,0x1c1f2e,0x2f3344,0x4a4f63,0x6f7589,0x9aa1b3,0xc8cdd8,0xf4f3ec,
 0x101a3a,0x1a2c5c,0x25468a,0x3166b4,0x4a8ed4,0x7bb8ea,0xb0dcf6,0xe2f4fb,
 0x123a4a,0x1c5a6a,0x2a8088,
 0x0b2018,0x123324,0x1b4a2c,0x2a6a34,0x3f8a3c,0x5ea644,0x86c250,0xb4dc68,0xdff08e,
 0x2e1510,0x4d2417,0x743719,0xa04c22,0xc8662c,0xe08440,0xeca866,0xf5cc98,0xfbe6c8,
 0x3e0e1c,0x701828,0xa82430,0xd83c36,0xf0664a,0xf89a78,
 0x6a4a12,0xa4781c,0xdcae2c,0xf4d44a,0xfdf0a0,
 0xf2c8a0,0xd89c70,0xa8683f,0x6c402c,
 0x241640,0x3e2464,0x64368a,0x9658a0,0xd07c9c,0xf4aca4,
 0x8a8270,0xb8ae94,0xe4dcc4,
 0x16302a,0x28483c,0xb83a2c];
const hexc=c=>[(c>>16&255)/255,(c>>8&255)/255,(c&255)/255];
// every colour on screen snaps to the nearest palette entry, found in OKLab and baked into a 32³ lookup
class Palette{
  static s2l(c){return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);}
  static oklab(r,g,b){r=Palette.s2l(r);g=Palette.s2l(g);b=Palette.s2l(b);
    const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
    return[.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s];}
  static buildLUT(){
    const S=32,data=new Uint8Array(S*S*S*4),lab=PAL.map(c=>Palette.oklab((c>>16&255)/255,(c>>8&255)/255,(c&255)/255));
    for(let b=0,i=0;b<S;b++)for(let g=0;g<S;g++)for(let r=0;r<S;r++,i+=4){
      const q=Palette.oklab((r+.5)/S,(g+.5)/S,(b+.5)/S);let bd=1e9,bi=0;
      for(let k=0;k<lab.length;k++){const L=lab[k],dl=(q[0]-L[0])*1.15,da=q[1]-L[1],db=q[2]-L[2],d=dl*dl+da*da+db*db;if(d<bd){bd=d;bi=k;}}
      const c=PAL[bi];data[i]=c>>16&255;data[i+1]=c>>8&255;data[i+2]=c&255;data[i+3]=255;}
    const t=new THREE.DataTexture(data,S*S,S,THREE.RGBAFormat,THREE.UnsignedByteType);
    t.minFilter=t.magFilter=THREE.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;return t;
  }
}
