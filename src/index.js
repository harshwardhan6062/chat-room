const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const filter = require('bad-words')
const { generateMessage } = require('./utils/messages.js')
const { addUser, removeUser, getRoomUsers, getUser } = require('./utils/user.js')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname , '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection' , (socket) => {
    //Function on connection
    console.log('New chat connection')

    //entering into a chat room
    socket.on('join',({username, chatRoom},callback) => {
        const { error, user } = addUser({
            id: socket.id,
            username: username,
            room: chatRoom
        })

        if(error)
        return callback(error)

        console.log(user.id + " " + user.username + " " + user.room)
        
        socket.join(user.room)

        socket.emit('message',generateMessage('Welcome!' ,undefined))
        io.to(user.room).emit('message',generateMessage(user.username + ' entered the chatroom!', undefined))
        io.to(user.room).emit('renderUsersList', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
        callback()
    })

    //for sending message 
    socket.on('sendMessage' , (message,callback) => {
        if(message == '')
        return callback('The message can not be empty!')
        const f = new filter()

        if(f.isProfane(message))
        return callback('The message should not be profrained!')

        const id = socket.id

        const user = getUser(id)

        io.to(user.room).emit('message' , generateMessage('New message: ' + message, user.username))
        callback()
    })

    //on sharing location
    socket.on('shareLocation' , (position,callback) => {
        const locationMessage = 'Current Location: https://www.google.com/maps?q=' + position.latitude + ',' + position.longitude
        const currentLocation = 'https://www.google.com/maps?q=' + position.latitude + ',' + position.longitude
        const user = getUser(socket.id)
        io.to(user.room).emit('shareLocationMessage' , generateMessage(currentLocation, user.username))
        callback('Location shared successfully!')
    })

    //on disconnecting
    socket.on('disconnect' , () => {
        const user = removeUser(socket.id)
        
        if(user)
        {
            socket.broadcast.to(user.room).emit('message',generateMessage(user.username + ' has left', undefined))
            if(user.room)
            io.to(user.room).emit('renderUsersList', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    })
})

server.listen(port , () => {
    console.log('App is running succesfully')
})