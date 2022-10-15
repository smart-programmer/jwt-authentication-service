const http = require('http');
const express = require('express');

app = express();

let options = {
    host: 'localhost',
    path: '/users',
    port: 3000,
};

app.get('/users', (req, res) => {
    callback = function(response) {
        let str = '';
      
        //build response string
        response.on('data', function (chunk) {
          str += chunk;
        });
      
        //print response
        response.on('end', function () {
          res.send(str);
        });
      }
    http.request(options, callback).end();
})


app.listen(4000, (err) => {
    if (err) {
        console.log(err)
    }else {
        console.log('Listening on port 4000')
    }
}) 
