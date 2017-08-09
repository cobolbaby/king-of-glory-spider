const rp = require('request-promise'),
      utils = require('../utils'),
      storage = require('../storage'),
      JsonData = require('./jsonData');

const Equip = new JsonData(utils.getEquipUrl(), 0, 2, 'equip');

function equip() {
    Equip.scraper();
}

module.exports = equip;