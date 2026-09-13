const http = require('http');
const fs = require('fs');
const path = require('path');

// Path for the shared emptyDir volume
const statusPath = path.join(__dirname, 'files', 'status.txt');
// New path for the ConfigMap file mount
const configFilePath = path.join(__dirname, 'config', 'information.txt');

const server = http.createServer(async (req, res) => {
  if (req.url === '/') {
    try {
      const statusContent = fs.readFileSync(statusPath, 'utf-8').trim();
      
      // 1. Read the ConfigMap file content
      let fileContent = '';
      if (fs.existsSync(configFilePath)) {
        fileContent = fs.readFileSync(configFilePath, 'utf-8').trim();
      }
      
      // 2. Read the ConfigMap environment variable
      const envMessage = process.env.MESSAGE || '';

      // 3. Fetch ping count over the network
      let pings = '0';
      try {
        const pingResponse = await fetch('http://ping-pong-svc:2345/count');
        pings = await pingResponse.text();
      } catch (e) {
        console.error('Failed to fetch from ping-pong-svc:', e.message);
      }

      res.writeHead(200, { 'Content-Type': 'text/plain' });
      // Format the exact multi-line string required by the exercise
      res.end(`file content: ${fileContent}\nenv variable: MESSAGE=${envMessage}\n${statusContent}.Ping / Pongs: ${pings}\n`);
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
