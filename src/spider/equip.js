const rp = require('request-promise'),
      fs = require('fs'),
      utils = require('../utils'),
      storage = require('../storage');

const equip_data = JSON.parse(fs.readFileSync('./data/item.json').toString());

/**
 * 获取装备列表
 */
function equip() {
    rp({
        url: utils.getEquipUrl(),
        json: true
    })
    .then(function(res) {
        for(let i in res) {
            const item = res[i],
                  item_id = item.item_id,
                  item_img = `//game.gtimg.cn/images/yxzj/img201606/itemimg/${item_id}.jpg`;
            
            item.img = item_img;

            console.log(item);
        }
    });
}

module.exports = equip;