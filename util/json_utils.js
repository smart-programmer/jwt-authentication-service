const fs = require('fs')
const path = require('path')



// read json file and perform a callback for the result
function readJsonFile(filepath, callback) {
    fs.readFile(filepath, 'utf8',(err, data) => {
        callback(JSON.parse(data))
    })
}



module.exports = {
    readJsonFile: readJsonFile, 
}



