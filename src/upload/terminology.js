const fs = require('fs'),
storage = require('../storage.js');

const term_data = JSON.parse(fs.readFileSync('./data/terminology.json').toString());

function terminology () {
    storage.init();
    for (let i in term_data) {
        const item = term_data[i];
        storage.saveOrUpdate({ 
            key: 'id',
            val: item.id
        }, 'Terminology', item);
    }
}

module.exports = terminology;