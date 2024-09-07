const http = require('http');
const fs = require('fs');
const path = require('path');
const queryString = require('querystring');
const port = 3000;

// Filepath
const rantFilePath = path.join(__dirname, 'data', 'rants.json');

// Read rants
function readRants(callback) {
    fs.readFile(rantFilePath, 'utf8', (err, data) => {
        if (err) {
            callback([]);
            return;
        }
        try {
            callback(JSON.parse(data || '[]'));
        } catch (error) {
            callback([]);
        }
    });
}

function writeRants(rants) {
    fs.writeFileSync(rantFilePath, JSON.stringify(rants, null, 2), 'utf8');
}

function serveFile(res, filePath, contentType) {
    fs.readFile(filePath, 'utf8', (err, content) => {
        if (err) {
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('500 Internal Server Error');
            return;
        }
        res.writeHead(200, {'Content-Type': contentType});
        res.end(content);
    });
}

const server = http.createServer((req, res) => {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);

    // Handle home page
    if (pathname === '/') {
        readRants((rants) => {
            fs.readFile(path.join(__dirname, 'views', 'index.html'), 'utf8', (err, content) => {
                if (err) {
                    res.writeHead(500, {'Content-Type': 'text/plain'});
                    res.end('500 Internal Server Error');
                    return;
                }
                // Generate rant cards HTML
                const rantCardsHtml = rants.map(rant => `
                    <div class="col-md-4 mb-3">
                        <div class="card">
                            <div class="card-body">
                                <p class="card-text">${rant.content}</p>
                            </div>
                        </div>
                    </div>
                `).join('');
                // Replace the placeholder with the actual rant cards
                const renderedContent = content.replace('<!-- RANT_CARDS -->', rantCardsHtml);
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(renderedContent);
            });
        });
    }
    // Handle create page
    else if (pathname === '/create') {
        serveFile(res, path.join(__dirname, 'views', 'create.html'), 'text/html');
    }
    // Handle rant submission
    else if (pathname === '/submit' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
            if (body.length > 1e6) {
                req.connection.destroy();
            }
        });
        req.on('end', () => {
            const postData = queryString.parse(body);
            readRants((rants) => {
                const newRant = { id: Date.now(), content: postData.content };
                rants.push(newRant);
                writeRants(rants);
                res.writeHead(302, {'Location': '/'});
                res.end();
            });
        });
    }
    // Handle about page
    else if (pathname === '/about') {
        serveFile(res, path.join(__dirname, 'views', 'about.html'), 'text/html');
    }
    // Handle contacts page
    else if (pathname === '/contacts') {
        serveFile(res, path.join(__dirname, 'views', 'contacts.html'), 'text/html');
    }
    // Handle support page
    else if (pathname === '/support') {
        serveFile(res, path.join(__dirname, 'views', 'support.html'), 'text/html');
    }
    // Handle 404 error
    else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('404 Not Found');
    }
});

// Start server
server.listen(port, () => {
    console.log(`Local server is running at: http://localhost:${port}`);
});
