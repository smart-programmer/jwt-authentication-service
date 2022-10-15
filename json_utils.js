const fs = require('fs')
const path = require('path')


function readJsonFile(filepath, callback) {
    fs.readFile(filepath, 'utf8',(err, data) => {
        callback(JSON.parse(data))
    })
}

module.exports = {
    readJsonFile: readJsonFile, 
}



