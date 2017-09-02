const rp = require('request-promise'),
    utils = require('../utils'),
    storage = require('../storage');

class JsonData {
    /**
     * 获取在线Json数据
     * @param {String} url 
     * @param {Number} startIndex 
     * @param {Number} endIndex 
     * @param {String} type 
     */
    constructor(url, startIndex, endIndex, type) {
        this.url = url;
        this.startIndex = startIndex;
        this.endIndex = endIndex;

        switch (type) {
            case 'equip':
                this.type = 'itemimg';
                this.picFormat = 'jpg';
                this.className = 'Equip';
                this.prefix = 'item';
                break;
            case 'ming':
                this.type = 'mingwen';
                this.picFormat = 'png';
                this.className = 'Ming';
                this.prefix = 'ming';
                break;
        }
    }

    /**
     * 获取装备列表
     */
    scraper() {
        const self = this;
        rp({
            url: self.url,
            json: true
        }).then(function(res) {
            self.loopData(res);
        });
    }

    /**
     * 遍历数据
     * @param {Number} startIndex 
     * @param {Number} endIndex 
     * @param {Array} res 
     */
    loopData(res) {
        if (this.endIndex > res.length) return;

        storage.init();

        for (let i = this.startIndex; i < this.endIndex; i++) {
            const self = this;
            const item = res[i],
                id = item[`${this.prefix}_id`],
                img = `//game.gtimg.cn/images/yxzj/img201606/${this.type}/${id}.${this.picFormat}`;

            item.img = img;

            storage.saveOrUpdate({
                key: `${self.prefix}_id`,
                val: id
            }, self.className, item);
        }
    }

}

module.exports = JsonData;