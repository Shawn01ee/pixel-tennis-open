// roster — the players: eight of today's field and five legends, scaled from the real players' measurable game
// rank: one ranking across both eras; a tournament seeds its eight players by it
// h: height in metres (the figure is drawn to it); hand: 1 right, −1 left
// v m/s top speed, a m/s² acceleration; s1/s2: average first and second serve in m/s (54 m/s ≈ 195 km/h)
// power: ball speed off the ground; spin: forehand topspin in rpm; err: error scale (lower is steadier); aggr: risk taking
// acc: placement spread (lower lands closer to where it was aimed; 1 is tour average)
// net/drop/lob/slice: how often they choose it; deep: how far back they stand to return; sv: serve-and-volley rate
// kick: topspin on the second serve in rpm, when it is not simply what the forehand spin implies
// trait: the player's signature (see Traits.js) — not shown among the ratings
// ohb: one-handed backhand
// face: what the portrait is assembled from (see ui/Portrait.js)
// look: kit colours; sleeve: null → sleeveless
const SKIN={fair:0xf2c8a0,tan:0xe0b088,olive:0xd29a6c,bronze:0xc88a5c},WHITE=0xf4f3ec,INK=0x1c1f2e;
const ROSTER=[
 {name:'Novak Djokovic',short:'Djokovic',face:{hair:'short',brow:2,shape:'oval',beard:'none',eye:0x4a5a3a},trait:'returnWall',acc:0.6,cc:'SRB',rank:3,hand:1,h:1.88,v:7.0,a:13.5,power:1.04,spin:2700,err:.74,aggr:.5,net:.22,drop:.4,lob:.4,slice:.35,deep:.4,s1:54,s2:41,sv:.04,bounces:6,
  look:{shirt:0x3166b4,shorts:WHITE,skin:SKIN.tan,hair:0x241a16,band:null,racket:WHITE},style:'Best return in the game, never misses'},
 {name:'Rafael Nadal',short:'Nadal',face:{hair:'bandana',brow:2,shape:'oval',beard:'stubble'},trait:'heavyForehand',acc:0.75,cc:'ESP',rank:4,hand:-1,h:1.85,v:7.0,a:14,power:1.12,spin:3300,err:.78,aggr:.5,net:.3,drop:.36,lob:.4,slice:.35,deep:.95,s1:51.5,s2:39.5,sv:.03,bounces:5,
  look:{shirt:0x8a3ea0,sleeve:null,shorts:INK,skin:SKIN.bronze,hair:0x2e1a12,band:WHITE,racket:0xf4d44a},style:'Lefty, the heaviest topspin forehand'},
 {name:'Carlos Alcaraz',short:'Alcaraz',face:{hair:'fade',brow:2,shape:'square',beard:'stubble'},trait:'disguise',acc:0.8,cc:'ESP',rank:2,hand:1,h:1.83,v:7.2,a:14.5,power:1.12,spin:3000,err:.86,aggr:.72,net:.45,drop:.8,lob:.35,slice:.35,deep:.5,s1:54,s2:40,sv:.12,bounces:3,
  look:{shirt:0x4f9a3e,sleeve:null,shorts:WHITE,skin:SKIN.olive,hair:0x1a1410,band:null,racket:WHITE},style:'Explosive all-court, drop shots'},
 {name:'Roger Federer',short:'Federer',face:{hair:'wavy',brow:1,shape:'oval',beard:'none'},trait:'firstStrike',acc:0.68,cc:'SUI',rank:5,hand:1,ohb:true,h:1.85,v:6.8,a:13.5,power:1.06,spin:2700,err:.84,aggr:.72,net:.55,drop:.4,lob:.2,slice:.85,deep:.15,s1:54,s2:41,sv:.3,bounces:3,
  look:{shirt:WHITE,shorts:INK,skin:SKIN.tan,hair:0x4a3020,band:WHITE,racket:INK},style:'Attacks early, slice and net play'},
 {name:'Jannik Sinner',short:'Sinner',face:{hair:'curly',brow:1,shape:'long',beard:'none',freckles:true,eye:0x5a7a8a},trait:'cleanStrike',acc:0.7,cc:'ITA',rank:1,hand:1,h:1.91,v:6.9,a:13.5,power:1.14,spin:2850,err:.78,aggr:.68,net:.2,drop:.25,lob:.2,slice:.2,deep:.4,s1:55.5,s2:41,sv:.03,bounces:4,
  look:{shirt:0xf4d44a,shorts:INK,skin:SKIN.fair,hair:0xc8602a,band:null,racket:WHITE},style:'Hardest clean hitting off both wings'},
 {name:'Daniil Medvedev',short:'Medvedev',face:{hair:'thin',brow:1,shape:'long',beard:'stubble',eye:0x5a7a8a},trait:'octopus',acc:0.82,cc:'RUS',rank:11,hand:1,h:1.98,v:6.8,a:12.5,power:.98,spin:2000,err:.78,aggr:.3,net:.12,drop:.15,lob:.3,slice:.3,deep:1,s1:55.5,s2:39,sv:0,bounces:3,
  look:{shirt:0x2a8088,shorts:WHITE,skin:SKIN.fair,hair:0x9a7a54,band:null,racket:0x3166b4},style:'Flat wall from far behind the baseline'},
 {name:'Alexander Zverev',short:'Zverev',face:{hair:'long',brow:1,shape:'long',beard:'stubble',chain:true,eye:0x5a7a8a},trait:'bigServe',acc:1.1,cc:'GER',rank:10,hand:1,h:1.98,v:6.5,a:12,power:1.08,spin:2400,err:.92,aggr:.55,net:.15,drop:.1,lob:.2,slice:.2,deep:.6,s1:58,s2:41,sv:.05,bounces:5,
  look:{shirt:0xdc4a3c,shorts:INK,skin:SKIN.olive,hair:0xd8b060,band:WHITE,racket:INK},style:'Huge first serve, rock-solid backhand'},
 {name:'Alex de Minaur',short:'de Minaur',face:{hair:'crop',brow:2,shape:'oval',beard:'moustache'},trait:'counterpunch',acc:0.95,cc:'AUS',rank:13,hand:1,h:1.83,v:7.3,a:14.5,power:.94,spin:2100,err:.82,aggr:.4,net:.25,drop:.2,lob:.5,slice:.4,deep:.5,s1:51.5,s2:38,sv:.03,bounces:3,
  look:{shirt:0x7bb8ea,shorts:0x101a3a,skin:SKIN.olive,hair:0x3a2418,band:null,racket:0xf0664a},style:'Home favourite, fastest man on tour'},
 // ── legends: each at the level of their best years ──
 {name:'Pete Sampras',short:'Sampras',legend:true,face:{hair:'curly',brow:2,shape:'oval',beard:'none'},trait:'serveVolley',acc:0.78,cc:'USA',rank:6,hand:1,ohb:true,h:1.85,v:6.8,a:13.5,power:1.08,spin:2300,err:.82,aggr:.7,net:.7,drop:.2,lob:.2,slice:.6,deep:.3,s1:56.5,s2:41.5,kick:3400,sv:.8,bounces:3,
  look:{shirt:WHITE,shorts:WHITE,skin:SKIN.olive,hair:0x1c1410,band:null,racket:INK},style:'Serve and volley, the best second serve ever'},
 {name:'Björn Borg',short:'Borg',legend:true,face:{hair:'long',brow:1,shape:'long',beard:'stubble',eye:0x5a7a8a},trait:'iceman',acc:0.78,cc:'SWE',rank:8,hand:1,h:1.80,v:7.2,a:14.5,power:.98,spin:2900,err:.72,aggr:.35,net:.3,drop:.2,lob:.5,slice:.25,deep:.9,s1:51,s2:39.5,sv:.15,bounces:4,
  look:{shirt:WHITE,shorts:0x24386e,skin:SKIN.tan,hair:0xd8b866,band:0xdc4a3c,racket:0x8a5a2c},style:'Ice-cool baseliner, topspin before its time'},
 {name:'Andre Agassi',short:'Agassi',legend:true,face:{hair:'bald',brow:2,shape:'oval',beard:'stubble'},trait:'earlyBall',acc:0.68,cc:'USA',rank:7,hand:1,h:1.80,v:6.9,a:14,power:1.1,spin:2500,err:.8,aggr:.7,net:.15,drop:.25,lob:.3,slice:.15,deep:.1,s1:52,s2:40,sv:0,bounces:3,
  look:{shirt:0x2b2f44,shorts:WHITE,skin:SKIN.tan,hair:0x5a4636,band:null,racket:0xdc4a3c},style:'Takes the ball early, punishing returns'},
 {name:'Andy Murray',short:'Murray',legend:true,face:{hair:'wavy',brow:2,shape:'long',beard:'stubble'},trait:'lobAndPass',acc:0.74,cc:'GBR',rank:9,hand:1,h:1.91,v:7.1,a:14,power:1.02,spin:2500,err:.76,aggr:.38,net:.3,drop:.45,lob:.75,slice:.55,deep:.6,s1:54,s2:37.5,sv:.03,bounces:4,
  look:{shirt:0x4a5a70,shorts:INK,skin:SKIN.fair,hair:0x4a3222,band:null,racket:INK},style:'Defends everything, lobs and passes at will'},
 {name:'John McEnroe',short:'McEnroe',legend:true,face:{hair:'curly',brow:1,shape:'oval',beard:'none'},trait:'softHands',acc:0.66,cc:'USA',rank:12,hand:-1,h:1.80,v:7.0,a:14,power:.96,spin:1700,err:.82,aggr:.75,net:.85,drop:.6,lob:.3,slice:.7,deep:.2,s1:50,s2:39,kick:3100,sv:.85,bounces:2,
  look:{shirt:0x1f2f6a,shorts:WHITE,skin:SKIN.fair,hair:0x5a3a22,band:0xdc4a3c,racket:0x8a5a2c},style:'Lefty serve-and-volley, the softest hands'},
].map((o,i)=>new PlayerProfile({f:0,...o,id:i}));
