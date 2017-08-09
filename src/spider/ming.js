const rp = require('request-promise'),
      utils = require('../utils'),
      storage = require('../storage'),
      JsonData = require('./jsonData');

const Ming = new JsonData(utils.getMingUrl(), 80, 93, 'ming');

function ming() {
    Ming.scraper();
}

module.exports = ming;