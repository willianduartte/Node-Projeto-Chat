const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const path = require('path')

const app = express()
const server = createServer(app)
const io = new Server(server)

app.use(express.static(path.join(__dirname, '../public')))

server.listen(4000)

let connectedUsers = []

io.on('connection', socket => {
  console.log('Conexão detectada...')

  socket.on('join-request', username => {
    socket.username = username
    connectedUsers.push(username)
    console.log(connectedUsers)

    socket.emit('user-ok', connectedUsers)
    socket.broadcast.emit('list-update', {
      joined: username,
      list: connectedUsers
    })
  })

  socket.on('disconnect', () => {
    connectedUsers = connectedUsers.filter(u => u != socket.username)
    console.log(connectedUsers)

    socket.broadcast.emit('list-update', {
      left: socket.username,
      list: connectedUsers
    })
  })

  socket.on('send-msg', txt => {
    let obj = {
      username: socket.username,
      message: txt
    }

    // socket.emit('show-msg', obj)
    socket.broadcast.emit('show-msg', obj)
  })
})
