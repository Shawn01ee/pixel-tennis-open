// Interview — the on-court interview after the person's match
// Two questions drawn from what happened (the round, the score, the opponent, the numbers), each with three ways to
// answer: gracious, confident or playful. The crowd reacts, and the player's following grows with every answer.
class Interview{
  // m: the finished match; t: the tournament (or null); returns [{q, options:[{text, tone, fans, react}]}]
  static build(m,t){
    const H=m.human,O=m.other(H),won=m.result.winner===H,ms=H.ms,name=O.st.short,round=t?['quarter-final','semi-final','final'][Math.min(t.round,2)]:'match';
    const close=/5–3|7–6|6–7|3–5|7–5|5–7/.test(m.result.line),aces=ms.aces,long=m.result.longest||0;
    const opt=(text,tone,fans,react)=>({text,tone,fans,react});
    const Q=[];
    if(won){
      Q.push({q:t&&t.round===2?`You are the champion! How does it feel to lift the trophy here?`:close?`That was tight all the way. What made the difference at the end against ${name}?`:`A convincing win in the ${round}. Did it feel as good as it looked?`,options:[
        opt(`${name} pushed me all the way. I just tried to stay calm on the big points.`,'gracious',3,'Warm applause all around the stadium.'),
        opt(`Honestly? I was hitting it great today. When I play like this, I am hard to beat.`,'confident',2,'A few whistles — and a big cheer from your corner.'),
        opt(`I have no idea. I closed my eyes on a couple of those and they went in.`,'playful',4,'The crowd bursts out laughing.')]});
      Q.push({q:aces>=4?`${aces} aces today. Is the serve the best it has ever been?`:long>=10?`That ${long}-shot rally had everyone on their feet. What goes through your mind in a rally like that?`:t&&t.round<2?`Next up is a bigger match. What do you need to do better?`:`What would you say to the fans who stayed until the last point?`,options:[
        opt(`I have worked hard on it with my team. The credit goes to them.`,'gracious',3,'Your coach gets a round of applause.'),
        opt(`It is getting there. There is more to come, trust me.`,'confident',2,'An excited murmur runs around the stands.'),
        opt(`My legs are asking me the same question. I need an ice bath and a pizza.`,'playful',4,'Laughter, and someone shouts "Pizza!" from the top tier.')]});
    }else{
      Q.push({q:`Tough luck today. What did ${name} do that made it so difficult?`,options:[
        opt(`${name} was simply better today. All credit to a great player.`,'gracious',3,'A generous round of applause for a classy answer.'),
        opt(`I gave that one away. It will not happen again.`,'confident',1,'A hush, then some supportive clapping.'),
        opt(`I think the ball and I had a disagreement. We will talk it over tonight.`,'playful',3,'The crowd laughs with you.')]});
      Q.push({q:`What do you take away from this tournament?`,options:[
        opt(`The support here was unbelievable. Thank you, I will be back.`,'gracious',4,'The whole stadium stands to applaud you off.'),
        opt(`I know my level is there. Next time I am going all the way.`,'confident',2,'A cheer from the fans behind your chair.'),
        opt(`Mostly a sunburn. But also a lot of confidence.`,'playful',3,'Laughter and applause.')]});
    }
    return Q;
  }
}
