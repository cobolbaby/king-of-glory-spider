const schedule = require('node-schedule');

/**
 * Created by kaeyleo on 2017-07-28.
 * 
 */
;
(function() {

    'use strict';

    // 自定义模块
    const spider = require('./spider/index'),
        term = require('./upload/terminology');

    // 每周一定时爬取并保存周免英雄
    schedule.scheduleJob('* * * * * 1', function() {
        spider.freeHero();
    });

    // term();
    // 爬取英雄详情信息
    spider.hero();

    // 爬取装备信息
    spider.equip();

    // 爬取铭文信息
    spider.ming();

})();