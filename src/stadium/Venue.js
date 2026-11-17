// Venue — where a match is played: the surface, the court's colours, the stands' colours and the event's name.
// The four majors are the game's own events in the spirit of the real four (names invented):
//   Pixel Tennis Open        January, a summer hard court, blue on blue
//   Terre Battue Open        late May, red clay, the stands in green
//   Old Lawn Championships   late June, grass, players in white, the stands in green and purple
//   Big City Open            late August, a hard court under the lights, blue in green, a loud night crowd
// The surfaces' physics are measured ones (physics/Surface.js); colours are design, all from the game's palette.
class Venue{
  // the stands' brand colours (the bowl is built in blues) mapped to each look's own
  static STANDS={
    blue:null,
    clay:{0x101a3a:0x123324,0x1a2c5c:0x1b4a2c,0x25468a:0x2a6a34,0x3166b4:0x3f8a3c,0x4a8ed4:0xe08440},
    grass:{0x101a3a:0x0b2018,0x1a2c5c:0x123324,0x25468a:0x1b4a2c,0x3166b4:0x2a6a34,0x4a8ed4:0x64368a},
    city:{0x101a3a:0x241640,0x1a2c5c:0x101a3a,0x25468a:0x1a2c5c,0x3166b4:0x25468a,0x4a8ed4:0xdcae2c},
  };
  // the court: run-off and court colours with their speckle, the lettering, and what the surface adds
  static COURTS={
    blue:{out:0x25468a,outS:[0x1a2c5c,0x3166b4],in:0x3166b4,inS:[0x25468a,0x4a8ed4],side:0x3166b4,name:0x4a8ed4},
    city:{out:0x2a6a34,outS:[0x1b4a2c,0x3f8a3c],in:0x25468a,inS:[0x1a2c5c,0x3166b4],side:0x3f8a3c,name:0x5ea644},
    clay:{out:0xc8662c,outS:[0xa04c22,0xe08440,0x743719],in:0xc8662c,inS:[0xa04c22,0xe08440],side:0xa04c22,name:0xe08440,brush:0xa04c22},
    grass:{out:0x3f8a3c,outS:[0x2a6a34,0x5ea644],in:0x3f8a3c,inS:[0x2a6a34,0x5ea644],side:0x2a6a34,name:0x5ea644,stripes:0x5ea644,worn:0xb8ae94,worn2:0x8a8270},
  };
  static MAJORS=[
    {key:'pto',name:'Pixel Tennis Open',tag:'SUMMER OF TENNIS',sub:'Summer hard-court major',month:'January',surface:'hard',look:'blue',phase:'day'},
    {key:'tbo',name:'Terre Battue Open',tag:'ON THE RED CLAY',sub:'Clay-court major',month:'late May',surface:'clay',look:'clay',phase:'day'},
    {key:'olc',name:'Old Lawn Championships',tag:'ON THE GRASS',sub:'Grass-court major',month:'late June',surface:'grass',look:'grass',phase:'day',white:true},
    {key:'bco',name:'Big City Open',tag:'UNDER THE LIGHTS',sub:'Late-summer hard-court major',month:'late August',surface:'hard',look:'city',phase:'night'},
  ].map(o=>new Venue(o));
  constructor(o){Object.assign(this,{look:'blue',tag:'',white:false},o);}
  static major(key){return Venue.MAJORS.find(v=>v.key===key)||Venue.MAJORS[0];}
  static byName(name){return Venue.MAJORS.find(v=>v.name===name)||null;}
  // an event that is not a major: its name on the court, the look of its surface
  static event(name,surface='hard'){return Venue.byName(name)||new Venue({key:'ev',name,surface,look:surface==='hard'?'blue':surface,tag:surface==='clay'?'ON THE RED CLAY':surface==='grass'?'ON THE GRASS':'SUMMER OF TENNIS'});}
  get stands(){return Venue.STANDS[this.look]||null;}
  get court(){return Venue.COURTS[this.look]||Venue.COURTS.blue;}
}
