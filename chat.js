const express = require('express');
const app = express();
const socketio = require('socket.io');

const user = [];

const expressServer = app.listen(8000, () => {
    console.log('start server on 8000');
});

const io = socketio(expressServer);

app.use(express.static(__dirname + '/public'));


io.on('connection', (socket) => {
    console.log(socket.id, "has connected");

    socket.emit('messageFromServer', {
        data: 'Hello World'
    });

    socket.on('messageFromClient', (data) => {
        console.log(data);
    });
});
