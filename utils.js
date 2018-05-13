module.exports = function (){
  this.getPayloads = function (packet){
    const payloads = [];
    let payload = packet;
    while(payload.payload){
      payloads.push(payload.payload);
      payload = payload.payload;
    }
    return payloads;
  }
  this.getLastPayload = function (packet){
    let payload = packet;
    while(payload.payload){
      payload = payload.payload;
    }
    return payload;
  }
};
