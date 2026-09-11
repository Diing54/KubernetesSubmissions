const http = require('http');
const fs = require('fs');
const path = require('path');

const imagePath = path.join(__dirname, 'images', 'image.jpg');

const isImageCachedAndValid = () => {
  if (!fs.existsSync(imagePath)) return false;
  const stats = fs.statSync(imagePath);
  const now = new Date();
  return Math.round((now - stats.mtime) / 60000) < 10;
};

const downloadImage = async () => {
  try {
    console.log('Fetching new image from Picsum...');
    const response = await fetch('https://picsum.photos/1200', { redirect: 'follow' });
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(imagePath, Buffer.from(buffer));
  } catch (error) {
    console.error('Error downloading image:', error);
  }
};

const server = http.createServer(async (req, res) => {
  if (req.url === '/') {
    if (!isImageCachedAndValid()) await downloadImage();

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
            <form id="todoForm">
              <input type="text" id="todoInput" maxlength="140" placeholder="Enter a new todo..." required />
              <button type="submit">Create TODO</button>
            </form>
          </div>

          <ul id="todoList">
            <!-- Populated dynamically by JavaScript -->
          </ul>

          <script>
            // 1. Fetch the list from the backend and render it
            const fetchTodos = async () => {
              const res = await fetch('/todos');
              const todos = await res.json();
              const list = document.getElementById('todoList');
              list.innerHTML = '';
              todos.forEach(t => {
                const li = document.createElement('li');
                li.textContent = t;
                list.appendChild(li);
              });
            };

            // 2. Intercept the form submission to POST data without reloading the page
            document.getElementById('todoForm').addEventListener('submit', async (e) => {
              e.preventDefault();
              const input = document.getElementById('todoInput');
              const todo = input.value;
              
              await fetch('/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ todo })
              });
              
              input.value = ''; // Clear the box
              fetchTodos();     // Refresh the list immediately
            });

            // Load the list when the page opens
            fetchTodos();
          </script>
        </body>
      </html>
    `);
  } else if (req.url === '/image.jpg') {
    if (fs.existsSync(imagePath)) {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      fs.createReadStream(imagePath).pipe(res);
    } else {
      res.writeHead(404); res.end();
    }
  } else {
    res.writeHead(404); res.end();
  }
});

server.listen(3000, () => console.log('Todo frontend started on port 3000'));
