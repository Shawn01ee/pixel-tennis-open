// Court — the rule book as queries: net height, in/out, service boxes
// the rule book, as queries
class Court{
  // rule 1: 0.914 m at the strap, 1.07 m at the singles sticks (0.914 m outside the singles line) and posts
  static netHeight(x){const a=Math.abs(x);if(a>=CT.STICK)return 1.07;const u=a/CT.STICK;return .914+.156*u*u;}
  // > 0 inside the singles court; a ball that touches the line is in
  static signedIn(x,z){return Math.min(CT.SW-Math.abs(x),CT.L-Math.abs(z))+BALL.R*.6;}
  // > 0 inside the service box on the sx side (sign of x), on either end
  static signedBox(x,z,sx){return Math.min(CT.SVC-Math.abs(z),CT.SW-Math.abs(x),x*sx)+BALL.R*.6;}
  static inEnclosure(x,z,m=0){return Math.abs(x)<CT.FX-m&&Math.abs(z)<CT.FZ-m;}
}
