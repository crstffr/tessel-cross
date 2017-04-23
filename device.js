var fs = require('fs');
var path = require('path');
var http = require('http');
var tessel = require('tessel');
var text = require('./common/utils/text');

var ip = require('./device/ip');
var id = require('./device/id');
var name = require('./device/name');

tessel.close('B');

console.log('------------------------------------------');
console.log(name + ': ' + id);
console.log('Server now running at http://' + ip + ':9100');

http.createServer(function (req, res) {

    var body = '';
    var www = __dirname + '/public/';

    if (req.method === 'GET') {
        if (req.url === '/') {
            // Serve templated index.html with some device details
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(text(www + 'index.html', [id, ip, name, 'dev']));
        } else {
            // Serve other static files from public folder
            let file = path.join(www, req.url);
            if (fs.existsSync(file)) {
                res.writeHead(200);
                res.end(text(file));
            } else {
                res.writeHead(404);
                res.end();
            }
        }

    } else if (req.method === 'POST') {

        if (req.url === '/chains') {

            req.on('data', function (data) {
                body += data;
                if (body.length > 1e6) {
                    req.connection.destroy(); // flood prevention
                }
            });

            req.on('end', function () {
                if (req.headers['content-type'] === 'application/json') {
                    try { body = JSON.parse(body); }
                    catch(e) {}
                }
                console.log(body);
            });

            res.writeHead(200);
            res.end();

        } else {
            res.writeHead(404);
            res.end();
        }

    }

}).listen(9100);
