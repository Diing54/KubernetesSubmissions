const http = require('http');
const fs = require('fs');
const path = require('path');

// It still shares the local emptyDir with the writer container
const statusPath = path.join(__dirname, 'files', 'status.txt');

const server = http.createServer(async (req, res) => {
  if (req.url === '/') {
    try {
      const statusContent = fs.readFileSync(statusPath, 'utf-8').trim();
      
      let pings = '0';
      try {
        // Live network call to the ping-pong service over Cluster DNS
        const pingResponse = await fetch('http://ping-pong-svc:2345/count');
        pings = await pingResponse.text();
      } catch (e) {
        console.error('Failed to fetch from ping-pong-svc:', e.message);
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
