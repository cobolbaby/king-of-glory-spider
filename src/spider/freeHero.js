const rp = require('request-promise'),
    fs = require('fs'),
    cheerio = require('cheerio'),
    Iconv = require('iconv').Iconv,
    utils = require('../utils'),
    storage = require('../storage');

const iconv = new Iconv('GBK', 'UTF-8');

const herolist_data = JSON.parse(fs.readFileSync('./data/herolist.json').toString());

/**
 * 爬取周免英雄，并保存到数据库
 */
function freeHero() {
    rp({
        url: utils.getFreeHeroUrl(),
        json: true
    }).then(function(res) {
        const freeHeroData = [];
        for (let i = 0; i < res.length; i++) {
            const item = res[i];
            if (item.pay_type === 10) {
                const hero = {
                    id: item.ename,
                    name: item.cname,
                    img: `//game.gtimg.cn/images/yxzj/img201606/heroimg/${item.ename}/${item.ename}.jpg`
                };
                freeHeroData.push(hero);
            }
        }
        // 初始化leancloud
        storage.init();
        storage.saveOrUpdate({
            key: 'eid',
            val: 1001
        }, 'Free_hero', { 'eid': 1001, 'freehero': freeHeroData });
    });
}

module.exports = freeHero;