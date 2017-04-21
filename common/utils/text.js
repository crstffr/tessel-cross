var strf = require('./strf');
module.exports = function(file, args) {
    var str = require('fs').readFileSync(file).toString();
    return strf(str, args);
};