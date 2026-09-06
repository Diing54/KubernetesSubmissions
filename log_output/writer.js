const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const randomString = crypto.randomUUID();
const filePath = path.join(__dirname, 'files', 'status.txt');

// Output the string with a timestamp every 5 seconds to the shared file
setInterval(() => {
  const content = `${new Date().toISOString()}: ${randomString}\n`;
  fs.writeFile(filePath, content, (err) => {
    if (err) console.error(err);
  });
}, 5000);
