
module.exports = {

    /**
     * 解析url中的id
     * @param {String} url 
     */
    parseUrlId(url) {
        return url.match(/heroimg\/(\S*).png/)[1].split('/')[1];
    }

}