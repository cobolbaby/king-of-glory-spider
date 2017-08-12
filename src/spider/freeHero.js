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
    rp(utils.getRequestOptions(utils.getFreeHeroUrl(), {
        transform: body => (cheerio.load(
            iconv.convert(body).toString()
        ))
    }))
    .then(function($) {
        let str, startIndex, obj, arr;
        // 解析字符串
        str = $('body').text();
        startIndex = str.indexOf('[');
        str = str.substring(startIndex, str.length-2);
        // 转换为对象
        obj = eval(`(${str})`);
        obj = obj[1].sSubContent;
        obj = obj.substring(0, obj.length-1);
        arr = obj.split('|');

        const freehero_data = [];
        for(var i in arr) {
            const h_id = arr[i],
                  h_obj = herolist_data.filter(el => el.ename == h_id)[0];

            const c_obj = {
                id: h_obj.ename,  
                name: h_obj.cname,
                img: `//game.gtimg.cn/images/yxzj/img201606/heroimg/${h_id}/${h_id}.jpg`
            }
            
            freehero_data.push(c_obj);
        }

        // 初始化leancloud
        storage.init();
        storage.saveOrUpdate({
            key: 'freehero', 
            val: arr
        }, 'Free_hero', {'freehero': freehero_data});
    });
}

module.exports = freeHero;