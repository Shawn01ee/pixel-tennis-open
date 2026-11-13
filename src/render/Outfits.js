// Outfits — what the players, ball kids and umpire wear
// what everybody wears
class Outfits{
  static player(P){const r=P.st,l=r.look,f=!!r.f;return{shirt:l.shirt,sleeve:'sleeve'in l?(l.sleeve??l.skin):l.shirt,shorts:l.shorts,skin:l.skin,hair:l.hair,band:l.band,long:f,skirt:f,sock:0xf4f3ec,shoe:0xf4f3ec,trim:l.shirt,racket:l.racket};}
  static KID=[{shirt:0x2a8088,shorts:0x101a3a,skin:0xd89c70,hair:0x1c1f2e,sock:0xf4f3ec,cap:0x2a8088},{shirt:0x2a8088,shorts:0x101a3a,skin:0xf2c8a0,hair:0x743719,sock:0xf4f3ec,cap:0x2a8088}];
  static UMP={shirt:0x1a2c5c,sleeve:0xf4f3ec,shorts:0x9aa1b3,leg:0x9aa1b3,sock:0x1a2c5c,skin:0xf2c8a0,hair:0xc8cdd8,shoe:0x1c1f2e,cap:null};
}
