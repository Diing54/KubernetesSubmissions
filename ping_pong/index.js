const http = require('http');

let counter = 0;

const server = http.createServer((req, res) => {
  if (req.url === '/pingpong') {
    counter++;
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`pong ${counter}\n`);
  } else if (req.url === '/count') {
    // New internal API endpoint for the log-output app
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`${counter}`);
  } else {
    res.writeHead(404);
    res.end();
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Ping-pong server started on port ${PORT}`);
});
