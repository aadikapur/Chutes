const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const {addUser,removeUser,getUser} = require('./users.js')
const PORT = process.env.PORT || 5000;
const router = require('./router');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
var connectCounter = 0

io.on('connection', (socket) => {
  console.log('new connection')
  connectCounter++
  console.log(`${connectCounter} sockets are connected`)

  socket.on('join', ({name, room}, afterJoin) => {
    //add user
    const {error, user} = addUser({id: socket.id, name, room})
    //handle error
    if (error) return afterJoin(error)

    //send welcome message back
    socket.emit('message', {text: `Welcome ${user.name}`})
    //send message to other sockets
    socket.broadcast.to(user.room).emit('message', {text: `${user.name} has joined`})

    //join room
    socket.join(user.room)

    //invokes frontend function that goes after this
    afterJoin()
  })

  socket.on('boardInitialized', (afterInit) => {
    afterInit(getUser(socket.id).playerNum)
  })

  socket.on('iMoved', ({squares}) => {
    const user = getUser(socket.id)
    console.log(`user ${user.name} squares ${squares}`)
    socket.broadcast.to(user.room).emit('otherGuyMoved', {squares})
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)
    console.log('a user disconnected')
    connectCounter--
  })
})

app.use(router)
server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));