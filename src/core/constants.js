// constants — rule-book court dimensions, ball and air constants, the simulation step
// metres. x across, z along, y up. net at z=0
const CT=Object.freeze({L:11.885,DW:5.485,SW:4.115,SVC:6.40,POST:6.40,STICK:5.029,FX:9.15,FZ:18.3});
const BALL=Object.freeze({R:.0335,M:.0577});
const G=9.81,AIR=1.21,DT=1/120,PI=Math.PI,TAU=2*Math.PI,RPM=TAU/60;
