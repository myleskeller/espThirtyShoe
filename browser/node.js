//  declarations
var express = require('express')
var serveIndex = require('serve-index');
var http = require('http');
var WebSocket = require('ws');
var SerialPort = require('serialport');
var Readline = require('@serialport/parser-readline');
var path = require('path');
var app = express();
var server = http.createServer(app);
var wss = new WebSocket.Server({ server });
var port = new SerialPort("/dev/cu.SLAB_USBtoUART", { baudRate: 115200 });
var parser = port.pipe(new Readline({ delimiter: '\r\n' }));
var inspect = require('eyespect').inspector();
var interfaceAddresses = require('interface-addresses');
var ip_address = interfaceAddresses()["en0"];
// server init
// inspect(addresses, 'network interface IPv4 addresses (non-internal only)')
app.use(express.static(__dirname))
app.use('/', serveIndex(path.join(__dirname, '/')));
app.listen(8080);
console.log('Server started at http:/' + ip_address + ':8080/');
console.log('HTTP listening..');


// websocket init
wss.on('connection', function (ws) {
    ws.on('message', function (message) {
        console.log('WS received: %s', message);
        var terminated_message = message + '\n';
        port.write(terminated_message, function (err) {
            if (err) {
                return console.error('Error on write: ', err.message);
            }
            console.log("USB sent: " + message);
        })
    });
    ws.on('close', () => {
        console.log('WS closed');
    });
    ws.on('open', () => {
        console.log('WS opened');
        ws.send(ip_address);
    });
});
server.listen(process.env.PORT || 81, () => {
    console.log('WS listening..');
});


// serial init
var buffer = "";
port.on('data', function (data) {
    buffer += new String(data);
    var lines = buffer.split("\n");
    while (lines.length > 1) {
        var msg = lines.shift();
        console.log(msg);
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(msg);
            }
        });
    }
    buffer = lines.join("\n");
});
port.on("close", function (err) { console.log("USB closed"); });
port.on("error", function (err) { console.error("USB", err); });
port.on("open", function () { console.log('USB listening..'); });
parser.on('data', console.log);
