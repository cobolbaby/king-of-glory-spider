const freeHero = require('./freeHero'),
      hero = require('./hero'),
      equip = require('./equip');

const spider = module.exports = {

    /**
     * 周免英雄
     */
    freeHero,

    /**
     * 获取英雄数据信息
     */
    hero,

    /**
     * 获取局内装备
     */
    equip
    
}