const freeHero = require('./freeHero'),
      hero = require('./hero'),
      equip = require('./equip'),
      ming = require('./ming');

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
    equip,

    /**
     * 获取铭文数据
     */
    ming
    
}