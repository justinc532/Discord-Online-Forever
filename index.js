const WebSocket = require('ws');

// Pulls your token from Railway's environment variables
const token = process.env.token;

if (!token) {
  console.error("Error: 'token' variable is missing in Railway!");
  process.exit(1);
}

function connect() {
  const ws = new WebSocket('wss://gateway.discord.gg/?v=9&encoding=json');

  ws.on('open', () => {
    // Authenticate with Discord and set your permanent status text
    const payload = {
      op: 2,
      d: {
        token: token,
        capabilities: 125,
        properties: {
          os: 'Windows',
          browser: 'Chrome',
          device: ''
        },
        presence: {
          status: 'online',
          afk: false,
          activities: [{
            name: "Custom Status",
            type: 4, 
            state: "dont buy from noblecheats.net" 
          }]
        }
      }
    };
    ws.send(JSON.stringify(payload));
  });

  ws.on('message', (data) => {
    const message = JSON.parse(data);
    // Respond to Discord's heartbeat request to stay online
    if (message.op === 10) {
      const heartbeatInterval = message.d.heartbeat_interval;
      setInterval(() => {
        ws.send(JSON.stringify({ op: 1, d: null }));
      }, heartbeatInterval);
    }
  });

  ws.on('close', () => {
    console.log('Connection lost. Reconnecting in 5 seconds...');
    setTimeout(connect, 5000);
  });

  ws.on('error', (err) => {
    console.error('WebSocket Error:', err);
  });
}

connect();
console.log("Bot started! Connecting to Discord Gateway...");
