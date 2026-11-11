const http = require('http');
const fs = require('fs');
const path = require('path');

// Path for the shared emptyDir volume
const statusPath = path.join(__dirname, 'files', 'status.txt');
// Path for the ConfigMap file mount
const configFilePath = path.join(__dirname, 'config', 'information.txt');

// Helper function to check Ping-pong health over HTTP
const checkPingPongHealth = () => {
  return new Promise((resolve, reject) => {
    const req = http.get('http://ping-pong-svc:2345/count', (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        reject(new Error(`Status Code: ${res.statusCode}`));
      }
    });
    req.on('error', (err) => reject(err));
    req.setTimeout(2000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
};

const server = http.createServer(async (req, res) => {
  // Readiness probe endpoint
  if (req.url === '/healthz') {
    try {
      await checkPingPongHealth();
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      return res.end('OK\n');
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      return res.end(`Ping-pong not ready: ${err.message}\n`);
    }
  } 
  
  // Main application route
  else if (req.url === '/') {
    try {
      const statusContent = fs.readFileSync(statusPath, 'utf-8').trim();
      
      let fileContent = '';
      if (fs.existsSync(configFilePath)) {
        fileContent = fs.readFileSync(configFilePath, 'utf-8').trim();
      }
      
      const envMessage = process.env.MESSAGE || '';

      let pings = '0';
      try {
        const pingResponse = await fetch('http://ping-pong-svc:2345/count');
        pings = await pingResponse.text();
      } catch (e) {
        console.error('Failed to fetch from ping-pong-svc:', e.message);
      }

      res.writeHead(200, { 'Content-Type': 'text/plain' });
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
