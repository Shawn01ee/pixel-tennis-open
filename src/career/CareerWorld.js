// CareerWorld — everyone on the career's ranking: the thirteen roster players at the top, at their best (peak Elo),
// and below them invented players for every place down to 500. An invented player ranked r has the Elo of that place
// on the line through the real Elo list, give or take its real scatter (CareerData.ELO_RANK), and plays like one of
// the thirteen (CareerProfile). Names, countries, looks and who plays like whom are drawn from the career's seed: the
// same world every time the career is loaded.
class CareerWorld{
  static FIRST=['Luca','Mateo','Jonas','Tomas','Hugo','Leo','Marco','Felix','Adrian','Nico','Elias','Oscar','Pablo','Ivan','Kai','Theo','Bruno','Dario','Emil','Viktor','Rafael','Simon','Arne','Milan','Yuto','Ren','Diego','Sami','Aaron','Lukas','Noah','Erik','Matias','Andrej','Kenji','Omar','Filip','Henri','Joel','Ruben'];
  static PRE=['Bar','Cor','Dal','Fen','Gar','Hal','Kel','Lor','Mar','Nor','Ost','Pel','Ros','Sal','Tor','Val','Wes','Zan','Bren','Cas','Dov','Fal','Gre','Iv','Jar','Kas','Lin','Mor','Nav','Pra','Rav','Ser','Tal','Vor','Wal','Yar','Bel','Cad','Ell','Hov'];
  static SUF=['ani','berg','dahl','enko','esco','ford','ini','ski','vic','sson','ard','ier','ez','ston','ley','mann','etti','olo','ade','ov','ens','aux','ero','unen','holm','ac','ida','ura','an','well'];
  static CC=['FRA','ITA','ESP','USA','ARG','GER','AUS','GBR','SRB','CZE','JPN','CHI','CAN','NED','BEL','POR','POL','SUI','SWE','NOR','DEN','AUT','BRA','COL','KAZ','CHN','KOR','HUN','CRO','GRE','FIN','RSA','IND','MEX'];
  static SHIRT=[0x3166b4,0xdc4a3c,0x4f9a3e,0xf4d44a,0x8a3ea0,0x2a8088,0xf0664a,0x1f2f6a,0x7bb8ea,0x4a5a70,0xf4f3ec,0x2b2f44,0xd9a514,0xb4dc68];
  static HAIR=[0x241a16,0x3a2418,0x5a4636,0x9a7a54,0xd8b060,0xc8602a,0x1c1410,0x4a3020];
  static STYLES=['short','fade','wavy','curly','crop','long','thin','bald'];
  // a few words for the way of playing each roster player stands for
  static ARCH={Djokovic:'All-round baseliner',Nadal:'Heavy topspin baseliner',Alcaraz:'All-court, drop shots',Federer:'Attacking all-court',
    Sinner:'Flat first strike',Medvedev:'Deep defender',Zverev:'Big server',"de Minaur":'Counterpuncher',Sampras:'Serve and volley',
    Borg:'Topspin baseliner',Agassi:'Early-ball hitter',Murray:'Defender, lobs and passes',McEnroe:'Serve and volley, soft hands'};
  constructor(seed){this.seed=seed;this.cache=new Map();
    // the thirteen, by their roster ranking
    this.stars=[...ROSTER].sort((a,b)=>a.rank-b.rank);
  }
  get size(){return WorldRanking.SIZE;}
  // the player at a place on the ranking: {rank, kind:'star'|'gen', elo, profile()}
  at(r){
    let e=this.cache.get(r);if(e)return e;
    if(r<=this.stars.length){const p=this.stars[r-1];e={rank:r,kind:'star',key:'s'+p.id,elo:CareerProfile.peak(p),p};}
    else{const g=new Rng((this.seed*7919+r*104729)|0),A=ROSTER[Math.floor(g.next()*ROSTER.length)],elo=EloModel.atRank(r)+g.normal(CAREER_DATA.ELO_RANK.SD);
      const pick=a=>a[Math.floor(g.next()*a.length)],last=pick(CareerWorld.PRE)+pick(CareerWorld.SUF),first=pick(CareerWorld.FIRST),lefty=g.next()<.12,ohb=g.next()<.12;
      const skin=pick([SKIN.fair,SKIN.tan,SKIN.olive,SKIN.bronze]),hair=pick(CareerWorld.HAIR);
      const o={id:1000+r,name:`${first} ${last}`,short:last,cc:pick(CareerWorld.CC),rank:r,hand:lefty?-1:1,ohb,
        face:{hair:pick(CareerWorld.STYLES),brow:1+(g.next()<.5?1:0),shape:pick(['oval','long','square']),beard:pick(['none','none','stubble','moustache'])},
        look:{shirt:pick(CareerWorld.SHIRT),shorts:g.next()<.5?WHITE:INK,skin,hair,band:g.next()<.2?WHITE:null,racket:pick([WHITE,INK,0xdc4a3c,0x3166b4])},
        style:`${CareerWorld.ARCH[A.short]||'Baseliner'} · plays like ${A.short}`};
      e={rank:r,kind:'gen',key:'g'+r,elo,arch:A,o};}
    this.cache.set(r,e);return e;
  }
  // the match profile of a player of the world (built once)
  profile(e){if(e.kind==='star')return e.p;return e.prof||(e.prof=CareerProfile.make(e.arch,e.elo,e.o));}
}
