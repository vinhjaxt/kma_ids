const fs = require('fs');
const NIDS_VERSION = 1;

const kdd = fs.readFileSync(__dirname+'/KDDTest+.arff.txt', 'utf8').split(/(\r?\n)+/g);
const data = [];
kdd.forEach((l, i) => {
  l = l.replace(/\r?\n/gi, '');
  if(l == "" || l[0] == '@') return;
  l = l.split(/,/g);
  if(!(isNaN(parseFloat(l[0])) || isNaN(parseFloat(l[4])) || isNaN(parseFloat(l[5])) || isNaN(parseFloat(l[8])) || isNaN(parseFloat(l[22])) || isNaN(parseFloat(l[23]))))
  data.push([parseFloat(l[0]), parseFloat(l[4]), parseFloat(l[5]), parseFloat(l[8]), parseFloat(l[22]), parseFloat(l[23]), l[41]]);
});
fs.writeFileSync(__dirname+'/test_g.json', JSON.stringify(data), 'utf8');
