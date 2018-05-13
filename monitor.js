// strict
"use strict";

// keep server alive
process.on('uncaughtException', function (err){
  const d = new Date();
  const time = d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear()+' '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds()+'.'+d.getMilliseconds();
  console.error(time+' : ',err);
});

process.env.NODE_ENV = 'production';

const NB_G = require('./naive_bayes_g');
const NB_B = require('./naive_bayes_b');

const TelegramBot = (require('./TelegramBot'))('536034356:AAFcfuM1VPbyjjKR_sH3LgEiQXib-6uB6JQ');

const Train = [];

function predictPacket(packet){
  // console.log(packet);
  // Need an implementation
}

function predictSummary(summary){

  console.log(summary)
  /*
  summary.push(0);
  Train.push(summary);
  var fs = require('fs');
  fs.writeFileSync('new_train.json', JSON.stringify(Train), 'utf8');
  */
  const result = NB_G(summary);
  if(parseInt(result[0])){
    console.log('>> Attack');
    notiPacket = {};
  }else{
    console.log('>> Normal');
  }
}

let notiPacket;
let telegramLastNoti = 0;
setInterval(() => {
  const d = new Date();
  if(notiPacket && d.getTime() - telegramLastNoti >= 5*60*1000) {
    telegramLastNoti = d.getTime();
    const bakPacket = notiPacket;
    notiPacket = null;
    // Fetch some infor of bakPacket
    TelegramBot.sendMessage(`<b>Thông báo</b>\nĐã phát hiện tấn công.`, '@vinhjaxt');
  }
}, 6000);

const pcap = require("./node_pcap");
//const pcap_session = pcap.createSession("", "port not 2222");
const pcap_session = pcap.createSession("", "tcp port 80");
const tcp_tracker  = new pcap.TCPTracker();

console.log("Listening on " + pcap_session.device_name);

pcap_session.on('packet', function (raw_packet) {
  var packet = pcap.decode.packet(raw_packet);
  tcp_tracker.track_packet(packet);
  setImmediate(() => {
    predictPacket(packet);
  });
});

let summary = [0, 0, 0, 0]; // số lượng request
setInterval(() => {
  if(summary.reduce((a,b) => a+b) == 0) return;
  const bakSummary = summary;
  summary = [0, 0, 0, 0];
  predictSummary(bakSummary);
}, 3000);

tcp_tracker.on("session", function (session) {
    session.on("end", function (session) {
      summary[0] += 1;
      const duration = session.close_time - session.connect_time;
      summary[1] += duration;
      summary[2] += session.send_bytes_payload;
      summary[3] += session.recv_bytes_payload;
    });
});

