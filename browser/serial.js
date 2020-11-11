//* socket.io nodejs stuff
var io = require("socket.io").listen(http); // server listens for socket.io communication at port 8000

//* serialport nodejs stuff
const devPath = "/dev/cu.SLAB_USBtoUART";
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline')
const port = new SerialPort(devPath, {
  baudRate: 115200
});
const parser = port.pipe(new Readline({ delimiter: '\r\n' }))

// Read data that is available but keep the stream in "paused mode"
// port.on('readable', function () {
//     console.log('Data:', port.read())
//   })

// Switches the port into "flowing mode"
port.on('data', function (data) {
  // console.log('Data:', data);
  io.sockets.emit("message", data);
});
port.on("close", function (err) {
  console.log("port closed");
});
port.on("error", function (err) {
  console.error("error", err);
});
port.on("open", function () {
  console.log('setup serial. waiting for data.');
});
// Pipe the data into another stream (like a parser or standard out)
parser.on('data', console.log);

//   port.write('Hi Mom!');

// var sp = new SerialPort(portName, {
//   baudrate: 9600
// }); // instantiate the serial port.

// sp.on("close", function (err) {
//   console.log("port closed");
// });

// sp.on("error", function (err) {
//   console.error("error", err);
// });

// sp.on("open", function () {
//   console.log("port opened... Press reset on the Arduino.");
// });

//* socket.io nodejs stuff
io.sockets.on("connection", function (socket) {
  // If socket.io receives message from the client browser then 
  // this call back will be executed.
  socket.on("message", function (msg) {
    console.log(msg);
    //! this is where we put the sauce, boys.
  });
  // If a web browser disconnects from Socket.IO then this callback is called.
  socket.on("disconnect", function () {
    console.log("disconnected");
  });
});

// var cleanData = ""; // this stores the clean data
// var readData = "";  // this stores the buffer
// sp.on("data", function (data) { // call back when data is received

//   console.log("serial port: " + data.toString());

//   readData += data.toString(); // append data to buffer
//   // if the letters "A" and "B" are found on the buffer then isolate what"s in the middle
//   // as clean data. Then clear the buffer.
//   if (readData.indexOf("B") >= 0 && readData.indexOf("A") >= 0) {
//     cleanData = readData.substring(readData.indexOf("A") + 1, readData.indexOf("B"));
//     readData = "";
//     io.sockets.emit("message", cleanData);
//   }
// });