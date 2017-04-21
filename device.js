var http = require('http');
var tessel = require('tessel');
var text = require('./common/utils/text');
var tmpl = __dirname + '/' + 'device.html';

var ip = require('./device/ip');
var id = require('./device/id');
var name = require('./device/name');

console.log('------------------------------------------');
console.log(name + ': ' + id);
//console.log('Prod server now running at http://' + ip + ':80');
console.log('Dev  server now running at http://' + ip + ':9100');

/*
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(text(tmpl, [id, ip, name, 'prod']));
}).listen(80);
*/

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(text(tmpl, [id, ip, name, 'dev']));
}).listen(9100);
