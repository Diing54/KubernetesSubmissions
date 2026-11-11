const http = require('http');
const { Client } = require('pg');

const PORT = process.env.PORT || 3000;

let isHealthy = true;
let isDbConnected = false;

const client = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'todo-db-svc',
  database: process.env.DB_NAME || 'todo_db',
  password: process.env.DB_PASSWORD,
  port: 5432,
});

const connectWithRetry = () => {
  client.connect()
    .then(() => {
      console.log('Connected to PostgreSQL');
      isDbConnected = true;
      return client.query(`
        CREATE TABLE IF NOT EXISTS todos (
          id SERIAL PRIMARY KEY,
          task VARCHAR(140) NOT NULL
        );
      `);
    })
    .catch(err => {
      console.error('Database connection failed, retrying in 5s...', err.message);
      isDbConnected = false;
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

const server = http.createServer(async (req, res) => {
  // 1. Health check endpoint for Readiness and Liveness probes
  if (req.url === '/healthz' && req.method === 'GET') {
    if (!isHealthy || !isDbConnected) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'unhealthy' }));
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok' }));
  }

  // 2. Endpoint to simulate app breakdown for Liveness testing
  if (req.url === '/break' && req.method === 'POST') {
    console.error('FATAL: Application breakdown initiated via /break endpoint');
    isHealthy = false;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Application broken' }));
  }

  if (req.url === '/todos' && req.method === 'GET') {
    try {
      const result = await client.query('SELECT task FROM todos ORDER BY id ASC;');
      const todosArray = result.rows.map(row => row.task);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(todosArray));
    } catch (err) {
      console.error(`[GET /todos] Database error: ${err.message}`);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Database error' }));
    }
  } else if (req.url === '/todos' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const todoText = data.todo || '';
        const todoLength = todoText.length;
        
        if (todoLength > 0 && todoLength <= 140) {
          await client.query('INSERT INTO todos (task) VALUES ($1);', [todoText]);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Created' }));
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid or too long' }));
        }
      } catch (err) {
        console.error(`[POST /todos] Database error: ${err.message}`);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Database error' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
