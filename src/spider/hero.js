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
      ming_data = JSON.parse(fs.readFileSync('./data/ming.json').toString()),
      equip_data = JSON.parse(fs.readFileSync('./data/item.json').toString());

/**
 * 获取英雄数据信息
 */
function hero() {

    // 初始化leancloud
    storage.init();

    const heroes = [];

    for(let i = 0; i < 1; i++) {
        const hero = herolist_data[i];
                
        // basic: id, name, type, isNew
        const hero_id = hero.ename,
              hero_name = hero.cname,
              hero_type = hero.hero_type,
              isNew = hero.new_type;

        // 封面图片 和 头像
        const hero_cover = `//game.gtimg.cn/images/yxzj/img201606/heroimg/${hero_id}/${hero_id}-mobileskin-1.jpg`,
                hero_avatar = `//game.gtimg.cn/images/yxzj/img201606/heroimg/${hero_id}/${hero_id}.jpg`;

        const heroData = {hero_id, hero_name, hero_avatar, hero_type, hero_cover, isNew};
        
        const url = utils.getHeroDetail(hero_id);

        rp(utils.getRequestOptions(url, {
            transform: body => (cheerio.load(
                iconv.convert(body).toString()
            ))
        }))
        .then(function($) {
            
            // 属性 attr: hp生存能力, atk攻击伤害, effect技能效果, hard上手难度
            console.log('获取属性...');
            const attr = [];
            const attr_el = $('#warp .sp_baTop .sp_banner .hero-info .hero-info-ul .hero-info-li');

            for(let i=0; i<attr_el.length; i++) {
                const current_attr = {};
                const desc = attr_el.eq(i).find('.hero-info-text').text();

                let value = attr_el.eq(i).find('.hero-info-bar .ibar').attr('style');
                value = value.match(/width:(\S*)%/)[1];

                current_attr.desc = desc;
                current_attr.value = value;

                attr.push(current_attr);
            }
            // console.log(attr);
            heroData.attr = attr;

            // 技能 skills: 技能图片、名字、冷却值、消耗、技能介绍
            console.log('获取技能...');
            const skills = [];
            const skillsImg_el = $('#warp .pr-f').eq(3).find('.sp_b .sp_boxCont .sp_bContTop #spCLi li'), // 获取技能图片
                    skillsInfo_el = $('#warp .pr-f').eq(3).find('.sp_b .sp_boxCont .sp_bTopCont #spBT li'), // 获取技能信息
                    skillsExtra_el = $('#warp .pr-f').eq(4).find('.sp_c .sp_boxCont ul li'); // 技能加点
            // 主升、副升
            const primary = skillsExtra_el.eq(0).find('.sp_cImg img').attr('src'),
                    secondary = skillsExtra_el.eq(1).find('.sp_cImg img').attr('src');
            
            const pri_id = parser.parseUrlId(primary),
                    sec_id = parser.parseUrlId(secondary);

            for(let i = 0; i < skillsImg_el.length; i++) {

                if(skillsInfo_el.eq(i).find('h3').text() === 'undefined') continue;

                const skillInfo = {
                    name: skillsInfo_el.eq(i).find('h3').text(),
                    img: skillsImg_el.eq(i).find('.sp_bTopImg img').attr('src'),
                    cd: skillsInfo_el.eq(i).find('.skill-p1').text(),
                    mana: skillsInfo_el.eq(i).find('.skill-p2').text(),
                    desc: skillsInfo_el.eq(i).find('.skill-p3').text()
                };

                skillInfo.id = (skillInfo.img).match(/heroimg\/(\S*).png/)[1].split('/')[1];
                skillInfo.isPri = (skillInfo.id === pri_id) ? 1 : 0;
                skillInfo.isSec = (skillInfo.id === sec_id) ? 1 : 0;
                
                skills.push(skillInfo);
            }
            // console.log(skills);
            heroData.skills = skills;

            // 召唤师技能 summoner：技能图片、名字
            console.log('获取召唤师技能...');
            const summoner = [];
            const summoner_el = $('#warp .pr-f').eq(4).find('.sp_c .sp_boxCont ul li').eq(2).find('#skill3'),
                    summoner_id = summoner_el.attr('data-skill').split('|');

            for(let i = 0; i < summoner_id.length; i++) {
                const id = summoner_id[i],
                        img = `//game.gtimg.cn/images/yxzj/img201606/summoner/${summoner_id[i]}.jpg`;
                const summonerInfo = { id, img };
                summoner.push(summonerInfo);
            }
            // console.log(summoner);
            heroData.summoner = summoner;

            // 铭文搭配 ming：铭文图片、名字、属性介绍
            console.log('获取铭文搭配...');
            const ming = [];
            const ming_el = $('#warp .pr-f').eq(5).find('.sp_d .sp_boxCont .sugg-u1'),
                    ming_id = ming_el.attr('data-ming').split('|');
            
            for(let i = 0; i < ming_id.length; i++) {
                const id = ming_id[i];

                let mingInfo = ming_data.filter(el => el.ming_id == id);
                mingInfo = mingInfo[0];

                mingInfo.ming_img = `//game.gtimg.cn/images/yxzj/img201606/mingwen/${id}.png`;
                delete mingInfo.ming_type;
                delete mingInfo.ming_grade;

                ming.push(mingInfo);
            }
            // console.log(ming);
            heroData.ming = ming;
            
            // 出装推荐 equip：装备图片、装备名字
            console.log('获取出装推荐...');
            const equip = [];
            const equip_el = $('#warp .pr-f').eq(6).find('.sp_e .sp_boxCont .sp_eCont').eq(2).find('.sp_eR ul'),
                    equip_id = equip_el.attr('data-item').split('|');

            for(let i = 0; i < equip_id.length; i++) {
                const id = equip_id[i];

                let equipInfo = equip_data.filter(el => el.item_id == id);
                equipInfo = equipInfo[0];

                equipInfo.equip_img = `//game.gtimg.cn/images/yxzj/img201606/itemimg/${id}.jpg`;
                delete equipInfo.item_type;
                delete equipInfo.price;
                delete equipInfo.total_price;
                delete equipInfo.des1;
                delete equipInfo.des2;

                equip.push(equipInfo);
            }
            // console.log(equip);
            heroData.equip = equip;

            heroes.push(heroData);
            /**
             * 将当前数据保存到leancloud云存储
             */
            storage.saveOrUpdate({
                 key: 'hero_id',
                 val: hero_id
            }, 'Hero', heroData);

        });
    }

}

module.exports = hero;