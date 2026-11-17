// Outfits — what the players, ball kids and umpire wear
// what everybody wears
class Outfits{
  // white: the grass major's dress code, everything white but the trim of the kit's own colour
  static player(P,white=false){const r=P.st,l=r.look,f=!!r.f,W=0xf4f3ec,sh=white?W:l.shirt;
    return{shirt:sh,sleeve:'sleeve'in l?(l.sleeve??l.skin):sh,shorts:white?W:l.shorts,skin:l.skin,hair:r.face&&r.face.hair==='bald'?l.skin:l.hair,band:white&&l.band?W:l.band,long:f,skirt:f,sock:W,shoe:W,trim:white?(l.shirt===W?0x1c1f2e:l.shirt):l.shirt,racket:l.racket};}
  static KID=[{shirt:0x2a8088,shorts:0x101a3a,skin:0xd89c70,hair:0x1c1f2e,sock:0xf4f3ec,cap:0x2a8088},{shirt:0x2a8088,shorts:0x101a3a,skin:0xf2c8a0,hair:0x743719,sock:0xf4f3ec,cap:0x2a8088}];
  static UMP={shirt:0x1a2c5c,sleeve:0xf4f3ec,shorts:0x9aa1b3,leg:0x9aa1b3,sock:0x1a2c5c,skin:0xf2c8a0,hair:0xc8cdd8,shoe:0x1c1f2e,cap:null};
}
