var settings = require('user-settings').file('config');

module.exports = new Storage();

function Storage() {

    this.save = function(key, val) {
        return settings.set(key, val);
    };

    this.load = function(key) {
        return settings.get(key);
    };

}