const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "webwork-crm" }),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu"
    ],
  }
});

client.on('qr', (qr) => {
  console.log('QR RECEIVED', qr);
  process.exit(0);
});

client.on('ready', () => {
  console.log('Client is ready!');
  process.exit(0);
});

console.log('Initializing client...');
client.initialize().catch(err => {
  console.error('Initialization error:', err);
  process.exit(1);
});
