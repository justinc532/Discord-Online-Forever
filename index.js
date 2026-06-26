const WebSocket = require('ws');
const http = require('http');

// 1. DUMMY SERVER FOR RAILWAY PORT BINDING
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Status Bot is Active\n');
});
server.listen(PORT, () => {
    console.log(`Railway Health Check listening on port ${PORT}`);
});

// 2. DISCORD GATEWAY CODE
const token = process.env.token || process.env.TOKEN;
if (!token) {
    console.error("Error: 'token' or 'TOKEN' variable is missing in Railway!");
    process.exit(1);
}

function connect() {
    const ws = new WebSocket('wss://gateway.discord.gg/?v=9&encoding=json');
    let heartbeatTracker;

    ws.on('open', () => {
        const payload = {
            op: 2,
            d: {
                token: token,
                capabilities: 125,
                properties: { os: 'Windows', browser: 'Chrome', device: '' },
                presence: {
                    status: 'idle',
                    afk: false,
                    activities: [{ name: "Custom Status", type: 4, state: "noblecheats.net" }]
                }
            }
        };
        ws.send(JSON.stringify(payload));
    });

    ws.on('message', (data) => {
        const message = JSON.parse(data);
        if (message.op === 10) {
            const heartbeatInterval = message.d.heartbeat_interval;
            if (heartbeatTracker) clearInterval(heartbeatTracker);
            heartbeatTracker = setInterval(() => {
                ws.send(JSON.stringify({ op: 1, d: null }));
            }, heartbeatInterval);
        }
    });

    ws.on('close', () => {
        console.log('Connection lost. Reconnecting in 5 seconds...');
        if (heartbeatTracker) clearInterval(heartbeatTracker);
        setTimeout(connect, 5000);
    });

    ws.on('error', (err) => {
        console.error('WebSocket Error:', err);
    });
}

connect();
console.log("Bot started! Connecting to Discord Gateway...");
