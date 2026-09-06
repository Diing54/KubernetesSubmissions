const http = require('http');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'shared', 'pingpongs.txt');
let counter = 0;

// Initialize from file if the pod restarts
if (fs.existsSync(filePath)) {
  counter = parseInt(fs.readFileSync(filePath, 'utf-8')) || 0;
}

const server = http.createServer((req, res) => {
  if (req.url === '/pingpong') {
    counter++;
    fs.writeFileSync(filePath, counter.toString());
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`pong ${counter}\n`);
  } else {
    res.writeHead(404);
    res.end();
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
