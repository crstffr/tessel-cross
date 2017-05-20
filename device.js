var fs = require('fs');
var path = require('path');
var http = require('http');
var tessel = require('tessel');
var text = require('./common/utils/text');

var ip = require('./device/ip');
var id = require('./device/id');
var name = require('./device/name');
var storage = require('./device/storage');
var Patch = require('./device/patch_functions');

patchChains(storage.load('default'));

// tessel.close('B');

console.log('------------------------------------------');
console.log(name + ': ' + id);
console.log('Server now running at http://' + ip + ':9100');

http.createServer(function (req, res) {

    var www = __dirname + '/public/';

    if (req.method === 'GET') {

        if (req.url === '/') {
            // Serve templated index.html with some device details
            res.writeHead(200, {'content-type': 'text/html'});
            res.end(text(www + 'index.html', [id, ip, name, 'dev']));

        } else if (req.url === '/current') {
            // Serve the user config contents
            res.writeHead(200, {'content-type': 'application/json'});
            let config = storage.load('current');
            res.end(JSON.stringify(config));

        } else if (req.url === '/ping') {

            res.writeHead(200, {'content-type': 'text/plain'});
            res.end('pong');

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

        var data = '';

        if (req.url === '/chains') {

            getPostData(req, function(data){
                patchChains(data);
                res.writeHead(200);
                res.end();
            });

        } else if (req.url === '/doconns') {

            Patch.DoPatches();
            res.writeHead(200);
            res.end();

        } else if (req.url === '/disconnect') {

            Patch.ConfigDefaultPatches();
            Patch.DoPatches();
            storage.save('current', []);
            res.writeHead(200);
            res.end();

        } else if (req.url === '/loaddefaults') {

            patchChains(storage.load('default'));
            res.writeHead(200);
            res.end();

        } else if (req.url === '/savedefaults') {

            getPostData(req, function(data){
                storage.save('default', data);
                res.writeHead(200);
                res.end();
            });

        } else {
            res.writeHead(404);
            res.end();
        }

    }

}).listen(9100);


function patchChains(chains) {
    if (!chains || !chains.forEach) {
        return;
    }
    Patch.ConfigDefaultPatches();
    chains.forEach(function(chain) {
        if (!chain || !chain.forEach) {
            return;
        }
        chain.forEach(function(ports) {
            var i = Number(ports[0]);
            var o = Number(ports[1]);
            Patch.PatchDelayed(o, i, 1);
        });
    });
    Patch.DoPatches();
    storage.save('current', chains);
}

function getPostData(req, cb) {

    var data = '';

    req.on('data', function (incoming) {
        data += incoming;
        if (data.length > 1e6) {
            req.connection.destroy(); // flood prevention
        }
    });

    req.on('end', function () {
        if (req.headers['content-type'] === 'application/json') {
            try {
                data = JSON.parse(data);
            } catch (e) {
            }
        }
        if (typeof cb === 'function') {
            cb(data);
        }
    });

}