const express = require('express');
const app = express();
const socketio = require('socket.io');

const expressServer = app.listen(8000, () => {
    console.log('start server on 8000');
});

const io = socketio(expressServer);

const users = [];
const scoketUserIdMapping = {};
const messages = [];
let notifications = [];

app.use(express.static(__dirname + '/public'));

app.get('/login', (req, res) => {

    const userName = req.query.username;
    const visibleName = req.query.visibleName;

    if (!userName || !visibleName) {
        res.status(322).json({message: 'Both username and visible name required'});
        return;
    }

    if (userName.toLowerCase() === visibleName.toLowerCase()) {
        res.status(322).json({message: 'cannot have same username and visible name'});
        return;
    }

    const isUserWithNameExists = users.filter(user => user.userName.toLowerCase() === userName.toLowerCase()).length != 0;

    if (isUserWithNameExists) {
        res.status(322).json({message: 'User with same name exists'});
        return;
    }

    users.push({
        userName: userName.toLowerCase(),
        visibleName: visibleName
    });

    res.status(200).json({message: 'Success'});
});

function getUserMessages(user) {
    return messages.filter(message => message.from === user || message.to === user);
}

function getUserNotification(user) {
    return notifications.filter(notification => notification.to === user);
}

io.of('default').on('connection', (socket) => {
    console.log(socket.id, "has connected");

    socket.emit('messageFromServer', {
        data: 'Hello World'
    });

    socket.on('MESSAGE', (data, callback) => {
        const message = {
            from: data.from,
            to: data.to,
            data: data.data,
            sendAt: new Date().toJSON()
        };

        const notification = {
            from: data.from,
            to: data.to
        };

        messages.push(message);
        notifications.push(notification);
        callback(message);
        io.of('default').to(data.to).emit('ALL_MESSAGES', getUserMessages(data.to));
        io.of('default').to(data.from).emit('ALL_MESSAGES', getUserMessages(data.from));
        console.log(notifications);
        io.of('default').to(data.to).emit('NOTIFICATION', getUserNotification(data.to));
    });

    socket.on('REMOVE_NOTIFICATION', (data) => {
        notifications = notifications.filter(notification => !(notification.from === data.from && notification.to === data.to));
    });

    socket.on('USER_RENDER_COMPLETE', () => {
       const roomName =  scoketUserIdMapping[socket.id];
        io.of('default').to(roomName).emit('NOTIFICATION', getUserNotification(roomName));

    });

    socket.on('JOIN_CHAT', (data, callback) => {
        const isUserWithNameExists = (users.filter(user => user.userName.toLowerCase()
            === data.userInfo.userName.toLowerCase())).length != 0;

        if (!isUserWithNameExists) {
            if (data.userInfo.userName !== data.userInfo.visibleName) {
                users.push({
                    userName: data.userInfo.userName.toLowerCase(),
                    visibleName: data.userInfo.visibleName
                });
            }
        }

        scoketUserIdMapping[socket.id] = data.userInfo.userName.toLowerCase()
        const roomId = data.userInfo.userName.toLowerCase();
        socket.join(roomId);

        io.of('default').emit('NEW_USER_ADDED', users);
        io.of('default').to(roomId).emit('ALL_MESSAGES', getUserMessages(roomId));

        console.log(messages);
    });
});
