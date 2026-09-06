const http = require('http');
const fs = require('fs');
const path = require('path');

const statusPath = path.join(__dirname, 'files', 'status.txt');
const pingsPath = path.join(__dirname, 'shared', 'pingpongs.txt');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    try {
      // .trim() removes the newline from the writer so we can format it exactly like the instructions
      const statusContent = fs.readFileSync(statusPath, 'utf-8').trim();
      let pings = 0;
      if (fs.existsSync(pingsPath)) {
        pings = fs.readFileSync(pingsPath, 'utf-8').trim();
      }
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(`${statusContent}.Ping / Pongs: ${pings}\n`);
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
