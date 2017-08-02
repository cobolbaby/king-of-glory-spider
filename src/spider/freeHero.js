const rp = require('request-promise'),
      utils = require('../utils'),
      parser = require('../parser'),
      storage = require('../storage');

/**
 * 爬取周免英雄，并保存到数据库
 */
function freeHero() {
    rp(utils.getRequestOptions(utils.getFreeHeroUrl())).then(function($) {
        let str, startIndex, obj, arr;
        // 解析字符串
        str = $('body').text(); 
        startIndex = str.indexOf('[');
        str = str.substring(startIndex, str.length-2);
        // 转换为对象
        obj = eval("(" + str + ")");
        obj = obj[1].sSubContent;
        obj = obj.substring(0, obj.length-1);
        arr = obj.split('|');

        // 初始化leancloud
        storage.init();
        storage.query(null, 'Free_hero', function(data) {
            // 无数据，创建对象
            if(data.length === 0) {
                console.log('保存新对象');
                storage.save('Free_hero', {'freehero': arr, 'name': '悟空'});
                return;
            }
            // 更新数据
            console.log('更新对象');
            const id = data[0].id;
            storage.update(id, 'Free_hero', {'freehero': arr, 'name': '八戒'});
        });
        
    });
}

module.exports = freeHero;