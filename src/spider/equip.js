const rp = require('request-promise'),
      utils = require('../utils'),
      storage = require('../storage');

/**
 * 遍历数据
 * @param {Number} startIndex 
 * @param {Number} endIndex 
 * @param {Array} res 
 */
function loopData(startIndex, endIndex, res) {
    if (endIndex > res.length) return;

    for (let i = startIndex; i < endIndex; i++) {
        const item = res[i],
              item_id = item.item_id,
              item_img = `//game.gtimg.cn/images/yxzj/img201606/itemimg/${item_id}.jpg`;

        item.img = item_img;

        storage.saveOrUpdate({ 
            key: 'item_id', 
            val: item_id 
        }, 'Equip', item);
    }
}

/**
 * 获取装备列表
 */
function equip() {
    storage.init();

    rp({
        url: utils.getEquipUrl(),
        json: true
    })
    .then(function(res) {
        loopData(80, 93, res);
    });
}

module.exports = equip;