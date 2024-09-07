const http = require('http');
const fs = require('fs');
const path = require('path');
const queryString = require('querystring');
const port = 3000;

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
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('500 Internal Server Error');
            return;
        }
    });
}

const server = http.createServer((req, res) => {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);

    //handle home page
    if(pathname === '/') {
        const rants = readRants();
        fs.readFile(path.join(__dirname, 'views', 'index.html'), 'utf8', (err, content) => {
            if(err) {
                res.writeHead(500, {'Content-type': 'text/plain'});
                res.end('500 Internal server error');
                return;
            }
            const rantsHtml = rants.map(rant => `<li>${rant.content}</li>`).join('');
            const renderedContent = content.replace('{{#each rants}}', rantsHtml).replace('{{#each rants}}', rantsHtml).replace('{{/each', '');
            res.end(renderedContent);
        });
    }
    //handle create page
    else if(pathname === '/create') {
        serveFile(res, path.join(__dirname, 'views', 'create.html'), 'text/html');
    }
    //handle rant submission
    else if(pathname === '/submit' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const postData = queryString.parse(body);
            const rants = readRants();
            const newRant = {id: Date.now(), content: postData.content};
            rants.push(newRant);
            writeRants(rants);
            res.writeHead(302, {'Location': '/'})
            res.end();
        });
    }
    //handle about page
    else if(pathname === '/about') {
        serveFile(res, path.join(__dirname, 'views', 'about.html'), 'text/html');
    }
    //handle contacts page
    else if(pathname === '/contacts') {
        serveFile(res, patg.join(__dirname, 'views', 'contacts.html'), 'text/html');
    }
    //handle support page
    else if(pathname === '/support') {
        serveFile(res, path.join(__dirname, 'views', 'support.html'), 'text.html');
    }
    //handle 404 error
    else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('404 Not Found');
    }
});

//Start server
server.listen(port, () => {
    console.log(`Local server is running at: http//localhost:${port}`)
})