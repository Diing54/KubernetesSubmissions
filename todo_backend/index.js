const http = require('http');

// Pull port from the environment, fallback to 3000
const PORT = process.env.PORT || 3000;

let todos = [
  "Master Kubernetes volumes",
  "Learn how to route traffic with Ingress",
  "Deploy a persistent database"
];

const server = http.createServer((req, res) => {
  if (req.url === '/todos' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(todos));
  } else if (req.url === '/todos' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (data.todo && data.todo.length <= 140) {
          todos.push(data.todo);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Created' }));
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid or too long' }));
        }
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
