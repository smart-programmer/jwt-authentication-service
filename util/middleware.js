const fs = require('fs')
const path = require('path')



// log requests to log file
function requestLogger(req, res, next) {
  const loggString = `a ${req.method} request at ${req.url} at ${new Date()}`
  const loggFilePath = path.join(__dirname, "../var/loggs.txt")
  // write logg to file
  fs.appendFile(loggFilePath, `\n${loggString}`, function(err) {
    if (err) throw err;
    console.log('logg successful!');
  });
  // write logg to stdout
  console.log(loggString)

  next()
}


module.exports = {
    requestLogger: requestLogger
}
