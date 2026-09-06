const http = require('http');
const fs = require('fs');
const path = require('path');

// Target the persistent volume mount path
const imagePath = path.join(__dirname, 'images', 'image.jpg');

// Helper function to check if we need to fetch a new image
const isImageCachedAndValid = () => {
  // If the file doesn't exist at all, we definitely need a new one
  if (!fs.existsSync(imagePath)) return false;

  // Get the file's metadata (like modified time)
  const stats = fs.statSync(imagePath);
  const now = new Date();

  // Calculate how many minutes have passed since it was last modified
  const diffMins = Math.round((now - stats.mtime) / 60000);

  // If it's been less than 10 minutes, the cache is still valid
  return diffMins < 10;
};

// Helper function to download the image
const downloadImage = async () => {
  try {
    console.log('Fetching new image from Picsum...');
    // Node 20 has native fetch. We grab a random 1200x1200 image.
    const response = await fetch('https://picsum.photos/1200', { redirect: 'follow' });
    
    // Convert the response stream into a raw memory buffer
    const buffer = await response.arrayBuffer();
    
    // Write the buffer physically to our persistent volume
    fs.writeFileSync(imagePath, Buffer.from(buffer));
    console.log('New image saved successfully.');
  } catch (error) {
    console.error('Error downloading image:', error);
  }
};

const server = http.createServer(async (req, res) => {
  // Route 1: The main HTML page
  if (req.url === '/') {
    // Check our cache logic before serving the page
    if (!isImageCachedAndValid()) {
      await downloadImage();
    }

    // Serve the HTML wrapper
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Todo App</title>
        </head>
        <body>
          <h1>Welcome to the Todo Application</h1>
          <!-- The browser will immediately make a second request to /image.jpg -->
          <img src="/image.jpg" alt="Daily Random" style="max-width: 1200px; height: auto;" />
        </body>
      </html>
    `);
  
  // Route 2: The actual image file requested by the <img> tag
  } else if (req.url === '/image.jpg') {
    if (fs.existsSync(imagePath)) {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      // Pipe the file directly from the hard drive to the HTTP response
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
