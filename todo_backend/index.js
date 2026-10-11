const http = require('http');
const { Client } = require('pg');

const PORT = process.env.PORT || 3000;

const client = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'todo-db-svc',
  database: process.env.DB_NAME || 'todo_db',
  password: process.env.DB_PASSWORD,
  port: 5432,
});

client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL');
    return client.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        task VARCHAR(140) NOT NULL
      );
    `);
  })
  // Added process.exit(1) to prevent the "zombie" pod issue we debugged earlier
  .catch(err => {
    console.error('Connection error', err.stack);
    process.exit(1); 
  });

const server = http.createServer(async (req, res) => {
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
        const todoText = data.todo || "";
        const todoLength = todoText.length;
        
        console.log(`[POST /todos] Received new todo request. Length: ${todoLength}`);

        if (todoLength > 0 && todoLength <= 140) {
          await client.query('INSERT INTO todos (task) VALUES ($1);', [todoText]);
          console.log(`[POST /todos] SUCCESS: Added todo "${todoText.substring(0, 20)}..."`);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Created' }));
        } else {
          console.error(`[POST /todos] REJECTED: Todo length is ${todoLength}, which violates the 140 character limit.`);
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
