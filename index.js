// strict
"use strict";
const pcap = require("./node_pcap");
const getServices = require('./services-port');
//const getFlag = require('./get-flag');
const NB_G = require('./naive_bayes_g');
const NB_B = require('./naive_bayes_b');
require('./utils')(this);

// keep server alive
process.on('uncaughtException', function (err){
  const d = new Date();
  const time = d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear()+' '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds()+'.'+d.getMilliseconds();
  console.error(time+' : ',err);
});

process.env.NODE_ENV = 'production';

const TelegramBot = (require('./TelegramBot'))('536034356:AAFcfuM1VPbyjjKR_sH3LgEiQXib-6uB6JQ');
const tcp_tracker  = new pcap.TCPTracker();
const pcap_session = pcap.createSession("", "tcp port 80");

// telegram
let notiPacket;
let telegramLastNoti = 0;
setInterval(() => {
  const d = new Date();
  if(notiPacket && d.getTime() - telegramLastNoti >= 5*60*1000) {
    telegramLastNoti = d.getTime();
    const bakPacket = notiPacket;
    notiPacket = null;
    // Fetch some infor of bakPacket
    const time = d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear()+' '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds()+'.'+d.getMilliseconds();
    const osUtils = require('os-utils');
    const os = require('os');
    const cpus = os.cpus();

    let cpuStats = '';
    for(let i = 0, len = cpus.length; i < len; i++) {
      let cpu = cpus[i], total = 0;
      for(let type in cpu.times) {
        total += cpu.times[type];
      }
      for(let type in cpu.times) {
        cpuStats+="\n\t"+type+': '+Math.round(100 * cpu.times[type] / total);
      }
    }
    TelegramBot.sendMessage(
`<b>WARNING</b>
Detected attack:
<b>Time: </b>${time}
<b>Source: </b>${bakPacket.src}
<b>Destination: </b>${bakPacket.dst}

<b>CPU Stats: </b>${cpuStats}
<b>Free mem: </b>${osUtils.freememPercentage().toFixed(2)}%
<b>Avg load 1 min: </b>${osUtils.loadavg(1)}
<b>Avg load 5 min: </b>${osUtils.loadavg(5)}
<b>Avg load 15 min: </b>${osUtils.loadavg(15)}

<i>Auto by KMA_IDS.</i>
`
    , '@vinhjaxt');
  }
}, 6000);
// telegram


let summary = {numberPackets: 0};
pcap_session.on('packet', function (raw_packet) {
  var packet = pcap.decode.packet(raw_packet);
  tcp_tracker.track_packet(packet);
  summary.numberPackets++;
});
console.log("Listening on " + pcap_session.device_name);

let sameServices2s = {};
let sameHosts2s = {};
setInterval(() => {
  sameServices2s = {};
  sameHosts2s = {};
}, 2000);

function processer(session, tcpFlag){

  const recvPayloads = getPayloads(session.recvPacket);
  const lastRecvPayload = recvPayloads[recvPayloads.length - 1];
  const preLastRecvPayload = recvPayloads[recvPayloads.length - 2];
  const stats = session.session_stats();
  const dport = lastRecvPayload.dport;
  if(sameServices2s[dport])
    sameServices2s[dport]++;
  else
    sameServices2s[dport]=1;

  const dhost = preLastRecvPayload.daddr.toString();
  const shost = preLastRecvPayload.saddr.toString();
  if(sameHosts2s[dhost])
    sameHosts2s[dhost]++;
  else
    sameHosts2s[dhost]=1;
  const duration = stats.total_time;
  const protocol_type = lastRecvPayload.decoderName;
  const service = getServices(dport);
  const src_bytes = stats.recv_total;
  const dst_bytes = stats.send_total;
  const flag = tcpFlag;
  const land = shost == dhost ? 1 : 0;
  const urgent = lastRecvPayload.urgentPointer;
  const count = sameHosts2s[dhost];
  const srv_count = sameServices2s[dport];

  const record = [duration, protocol_type, service, src_bytes, dst_bytes, flag, land, urgent, count, srv_count];

  const discrete = [protocol_type, service, flag, land];
  const continuous = [duration, src_bytes, dst_bytes, urgent, count, srv_count];
  
  const predicted_b = NB_B(discrete);
  const predicted_g = NB_G(continuous);
  const predicted = {anomaly: 0, normal: 0};

  predicted['normal'] = predicted_b[2]['normal'] * predicted_g[2]['normal'];
  predicted['anomaly'] = predicted_b[2]['anomaly'] * predicted_g[2]['anomaly'];
  const result = predicted['normal'] > predicted['anomaly'] ? 'normal' : 'anomaly';
  if(result == 'anomaly'){
    console.log('Anomaly');
    notiPacket = session;
  }
  
}

tcp_tracker.on("session", function (session) {
  session.on("syn retry", function (s, f){
    processer(s, 'RSTOS0');
  });
  session.on("reset", function (s, _, f){
    console.log('reset')
    processer(s, 'RSTO');
  });
});
