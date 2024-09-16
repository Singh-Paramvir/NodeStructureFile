import express, { Request, Response, NextFunction } from 'express';
const cors = require('cors');
import auth from './middleware/auth';
import userRoute from './routes/user.routes';
import memberRoute from './routes/member.routes';
import Avatar from './routes/avatar';
const path = require("path");
const app = express();
const server = require('http').createServer(app);
const port = process.env.PORT || 7777;

// Importing socket.io
const io = require('socket.io')(server, {
  cors: {
    origin: "*", // You can limit this to a specific domain if needed
    methods: ["GET", "POST"],
  },
});

import db from './models';
app.options('*', cors());

app.use(express.json());
app.use(express.static('resources'));
app.use("/avatars", express.static(__dirname + "/avatars"));

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).send();
  } else {
    next(); // Pass control to the next middleware
  }
});

app.use('/api/v1/auth', userRoute);
app.use('/api/v1/member', auth, memberRoute);
app.use('/api/v1/avatar', Avatar);

app.use(express.static(path.resolve("./public")));
app.get("/", (req, res) => {
  return res.sendFile("/public/index.html");
});

app.use((err: any, req: Request, res: Response, next: any) => {
  const status = err.status || 500;
  res.status(status).json({ error: { message: err } });
});

// Room management
const rooms: { [key: string]: { users: string[] } } = {};

io.on('connection', (socket: any) => {
  console.log('A user connected:', socket.id);

  // Automatically create or join a room based on the user's ID
  const roomId = 'default-room'; // Using a default room ID

  // Check if room exists
  if (!rooms[roomId]) {
    rooms[roomId] = { users: [] }; // Create room if it doesn't exist
  }

  // Add user to the room
  rooms[roomId].users.push(socket.id);
  socket.join(roomId);
  console.log(`User ${socket.id} joined room: ${roomId}`);

  // Notify others in the room that a new user has joined
  socket.to(roomId).emit('message', { user: 'system', text: `A new user has joined the room.` });

  // Handle messages within the room
  socket.on('sendMessage', (message: string) => {
    io.to(roomId).emit('message', { user: 'user', text: message });
  });

  // When a user disconnects
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Remove user from the room
    rooms[roomId].users = rooms[roomId].users.filter((id: string) => id !== socket.id);

    // If the room is empty, delete it
    if (rooms[roomId].users.length === 0) {
      delete rooms[roomId];
      console.log(`Room ${roomId} deleted because it became empty.`);
    } else {
      socket.to(roomId).emit('message', { user: 'system', text: `A user has left the room.` });
    }
  });
});

db.sequelize.sync().then(() => {
  server.listen(port, async () => {
    console.log('App Started');
    // cron.schedule('*/3 * * * *', async () => {
    //     console.log('running a task every 10 min');
    //     await codeController.transferIdDepositAssets();
    // });
  });
});
