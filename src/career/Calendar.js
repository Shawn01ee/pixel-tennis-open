// Calendar — the career's year: the weeks of the season and the events played in each
// The weeks follow the shape of the real ATP year: a January hard-court swing to the summer major (the Pixel Tennis
// Open, two weeks), February indoor and Gulf events, the two-week March Masters; the clay spring through three clay
// Masters to the clay major (the Terre Battue Open); a short grass season to the grass major (the Old Lawn
// Championships); a few weeks of summer clay; the North American hard courts to the late-summer major (the Big City
// Open); the autumn in Asia and indoors. The off-season is not played. Several events share a week, at different
// levels; a player enters one. Event names are invented.
// Each entry: [week, tier, name, weeks it lasts, surface]
class Calendar{
  static EVENTS=[
    [1,'a250','Coral Coast International'],[1,'a250','Southern Cross Classic'],[1,'c125','Velmont Challenger'],[1,'c75','Saltmarsh Challenger'],
    [2,'a250','Lakeshore Open'],[2,'a250','Harbour Lights Classic'],[2,'c100','Duneholm Challenger'],[2,'c50','Kestrel Bay Challenger'],
    [3,'gs','Pixel Tennis Open',2],[3,'c100','Orchard Hill Challenger'],[3,'c50','Fernhollow Challenger'],
    [5,'c125','Greywater Challenger'],[5,'c75','Lindmere Challenger'],
    [6,'a250','Highland Indoor'],[6,'a250','Pinewood Open'],[6,'c100','Copperfield Challenger'],
    [7,'a500','Crown City Open'],[7,'a250','Northwind Indoor'],[7,'c125','Westhaven Challenger'],
    [8,'a500','Jade Coast Championships'],[8,'a250','Seaview Classic'],[8,'c75','Stonebrook Challenger'],
    [9,'a500','Midland Indoor Championships'],[9,'a500','Old Port Open'],[9,'c100','Marrowind Challenger'],
    [10,'m1000','Desert Masters',2],[10,'c125','Elmhaven Challenger'],[11,'c75','Brimvale Challenger'],
    [12,'m1000','Bayside Masters',2],[12,'c100','Ravenmoor Challenger'],[13,'c50','Tidewell Challenger'],
    [14,'c75','Ashgrove Challenger'],[14,'c50','Millbank Challenger'],
    // the clay spring
    [15,'m1000','Riviera Masters',1,'clay'],[15,'c75','Olivegrove Challenger',1,'clay'],
    [16,'a500','Sierra Clay Open',1,'clay'],[16,'a250','Danube Clay Open',1,'clay'],[16,'c125','Terracina Challenger',1,'clay'],
    [17,'m1000','Meseta Masters',2,'clay'],[17,'c100','Ochre Hill Challenger',1,'clay'],[18,'c75','Redstone Challenger',1,'clay'],
    [19,'m1000','Seven Hills Masters',2,'clay'],[19,'c125','Pinecrest Challenger',1,'clay'],[20,'c50','Brickfield Challenger',1,'clay'],
    [21,'a250','Lakeside Clay Open',1,'clay'],[21,'a250','Valley Clay Classic',1,'clay'],[21,'c100','Sandmoor Challenger',1,'clay'],
    [22,'gs','Terre Battue Open',2,'clay'],[22,'c75','Cinderhill Challenger',1,'clay'],[23,'c50','Rustwood Challenger',1,'clay'],
    // the grass
    [24,'a250','Meadow Grass Open',1,'grass'],[24,'a250','Riverside Lawn Classic',1,'grass'],[24,'c125','Willowmead Challenger',1,'grass'],
    [25,'a500','Kingsgate Lawn Championships',1,'grass'],[25,'a500','Greenhill Grass Open',1,'grass'],[25,'c100','Fernbank Challenger',1,'grass'],
    [26,'a250','Seaside Grass Classic',1,'grass'],[26,'a250','Harbour Lawn Open',1,'grass'],[26,'c75','Clovermead Challenger',1,'grass'],
    [27,'gs','Old Lawn Championships',2,'grass'],[27,'c75','Alpine Clay Challenger',1,'clay'],[28,'c50','Lakeview Clay Challenger',1,'clay'],
    // summer clay and the North American hard courts
    [29,'a500','Hanseatic Clay Open',1,'clay'],[29,'a250','Redrock Open'],[29,'c125','Silverlake Challenger'],
    [30,'a500','Capital Summer Open'],[30,'a250','Alpine Clay Open',1,'clay'],[30,'c100','Cindervale Challenger'],
    [31,'m1000','Northern Masters',2],[31,'c75','Harrowgate Challenger'],
    [33,'m1000','Riverside Masters',2],[33,'c100','Glenwick Challenger'],
    [35,'a250','Summit Classic'],[35,'c125','Larkspur Challenger'],
    [36,'gs','Big City Open',2],[36,'c125','Quarry Bay Challenger'],[36,'c75','Wrenfield Challenger'],[37,'c100','Moorcroft Challenger'],[37,'c50','Ebbtide Challenger'],
    [38,'c125','Starling Challenger'],[38,'c75','Hollowmere Challenger'],
    [39,'a250','Ironbridge Indoor'],[39,'a250','Silk Road Open'],[39,'c100','Brackenridge Challenger'],
    [40,'a500','Lantern Bay Championships'],[40,'a500','Starlight Classic'],[40,'c125','Coldwater Challenger'],
    [41,'m1000','Eastern Masters',2],[41,'c100','Driftwood Challenger'],
    [43,'a250','Frostline Indoor'],[43,'a250','Amberley Open'],[43,'c75','Netherby Challenger'],
    [44,'a500','Twin Rivers Indoor'],[44,'a500','Northgate Open'],[44,'c125','Ironmoor Challenger'],
    [45,'m1000','Capital Indoor Masters'],[45,'c100','Pebblecove Challenger'],
    [46,'a250','Winterbourne Indoor'],[46,'c125','Highmoor Challenger'],
    [47,'c100','Thistledown Challenger'],[47,'c75','Rookwood Challenger'],[48,'c75','Calderbank Challenger'],[48,'c50','Mistral Point Challenger'],
  ].map(([wk,tier,name,len=1,surface='hard'],i)=>({id:i,wk,tier,name,len,surface}));
  static WEEKS=52;
  // the events that start in a week of the year (1–52)
  static of(wk){return Calendar.EVENTS.filter(e=>e.wk===wk);}
  // the next week of the year, from wk, in which something is played
  static nextPlayed(wk){for(let k=0;k<Calendar.WEEKS;k++){const w=(wk-1+k)%Calendar.WEEKS+1;if(Calendar.of(w).length)return w;}return wk;}
  static byId(id){return Calendar.EVENTS[id];}
}
