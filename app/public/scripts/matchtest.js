let x = {
  "l1" : 3,
  "l2" : -2,
  'l3' : 2,
  'l4' : 1,
  'l5' : 0
};
let y = {
  "l1" : -3,
  "l2" : 1,
  'l3' : -1,
  'l4' : -2,
  'l5' : 3,
};
var difference = 0;
var max = 0;
for (key in y){
  max += 6;
  const i = y[key];
  const j = x[key];
  difference += Math.abs(i-j);
};
const percent = (difference/max)*100;
console.log(100-percent);