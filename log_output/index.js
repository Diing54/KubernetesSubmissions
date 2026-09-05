const http = require('http');
const crypto = require('crypto');

// Generate the string once on startup
const randomString = crypto.randomUUID();

// Output the string with a timestamp every 5 seconds to logs
setInterval(() => {
  console.log(`${new Date().toISOString()}: ${randomString}`);
}, 5000);

// HTTP Server to expose the status to the browser/curl
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`${new Date().toISOString()}: ${randomString}\n`);
  } else {
    res.writeHead(404);
    res.end();
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});
