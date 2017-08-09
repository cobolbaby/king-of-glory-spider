const rp = require('request-promise'),
      utils = require('../utils'),
      storage = require('../storage');

function ming() {
    rp({
        url: utils.getMingUrl(),
        json: true
    })
    .then(function(res) {
        
    });
}

module.exports = ming;