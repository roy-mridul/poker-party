import path from 'path';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { RoomManager } from './rooms';
import { registerSocketHandlers } from './socketHandlers';

const PORT = Number(process.env.PORT) || 3001;
const CLIENT_DIST = path.join(__dirname, '../../client/dist');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const roomManager = new RoomManager();

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/rooms', (_req, res) => {
  const roomId = roomManager.createRoom();
  res.json({ roomId });
});

app.get('/api/rooms/:roomId', (req, res) => {
  res.json({ exists: roomManager.roomExists(req.params.roomId) });
});

app.use(express.static(CLIENT_DIST));

// SPA fallback so client-side routes like /room/:roomId survive a page refresh.
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(CLIENT_DIST, 'index.html'));
});

registerSocketHandlers(io, roomManager);

httpServer.listen(PORT, () => {
  console.log(`Planning Poker server listening on port ${PORT}`);
});
