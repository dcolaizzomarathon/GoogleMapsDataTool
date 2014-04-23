var express = require('express');
var app = express(),
    path = require('path'),
    fs = require('fs'),
    nconf = require('nconf'),
    config = nconf.file({
        file: 'config.json'
    });

var defaultResultFile = path.normalize(config.get('resultFile'));
var defaultResultDirectory = path.normalize(config.get('resultDirectory'));
app.use(express.static(__dirname));


var addFileExtension = function(fileName) {
    if (fileName.indexOf('.json') == -1)
        return fileName + '.json';
    return fileName;
};

var normalizePath = function(filePath) {
    if (filePath.indexOf("\\") != -1)
        return path.normalize(filePath);
    else {
        return path.normalize(path.join(defaultResultDirectory, filePath));
    }
};

app.get('/results/:fileName', function(req, res) {
    var fileName = addFileExtension(req.params.fileName),
        fullFilePath = normalizePath(fileName);
    var exists = fs.existsSync(fullFilePath);
    if (exists) {
        var results = fs.readFileSync(fullFilePath);
        res.send(JSON.parse(results));
    } else {
        res.send("OK");
    }
});

app.get('/deleteFile/:fileName', function(req, res) {
    var fileName = addFileExtension(req.params.fileName),
        fullFilePath = normalizePath(fileName);
    var exists = fs.existsSync(fullFilePath);
    if (exists)
        fs.unlinkSync(fullFilePath);
    res.send("OK");
});

app.listen(46123);
