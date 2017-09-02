module.exports = {

    /**
     * 获取request配置数据
     * @param {String} url 
     */
    getRequestOptions(url, opts) {
        const def = {
            url,
            encoding: null
        };
        return opts ? Object.assign(def, opts) : def;
    },

    /**
     * 获取周免英雄数据源url
     */
    getFreeHeroUrl() {
        return 'http://pvp.qq.com/web201605/js/herolist.json';
    },

    /**
     * 获取英雄详情数据源url
     * @param {Number} heroid
     */
    getHeroDetail(heroid) {
        return 'http://pvp.qq.com/m/m201706/herodetail/' + heroid + '.html';
    },

    getEquipUrl() {
        return 'http://pvp.qq.com/web201605/js/item.json';
    },

    getMingUrl() {
        return 'http://pvp.qq.com/web201605/js/ming.json';
    }

}