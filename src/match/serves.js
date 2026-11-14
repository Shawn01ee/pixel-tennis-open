// serves — serve types and the three serve targets
// serves: pace from the profile, topspin, side spin (curve in the air), gyro spin (sideways kick off the court)
// and how far over the tape to aim
const SERVES={
  flat :{name:'Flat', v:st=>st.s1,             rpm:st=>900+st.spin*.15, side:300, gyro:0,   clear:.07,err:1},
  slice:{name:'Slice',v:st=>st.s1*.6+st.s2*.4, rpm:st=>1100+st.spin*.1, side:1700,gyro:0,   clear:.14,err:.86},
  kick :{name:'Kick', v:st=>st.s2,             rpm:st=>2300+st.spin*.3, side:1100,gyro:1500,clear:.40,err:.72},
};
const ZONES={wide:3.72,body:1.9,t:.32};
