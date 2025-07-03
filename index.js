require('dotenv').config()
require('./DB/Dbconnection')

const express = require('express')
const cors = require('cors')
// for socket io
const http = require('http')
const { Server } = require('socket.io')

const router = require('./Routes/router')

const app = express()
const server = http.createServer(app) // for socket io
// for socket io
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",// // Allow frontend origin
        methods: ["GET", "POST"]
    }
})

// Middlewares
app.use(express.json())
app.use(cors())
// to give access to uploads folder
app.use('/uploads', express.static('./uploads'))

// Routes
app.use(router)
app.get('/', (req, res) => {
    res.send("Welcome to My Digital Resale Platform Server")
})

// Initialize socket io logic from separate module
require('./SocketioFolder/chatSocket')(io); // a concise way to import a function and call it immediately with io

const PORT = 3000 || process.env.PORT
// before socket io, this was app.listen now=>server.listen
server.listen(PORT, () => {
    console.log(`Server is running at Port ${PORT}`);

})
module.exports = { io, server };