// Prizes — the trophy ceremony's set: the stage, the carpet, the table, the trophy and the runner-up's plate
// All drawn from instanced boxes and discs each frame, like the people, so they can be carried and lifted.
class Prizes{
  static SILVER=0xdfe6f0;static SHADE=0xb3bdcc;static WOOD=0x3f2a20;
  // the cup: dark plinth, stem with a knop, a deep bowl with two looped handles, a domed lid. y is its foot
  static trophy(B,x,y,z,yaw,k=1){
    const S=Prizes.SILVER,H=Prizes.SHADE,cx=Math.cos(yaw),cz=-Math.sin(yaw);
    B.box(x,y+.05*k,z,.17*k,.1*k,.17*k,yaw,Prizes.WOOD);B.box(x,y+.104*k,z,.135*k,.012*k,.135*k,yaw,H);
    B.box(x,y+.17*k,z,.045*k,.12*k,.045*k,yaw,S);B.box(x,y+.22*k,z,.09*k,.028*k,.09*k,yaw,H);
    B.box(x,y+.31*k,z,.2*k,.16*k,.2*k,yaw,S);B.box(x,y+.39*k,z,.235*k,.024*k,.235*k,yaw,H);
    B.box(x,y+.425*k,z,.12*k,.05*k,.12*k,yaw,S);B.box(x,y+.465*k,z,.034*k,.04*k,.034*k,yaw,H);
    for(const s of[-1,1]){B.box(x+cx*s*.15*k,y+.32*k,z+cz*s*.15*k,.028*k,.13*k,.028*k,yaw,S);B.box(x+cx*s*.125*k,y+.385*k,z+cz*s*.125*k,.05*k,.022*k,.028*k,yaw,S);}
  }
  // the runner-up's plate, upright and facing (fx,fz)
  static plate(B,x,y,z,fx,fz){
    B.seg('disc',x,y-.24,z,x,y+.24,z,.48,.02,0xd8a830,fx,0,fz);
    B.seg('disc',x+fx*.01,y-.21,z+fz*.01,x+fx*.01,y+.21,z+fz*.01,.42,.01,Prizes.SILVER,fx,0,fz);
    B.seg('disc',x+fx*.02,y-.12,z+fz*.02,x+fx*.02,y+.12,z+fz*.02,.24,.006,Prizes.SHADE,fx,0,fz);
  }
  // the stage (it rises as c.dais goes 0 → 1), a carpet running from it toward the camera, the prize table
  static stage(B,c){
    const{D,T,az,fx,fz}=c,h=.32*c.dais;if(h<.01)return;
    B.box(D.x,h/2,D.z,1.7,h,1.25,az,0x1f2f6a);B.box(D.x,h+.006,D.z,1.5,.012,1.05,az,0x25468a);
    B.box(D.x+fx*.63,h*.5,D.z+fz*.63,1.7,.05,.02,az,0xf4d44a);
    const L=2.9*c.dais;B.box(D.x+fx*(.6+L/2),.012,D.z+fz*(.6+L/2),.9,.012,L,az,0x7a1f2b);
    for(const s of[-1,1])B.box(D.x+fx*(.6+L/2)+Math.cos(az)*s*.47,.014,D.z+fz*(.6+L/2)-Math.sin(az)*s*.47,.05,.014,L,az,0xd8a830);
    B.box(T.x,.37,T.z,.95,.74,.55,az,0xf4f3ec);B.box(T.x,.6,T.z+0,.97,.08,.57,az,0x25468a);
    if(c.trophy==='table')Prizes.trophy(B,T.x-Math.cos(az)*.18,.74,T.z+Math.sin(az)*.18,az,1);
    if(c.plate==='table'){const px=T.x+Math.cos(az)*.24,pz=T.z-Math.sin(az)*.24;B.box(px,.77,pz,.08,.06,.06,az,Prizes.WOOD);Prizes.plate(B,px,.98,pz,fx,fz);}
  }
}
