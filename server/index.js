const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');
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

  socket.on('join', ({room}, afterJoin) => {
    //add user
    const {error, user} = addUser({id: socket.id, room})
    //handle error
    if (error) return afterJoin(error)
    //join room
    socket.join(user.room)
    //invokes frontend function that goes after this
    afterJoin()
  })

  socket.on('boardInitialized', (afterInit) => {
    const user = getUser(socket.id)
    const playerNum = user.playerNum
    if (playerNum === 2) {
      socket.broadcast.to(user.room).emit('blueHasJoined')
    }
    afterInit(playerNum)
  })

  socket.on('iMoved', ({squares}) => {
    const user = getUser(socket.id)
    socket.broadcast.to(user.room).emit('otherGuyMoved', {squares})
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)
    console.log('a user disconnected')
    connectCounter--
  })
})

app.use(router)
app.use(cors())
server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));