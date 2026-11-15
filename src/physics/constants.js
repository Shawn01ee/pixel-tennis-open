// constants — aerodynamic constant, net tape radius, and the bits a physics step reports
const KA=.5*AIR*PI*BALL.R*BALL.R/BALL.M, TAPE_R=.015;
// the net tape: the share of its pace a clipped ball keeps (a full catch of the top … the finest touch), and the
// hop it gets off the tape, m/s
const NET_KEEP=[.15,.5], NET_HOP=1.2;
const HIT=Object.freeze({BOUNCE:1,TAPE:2,MESH:4});
