var fs = require('fs');
var path = require('path');
var http = require('http');
var tessel = require('tessel');
var text = require('./common/utils/text');

var ip = require('./device/ip');
var id = require('./device/id');
var name = require('./device/name');

console.log('------------------------------------------');
console.log(name + ': ' + id);
console.log('Server now running at http://' + ip + ':9100');

http.createServer(function (req, res) {

    var www = __dirname + '/public/';

    if (req.method === 'GET') {

        if (req.url === '/') {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(text(www + 'index.html', [id, ip, name, 'dev']));
        } else {

            let file = path.join(www, req.url);
            console.log(req.url, file);

            if (fs.existsSync(file)) {
                res.writeHead(200);
                res.end(text(file));
            } else {
                res.writeHead(404);
                res.end();
            }
        }
    }

}).listen(9100);
