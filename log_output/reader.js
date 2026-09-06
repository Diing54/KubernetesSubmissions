const http = require('http');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'files', 'status.txt');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(content);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Waiting for the writer to generate the first log...\n');
    }
  } else {
    res.writeHead(404);
    res.end();
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Reader server started on port ${PORT}`);
});
