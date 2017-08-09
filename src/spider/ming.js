const rp = require('request-promise'),
      utils = require('../utils'),
      storage = require('../storage'),
      JsonData = require('./jsonData');

const Ming = new JsonData(utils.getMingUrl(), 0, 2, 'ming');

function ming() {
    Ming.scraper();
}

module.exports = ming;