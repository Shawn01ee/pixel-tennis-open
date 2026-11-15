// commentary — words for shots, used in captions and tags
const DESC={drive:'with the drive',flat:'with a flat drive',cross:'cross court',line:'down the line',angle:'on the sharp angle',drop:'with the drop shot',lob:'with the lob',passline:'with a pass down the line',passcross:'with a cross-court pass',smash:'with the smash',volley:'at the net',open:'into the open court',behind:'behind him',deep:'from deep',dip:'at his feet',putaway:'with the put-away volley',dropvolley:'with a drop volley',slice:'with the slice',approach:'behind the approach',safe:'from the back',serve:'off the serve'};
const NAME={drive:'drive',flat:'flat drive',cross:'cross-court drive',line:'drive down the line',angle:'sharp angle',drop:'drop shot',lob:'lob',passline:'pass',passcross:'pass',smash:'smash',volley:'volley',open:'drive',behind:'drive',deep:'deep ball',dip:'dipping ball',putaway:'put-away volley',dropvolley:'drop volley',slice:'slice',approach:'approach',safe:'rally ball',serve:'return'};
// the calls, as shown and spoken in Korean; the English is spoken where the device has no Korean voice
//   NET    the serve touched the net (a let if it then lands in, a fault if it does not)
//   FAULT  a serve that lands outside the box or does not get over;  OUT  a rally ball outside the court
//   LET    a serve that touched the net and landed in: the same serve again
const CALLS={NET:{ko:'네트',en:'Net'},FAULT:{ko:'폴트',en:'Fault'},OUT:{ko:'아웃',en:'Out'},LET:{ko:'렛',en:'Let'}};
const CHAIR_CALLS={first:{ko:'퍼스트 서브',en:'First serve.'},second:{ko:'세컨드 서브',en:'Second serve.'},df:{ko:'더블 폴트',en:'Double fault.'}};
const TAG={drive:'Drive',flat:'Flat',drop:'Drop shot',lob:'Lob',passline:'Passing shot',passcross:'Passing shot',smash:'Smash',dropvolley:'Drop volley',angle:'Sharp angle',approach:'Approach',slice:'Slice',volley:'Volley',putaway:'Put-away',behind:'Wrong-footed',dip:'At the feet'};
