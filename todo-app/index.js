const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // Check if the request is for the root URL
  if (req.url === '/') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    
    // Send a simple HTML page
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Todo App</title>
        </head>
        <body>
          <h1>Welcome to the Todo Application</h1>
          <p>The backend is successfully returning HTML.</p>
        </body>
      </html>
    `);
  } else {
    // Basic 404 for any other routes
    res.statusCode = 404;
    res.end('Not Found\n');
  }
});

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});
