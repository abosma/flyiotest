import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import socket from 'socket.io';
import http from 'http';
import { Parser } from './parser';
import { UserMessage } from './models';

dotenv.config();

const port = process.env.PORT;

const app: Express = express();
const server = http.createServer(app);
const io = new socket.Server(server);
const parser: Parser = new Parser();

var users: { id: string, name: string }[] = [];
var messages: UserMessage[] = [];

app.use(express.static('public'));

app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/html/index.html'))
});

io.on('connection', (socket) => {
  console.log('user connected');

  var user = { id: socket.id, name: 'RandomUser' };
  users.push(user);
  io.emit('user joined', { joinedUser: user, userList: users });
  io.emit('chat history', { user: user, messages: messages });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    users = users.filter(user => user.id != socket.id);
    io.emit('user left', { leftUser: user, userList: users });
  });

  socket.on('name change', (info) => {
    var id = info.id;
    var name = info.newName;

    users.forEach((user, index) => {
      if (user.id == id) {
        var newUser = { id: id, name: name };
        users[index] = newUser;
        io.emit('user namechange', { changedUser: newUser, userList: users });
      }
    })
  })

  socket.on('chat message', async (userMessage: UserMessage) => {
    var parsedMessage = await parser.parse(userMessage.message[0]);
    var toReturnMessage: UserMessage = { id: userMessage.id, message: parsedMessage, name: userMessage.name };

    io.emit('chat message', toReturnMessage);
  });
})

server.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});