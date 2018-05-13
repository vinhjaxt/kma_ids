const testData = require('./test_b.json');
const NB_B = require('./naive_bayes_b');

const res = {total: 0, T: 0, F: 0};
testData.forEach((v) => {
  const predicted = NB_B(v);
  res.total++;
  if(predicted[0] == v[v.length - 1])
    res.T++;
  else
    res.F++;
});

console.log('Du doan chinh xac: ', (100*res.T / res.total).toFixed(2)+'%');
console.log('Du doan khong chinh xac: ', (100*res.F / res.total).toFixed(2)+'%');
