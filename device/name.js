var strip = require('../common/utils/strip');
var exec = require('child_process').execSync;
var result = exec('uci show /etc/config/system.@system[0].hostname').toString();
var name = strip(result.split('=')[1] || '');
module.exports = name;