const http = require('http');
const fs = require('fs');
const path = require('path');

const imagePath = path.join(__dirname, 'images', 'image.jpg');

const isImageCachedAndValid = () => {
  if (!fs.existsSync(imagePath)) return false;
  const stats = fs.statSync(imagePath);
  const now = new Date();
  const diffMins = Math.round((now - stats.mtime) / 60000);
  return diffMins < 10;
};

const downloadImage = async () => {
  try {
    console.log('Fetching new image from Picsum...');
    const response = await fetch('https://picsum.photos/1200', { redirect: 'follow' });
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(imagePath, Buffer.from(buffer));
    console.log('New image saved successfully.');
  } catch (error) {
    console.error('Error downloading image:', error);
  }
};

const server = http.createServer(async (req, res) => {
  if (req.url === '/') {
    if (!isImageCachedAndValid()) {
      await downloadImage();
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Todo App</title>
          <style>
            body { font-family: sans-serif; padding: 20px; max-width: 800px; }
            img { max-width: 400px; height: auto; border-radius: 8px; margin-bottom: 20px; }
            .todo-form { margin-bottom: 20px; }
            input[type="text"] { padding: 8px; width: 300px; margin-right: 10px; }
            button { padding: 8px 16px; cursor: pointer; }
            ul { list-style-type: disc; padding-left: 20px; }
            li { margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <img src="/image.jpg" alt="Daily Random" />
          
          <div class="todo-form">
            <input type="text" maxlength="140" placeholder="Enter a new todo (max 140 chars)..." />
            <button type="button">Create TODO</button>
          </div>

          <ul>
            <li>Master Kubernetes volumes</li>
            <li>Learn how to route traffic with Ingress</li>
            <li>Deploy a persistent database</li>
          </ul>
        </body>
      </html>
    `);
  
  } else if (req.url === '/image.jpg') {
    if (fs.existsSync(imagePath)) {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      fs.createReadStream(imagePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end();
    }
  } else {
    res.writeHead(404);
    res.end();
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Todo app started on port ${PORT}`);
});
