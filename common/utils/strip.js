module.exports = function(string) {
    return string.replace(/'|\n/g, '');
};