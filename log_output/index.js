const crypto = require('crypto');

// Generate the string once on startup
const randomString = crypto.randomUUID();

// Output the string with a timestamp every 5 seconds
setInterval(() => {
  console.log(`${new Date().toISOString()}: ${randomString}`);
}, 5000);
