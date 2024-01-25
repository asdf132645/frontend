// worker.ts

import * as WebSocket from 'ws';
import * as net from 'net';

const wss = new WebSocket.Server({ noServer: true });
const tcpClient = new net.Socket();

wss.on('connection', (ws) => {
    console.log('Frontend connected');

    ws.on('message', (message) => {
        console.log('Received message from frontend:', message);
        tcpClient.write(message.toString());
    });

    ws.on('close', () => {
        console.log('Frontend disconnected');
        tcpClient.end();
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error.message);
    });
});

tcpClient.connect(11235, 'localhost', () => {
    console.log('Connected to TCP server');
});

tcpClient.on('data', (data) => {
    const message = data.toString();
    console.log('Received data from TCP server:', message);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
});

tcpClient.on('close', () => {
    console.log('Connection to TCP server closed');
    wss.close();
});

tcpClient.on('error', (error) => {
    console.error('TCP client error:', error.message);
});
