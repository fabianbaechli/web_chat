let fs = require('fs');
let request = require('request');

const download = function (uri, filename, callback) {
    request.head(uri, function (error, res, body) {
        if (error) {
            console.log("error downloading image: " + uri)
        } else {
            request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
        }
    });
};
module.exports = download;