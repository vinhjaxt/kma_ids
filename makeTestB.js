const fs = require('fs');
const NIDS_VERSION = 1;

const kdd = fs.readFileSync(__dirname+'/KDDTest+.arff.txt', 'utf8').split(/(\r?\n)+/g);
const data = [];
kdd.forEach((l, i) => {
  l = l.replace(/\r?\n/gi, '');
  if(l == "" || l[0] == '@') return;
  l = l.split(/,/g);
  if(!l[1]) return;
  data.push([l[1], l[2], l[3], l[6], l[l.length - 1]]);
});
fs.writeFileSync(__dirname+'/test_b.json', JSON.stringify(data), 'utf8');
