const rp = require('request-promise'),
    fs = require('fs'),
    cheerio = require('cheerio'),
    Iconv = require('iconv').Iconv,
    utils = require('../utils'),
    parser = require('../parser'),
    storage = require('../storage');

const iconv = new Iconv('GBK', 'UTF-8');

// 读取本地数据
const herotype_data = JSON.parse(fs.readFileSync('./data/herotype.json').toString()),
    herolist_data = JSON.parse(fs.readFileSync('./data/herolist.json').toString()),
    summoner_data = JSON.parse(fs.readFileSync('./data/summoner.json').toString()),
    ming_data = JSON.parse(fs.readFileSync('./data/ming.json').toString()),
    equip_data = JSON.parse(fs.readFileSync('./data/item.json').toString());

/**
 * 英雄属性
 * @param {*} $ 
 */
function attr($) {
    const attr = [];
    const el = $('.wrap .header-hero .hero-attribute .hero-cover .cover-list li');
    const attr_name = ['生存能力', '攻击伤害', '技能效果', '上手难度'];

    for (let i = 0; i < el.length; i++) {
        const name = attr_name[i],
            value = el.eq(i).find('span').attr('class')
            .split(/\s+/)[2]
            .split('-')[2];

        const current_obj = {
            name,
            value
        };

        attr.push(current_obj);
    }

    return attr;
}

/**
 * 技能
 * @param {*} $ 
 */
function skills($) {
    const skills = [];
    const el = $('.wrap .content-hero .content-tab .content-list').eq(1).find('.panel').eq(0).find('.autom'),
        img_el = el.find('.plus-tab li'),
        content_el = el.find('.plus-content li');

    // 主、副技能
    const ps_el = $('.wrap .content-hero .content-tab .content-list').eq(1).find('.panel').eq(1).find('.autom .plus-osal'),
        pri_id = ps_el.find('.sk1 .osal-p2').attr('data-upskill'),
        sec_id = ps_el.find('.sk2 .osal-p2').attr('data-upskill');

    for (let i = 0; i < img_el.length; i++) {
        if (content_el.eq(i).find('.plus-box .plus-name').text() === 'undefined') continue;

        const id = content_el.eq(i).find('.plus-box .plus-name').attr('data-skillid'),
            name = content_el.eq(i).find('.plus-box .plus-name').text(),
            img = img_el.eq(i).find('img').attr('src'),
            value = content_el.eq(i).find('.plus-box .plus-value').text(),
            des = content_el.eq(i).find('.plus-int').text(),
            tips = content_el.eq(i).find('.prompt').text();

        const current_obj = {
            id,
            name,
            img,
            value,
            des,
            tips
        };

        current_obj.isPri = (id == pri_id) ? 1 : 0;
        current_obj.isSec = (id == sec_id) ? 1 : 0;

        skills.push(current_obj);
    }

    return skills;
}

/**
 * 召唤师技能
 * @param {*} $ 
 */
function summoner($) {
    const summoner = [];
    const summoner_str = $('.wrap .content-hero .content-tab .content-list').eq(1).find('.panel').eq(1).find('.autom .plus-osal .osal-suner #skill3').attr('data-skill');
    const summoner_id_arr = summoner_str.split('|');

    for (let i in summoner_id_arr) {
        const id = summoner_id_arr[i],
            data = summoner_data.filter(el => el.summoner_id == id)[0];

        const current_obj = {
            id,
            name: data.summoner_name,
            img: `//game.gtimg.cn/images/yxzj/img201606/summoner/${id}.jpg`
        }

        summoner.push(current_obj);
    }

    return summoner;
}

/**
 * 铭文搭配
 */
function ming($) {
    const ming = [];
    const ming_str = $('.wrap .content-hero .content-tab .content-list').eq(2).find('.panel').eq(1).find('.autom .rune-list').attr('data-ming');
    const ming_id_arr = ming_str.split('|');

    for (let i in ming_id_arr) {
        const id = ming_id_arr[i],
            data = ming_data.filter(el => el.ming_id == id)[0];

        const current_obj = {
            id,
            name: data.ming_name,
            img: `//game.gtimg.cn/images/yxzj/img201606/mingwen/${id}.png`,
            des: data.ming_des
        }

        ming.push(current_obj);
    }

    return ming;
}

/**
 * 出装推荐
 * @param {*} $ 
 */
function equip($) {
    const leading_data = [],
        losing_data = [];
    const el = $('.wrap .content-hero .content-tab .content-list').eq(2).find('.panel').eq(0).find('.autom .skills-build'),
        leading_str = el.eq(0).find('.build-list').attr('data-item'), // 顺风出装
        losing_str = el.eq(1).find('.build-list').attr('data-item'), // 逆风出装
        leading_tips = el.eq(0).find('.prompt').text(), // 出装小提示
        losing_tips = el.eq(1).find('.prompt').text();

    const leading_id_arr = leading_str.split('|'),
        losing_id_arr = losing_str.split('|');

    for (let i in leading_id_arr) {
        const id = leading_id_arr[i],
            data = equip_data.filter(el => el.item_id == id)[0];

        if (typeof(data) == 'undefined') continue;

        const current_obj = {
            id,
            name: data.item_name,
            img: `//game.gtimg.cn/images/yxzj/img201606/itemimg/${id}.jpg`
        };

        leading_data.push(current_obj);
    }

    for (let i in losing_id_arr) {
        const id = losing_id_arr[i],
            data = equip_data.filter(el => el.item_id == id)[0];

        if (typeof(data) == 'undefined') continue;

        const current_obj = {
            id,
            name: data.item_name,
            img: `//game.gtimg.cn/images/yxzj/img201606/itemimg/${id}.jpg`
        };

        losing_data.push(current_obj);
    }

    return {
        '顺风出装': {
            data: leading_data,
            tips: leading_tips
        },
        '逆风出装': {
            data: losing_data,
            tips: losing_tips
        }
    }
}

const heroes = [];

/**
 * 整合爬虫英雄数据
 * @param {Number} index 起始下标
 * @param {Number} length 最后长度
 */
function scraper(index, length) {

    if (index < length && length < herolist_data.length + 1) {
        const hero = herolist_data[index];

        // 基本资料
        const hero_id = hero.ename,
            hero_name = hero.cname,
            hero_type = hero.hero_type,
            isNew = hero.new_type;

        // 封面图片 和 头像
        const hero_cover = `//game.gtimg.cn/images/yxzj/img201606/heroimg/${hero_id}/${hero_id}-mobileskin-1.jpg`,
            hero_avatar = `//game.gtimg.cn/images/yxzj/img201606/heroimg/${hero_id}/${hero_id}.jpg`;

        const heroData = { hero_id, hero_name, hero_avatar, hero_type, hero_cover, isNew };

        const url = utils.getHeroDetail(hero_id);

        rp(utils.getRequestOptions(url, {
                transform: body => cheerio.load(body)
            }))
            .then(function($) {
                heroData.attr = attr($);
                heroData.skills = skills($);
                heroData.summoner = summoner($);
                heroData.ming = ming($);
                heroData.equip = equip($);

                // heroes.push(heroData);
                // if( (index+1) == length ) {
                // 结束循环操作，批量上传
                // }
                storage.saveOrUpdate({ key: 'hero_id', val: hero_id }, 'Hero', heroData);
                console.log(index, hero_name)
                scraper(++index, length);
            });

    }
}

/**
 * 获取英雄数据信息
 */
function hero() {
    // 初始化leancloud
    storage.init();
    // Todo 批量上传
    // 指定下标上传
    // scraper(69, 70);
}

module.exports = hero;