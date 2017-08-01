const cheerio = require('cheerio'),
      Iconv = require('iconv').Iconv,
      iconv = new Iconv('GBK', 'UTF-8');

module.exports = {

    /**
     * 获取request配置数据
     * @param {String} url 
     */
    getRequestOptions(url) {
        return {
            url,
            encoding: null,
            transform: body => (cheerio.load(
                iconv.convert(body).toString()
            ))
        }
    },

    /**
     * 获取周免英雄数据源url
     */
    getFreeHeroUrl() {
        return 'http://pvp.qq.com/webplat/info/news_version3/15592/24091/24992/m15707/index.shtml';
    },

    /**
     * 获取英雄详情数据源url
     * @param {Number} heroid
     */
    getHeroDetail(heroid) {
        return 'http://pvp.qq.com/m/m201606/herodetail/' + heroid + '.shtml';
    }

}