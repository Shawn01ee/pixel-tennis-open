// constants — aerodynamic constant, net tape radius, and the bits a physics step reports
const KA=.5*AIR*PI*BALL.R*BALL.R/BALL.M, TAPE_R=.015;
const HIT=Object.freeze({BOUNCE:1,TAPE:2,MESH:4});
