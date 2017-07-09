
let packetHandler = require('./packetHandler.js')

var SerialPort = require('serialport');

var port = new SerialPort('/dev/ttyACM0', {
  baudRate: 115200
});


port.on('data', (data) => {
  packetHandler.parseData(data);
});
