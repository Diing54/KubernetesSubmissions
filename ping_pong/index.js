const http = require('http');
const { Client } = require('pg');

const client = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'ping-pong-db-svc',
  database: process.env.DB_NAME || 'pingpong',
  password: process.env.DB_PASSWORD, // Injected via Secret
  port: 5432,
});

client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL');
    return client.query(`
      CREATE TABLE IF NOT EXISTS pings (
        id SERIAL PRIMARY KEY,
        count INT NOT NULL
      );
      INSERT INTO pings (id, count) VALUES (1, 0) ON CONFLICT (id) DO NOTHING;
    `);
  })
  .catch(err => console.error('Connection error', err.stack));

const server = http.createServer(async (req, res) => {
  if (req.url === '/pingpong') {
    try {
      const result = await client.query('UPDATE pings SET count = count + 1 WHERE id = 1 RETURNING count;');
      const count = result.rows[0].count;
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(`pong ${count}\n`);
    } catch (err) {
      res.writeHead(500); res.end('Database error\n');
    }
  } else if (req.url === '/count') {
    try {
      const result = await client.query('SELECT count FROM pings WHERE id = 1;');
      const count = result.rows[0].count;
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(`${count}`);
    } catch (err) {
      res.writeHead(500); res.end('Database error\n');
    }
  } else {
    res.writeHead(404); res.end();
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Ping-pong server started on port ${PORT}`);
});
