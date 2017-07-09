# nodeIOTGateway
This project is a simple node.js implementation of serial client to read and parse a data stream created by an embedded sensor.  The model for this was built off of [iotNode](https://github.com/gnsensors/iotNode) project.

The code will parse the incoming data stream, validate that the data is correct (checking the packet format and CRC), then the intent is to have it sent to another service probably in the cloud.

# Installation

```
npm install
```

# Usage

```
node main.js
```

# First order of ToDo

- [Done] parse the data into proper units types.  Right now the data array is raw, but the stream needs to be broken into a sequence of 16bit values grouped by 3. These are readings of a 3 axis accelerometer.

- send the parsed data stream to a cloud repo.  Maybe use a simple that just dumps the data into a mongo DB, or perhaps sent to something like Initialstate, freeboard, or others.

- after the sending is working, I would like to process the raw data into FFT bins and send those instead of raw time samples.

- break this code into a serial interface service that captures the bytes and sends to a different service.  Then add an interface to this service to send messages down to the embedded device.
