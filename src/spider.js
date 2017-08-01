const rp = require('request-promise'),
      fs = require('fs'),
      utils = require('./utils'),
      parser = require('./parser'),
      storage = require('./storage');

// 读取本地数据
const herotype_data = JSON.parse(fs.readFileSync('./data/herotype.json').toString()),
      herolist_data = JSON.parse(fs.readFileSync('./data/herolist.json').toString());

const spider = module.exports = {

    /**
     * 爬取周免英雄，并保存到数据库
     */
    freeHero() {
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
    },

    /**
     * 获取英雄数据信息
     */
    hero() {
        for(let i = 0; i < 3; i++) {
            const hero = herolist_data[i];
                  
            // basic: id, name, type, isNew
            const id = hero.ename,
                  name = hero.cname,
                  type = hero.hero_type,
                  isNew = hero.new_type;
            
            const url = utils.getHeroDetail(id);

            rp(utils.getRequestOptions(url)).then(function($) {
                
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

                    skillInfo.id = parser.parseUrlId(skillInfo.img);
                    skillInfo.isPri = (skillInfo.id === pri_id) ? 1 : 0;
                    skillInfo.isSec = (skillInfo.id === sec_id) ? 1 : 0;
                    
                    skills.push(skillInfo);

                    // 召唤师技能 ：技能图片、名字

                }
                console.log(skills);

                // 铭文搭配 ming：铭文图片、名字、属性介绍


                // 出装推荐 equip：装备图片、装备名字

            });

            // 封面图片 img
            const heroImg = '//game.gtimg.cn/images/yxzj/img201606/heroimg/' + id + '/' + id + '-mobileskin-1.jpg';
        }
    }
    
}