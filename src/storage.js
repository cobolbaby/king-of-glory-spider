const AV = require('leancloud-storage'),
      config = require('./leancloud.config.js');

/**
 * leancloud数据存储
 */
const storage = module.exports = {
    
    /**
     * leancloud初始化
     */
    init() {
        AV.init(config);
        console.log('初始化leancloud...');
    },

    /**
     * 获取对象
     * 
     * @param {String} objectId 
     */
    query(objectId, className, handler) {
        console.log('查询...');
        let query = new AV.Query(className);
        // 全部查询
        if(objectId === null) {
            query.find().then(function(res) {
                console.log('查询成功');
                handler&&handler(res);
            });
            return;
        }
        // 获取指定对象
        query.get(objectId).then(function(res) {
            console.log('查询成功');
            handler&&handler(res.attributes);
        }, function(err) { 
            handler&&handler(err.code)
        });
    },

    /**
     * 保存对象
     * 
     * @param {String} className
     * @param {Object} data
     */
    save(className, data) {
        console.log('保存...');
        // 构建对象
        let Klass = AV.Object.extend(className);
        let klass = new Klass();
        // 保存对象
        klass.save(data).then(
            res => { console.log('数据保存成功') }, 
            err => { console.error(err) }
        );
    },

    /**
     * 更新对象
     * 
     * @param {String} objectId
     * @param {String} className
     * @param {Object} data
     */
    update(objectId, className, data) {
        console.log('更新...');
        let klass = AV.Object.createWithoutData(className, objectId);
        // 保存更新
        klass.save(data).then(
            function(res) { 
                console.log('数据更新成功');
            }, 
            err => { console.error(err) }
        );
    },

    test(hero_id, data) {
        console.log('查询...');
        let query = new AV.Query('Hero');
        query.equalTo('hero_id', hero_id);

        query.find().then(function(res) {
            if(res.length === 0) {
                console.log('保存新对象');
                storage.save('Hero', data);
                return;
            }
            console.log('更新对象');
            const id = res[0].id;
            console.log(id);
            storage.update(id, 'Hero', data);

        }, function(err) {
            console.log(err);
        });
    }

}