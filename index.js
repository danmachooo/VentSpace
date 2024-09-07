const http = require('http');
const fs = require('fs');
const path = require('path');
const queryString = require('querystring');

//Filepath
const rantFilePath = path.join(__dirnamem, 'data', 'rants.json');

//Read rants
function readRants() {
    try {
        const data = fs.readFileSync(rantFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

function writeRants(rants){
    fs.writeFileSync(rantFilePath, JSON.stringify(rants, null, 2), 'utf8');
}

function serveFile(res, filePath, contentType) {
    fs.readFile(filePath, 'utf8', (err, content) => {
        if(err) {
            res.writeHead(500, {'Content-Type': 'text/plain'})
        }
    })
}

