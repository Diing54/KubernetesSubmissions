const http = require('http');

// Use the PORT environment variable, or default to 3000
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Todo Application Backend\n');
});

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});
