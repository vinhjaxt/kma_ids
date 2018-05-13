const testData = require('./test.json');
const NB_B = require('./naive_bayes_b');
const NB_G = require('./naive_bayes_g');

const res = {total: 0, T: 0, F: 0};
testData.forEach((v) => {
  const predicted_b = NB_B(v[0]);
  const predicted_g = NB_G(v[1]);
  res.total++;
  const predicted = {anomaly: 0, normal: 0};
  
  predicted['normal'] = predicted_b[2]['normal'] * predicted_g[2]['normal'];
  predicted['anomaly'] = predicted_b[2]['anomaly'] * predicted_g[2]['anomaly'];
  const result = predicted['normal'] > predicted['anomaly'] ? 'normal' : 'anomaly';
  if(result == v[v.length - 1])
    res.T++;
  else
    res.F++;
});

console.log('Du doan chinh xac: ', (100*res.T / res.total).toFixed(2)+'%');
console.log('Du doan khong chinh xac: ', (100*res.F / res.total).toFixed(2)+'%');
