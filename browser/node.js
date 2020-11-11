// //* http server (express) nodejs stuff
const http = require('http');

const express = require('express');
const serveIndex = require('serve-index');
const WebSocket = require('ws');
const app = express();

const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

wss.on('connection', function (ws) {
    ws.on('message', function (message) {
        console.log('received: %s', message);
        var terminated_message = message + '\n';
        port.write(terminated_message, function (err) {
            if (err) {
                return console.log('Error on write: ', err.message);
            }
            console.log("sent " + message + " to serial connection");
        })
    });


    ws.on('close', () => {
        console.log('WebSocket was closed');
    });

    // ws.on('open', function open() {
    //     ws.send('something');
    //   });
});

//start our server
server.listen(process.env.PORT || 81, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});



app.use(express.static('./'));

app.listen(8080);



function onSerial(msg) {
    console.log(msg);
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    });
}



//* serialport nodejs stuff
const devPath = "/dev/cu.SLAB_USBtoUART";
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
var buffer = "";
const port = new SerialPort(devPath, {
    baudRate: 115200
});
const parser = port.pipe(new Readline({ delimiter: '\r\n' }))

// Switches the port into "flowing mode"
port.on('data', function (data) {

    buffer += new String(data);
    var lines = buffer.split("\n");
    while (lines.length > 1)
        onSerial(lines.shift());
    buffer = lines.join("\n");
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
