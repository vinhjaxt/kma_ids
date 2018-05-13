const testData = require('./test_g.json');
const NB_G = require('./naive_bayes_g');

const res = {total: 0, T: 0, F: 0};
testData.forEach((v) => {
  const predicted = NB_G(v);
  res.total++;
  if(predicted[0] == v[v.length - 1])
    res.T++;
  else
    res.F++;
});

console.log('Du doan chinh xac: ', (100*res.T / res.total).toFixed(2)+'%');
console.log('Du doan khong chinh xac: ', (100*res.F / res.total).toFixed(2)+'%');
