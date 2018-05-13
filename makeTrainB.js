const fs = require('fs');
const NIDS_VERSION = 1;

const kdd = fs.readFileSync(__dirname+'/KDDTrain+.arff.txt', 'utf8').split(/(\r?\n)+/g);
const output = {version: NIDS_VERSION, data: []};
const data = output.data;
kdd.forEach((l, i) => {
  l = l.replace(/\r?\n/gi, '');
  if(l == "" || l[0] == '@') return;
  l = l.split(/,/g);
  data.push([l[1], l[2], l[3], l[6], l[l.length - 1]]);
});
fs.writeFileSync(__dirname+'/train_b.json', JSON.stringify(output), 'utf8');
