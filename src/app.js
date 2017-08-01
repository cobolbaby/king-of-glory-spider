/**
 * Created by kaeyleo on 2017-07-28.
 * 
 */
;(function() {

'use strict';

// 自定义模块
const spider = require('./spider');

// 定时爬取并保存周免英雄
// spider.freeHero();

// 爬取英雄详情信息
spider.hero();

})();