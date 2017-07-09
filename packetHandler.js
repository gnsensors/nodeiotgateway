let crc = require('crc');

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};



module.exports.state = 'looking for header';
module.exports.headerSequenceCount = 0;
module.exports.databuffer = []

module.exports.reset = function() {
  this.state = 'looking for header';
  this.headerSequenceCount = 0;
  this.databuffer = [];
}

module.exports.parseData = function(data) {

  for (i = 0; i < data.length; i++) {
    this.updateState(data[i]);
    //console.log(this.state)
  }
}

module.exports.processPacket = function() {
  console.log('processPacket:');

  //strip off 32bit CRC
  let crcArray = new Buffer(this.databuffer.slice(-4));
  let remoteCRC = crcArray.readUInt32LE(0);

  //remove the CRC from the array and calculate what we received
  this.databuffer.remove(-4, -1);

  //let abuffer = new Uint8Array(this.databuffer);

  let abuffer = new Buffer(this.databuffer);

  let localCRC = crc.crc32(abuffer)

  console.log('\tlocal  CRC: ' + localCRC);
  console.log('\tremote CRC: ' + remoteCRC);

  if (localCRC === remoteCRC) {

    //copy databuffer into new array
    let x = [];
    let y = [];
    let z = [];
    let i = 0;
    while (i < abuffer.length) {
      x.push(abuffer.readInt16LE(i));

      i = i + 2;
      y.push(abuffer.readInt16LE(i));
      i = i + 2;
      z.push(abuffer.readInt16LE(i));
      i = i + 2;

    }
    console.log('\tValid Packet of length: ' + x.length + ', sent to cloud');

  } else {
    console.log('\tbad packet, throw out');
  }
  this.databuffer = [];
}

module.exports.updateState = function(val) {

  switch (this.state) {

    case "looking for header":
      if (val === 0xAA) {
        this.headerSequenceCount++;
      } else {
        this.headerSequenceCount = 0;
      }
      if (this.headerSequenceCount === 4) {
        this.headerSequenceCount = 0;
        this.state = 'looking for SYNC 1';
        console.log('found header');

      }
      break;

    case "looking for SYNC 1":
      if (val === 0xFF) {

        console.log('found sync 1');
        this.state = 'looking for SYNC 2';

      } else {
        console.log('bad sync 1');
        this.reset();
        //this.state = 'looking for header';
      }
      break;

    case "looking for SYNC 2":

      if (val === 0x00) {
        console.log('found sync 2');
        this.state = 'getting length LSB';
      } else {
        console.log('bad sync 2');
        this.reset();
        //this.state = "looking for header";
      }
      break;
    case "getting length LSB":
      console.log('Getting Packet Length:')
      this.lengthLSB = val;
      this.state = 'getting length MSB';
      console.log('\tLength LSB= ' + this.lengthLSB);
      break;

    case "getting length MSB":
      this.payloadLength = 0;
      this.payloadCounter = 0;
      this.lengthMSB = val;
      this.payloadLength = this.lengthLSB + this.lengthMSB * 256;

      this.state = 'capturing payload'
      console.log('\tLength MSB= ' + this.lengthMSB);
      console.log('\tPayload Length=' + this.payloadLength)
      console.log('Capturing Payload:');

      break;

    case 'capturing payload':
      if (this.payloadCounter < this.payloadLength) {
        this.databuffer.push(val);
        this.payloadCounter++
      } else {
        console.log('captured data:' + this.databuffer.length)
        this.processPacket();

        this.reset();
        //this.state = 'looking for header';
      }
      break;
  }
}
