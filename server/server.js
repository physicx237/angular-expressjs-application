"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var jwt = require("jsonwebtoken");
var http = require("http");
var cors = require("cors");
var cookieParser = require("cookie-parser");
var socket_io_1 = require("socket.io");
var usersConnections = [];
var messages = [];
var channels = [];
var usersChannels = [];
var users = [
    {
        id: '1',
        username: 'user1',
        password: 'user1',
        isOnline: false,
    },
    {
        id: '2',
        username: 'user2',
        password: 'user2',
        isOnline: false,
    },
    {
        id: '3',
        username: 'user3',
        password: 'user3',
        isOnline: false,
    },
];
var ACCESS_TOKEN_SECRET = 'ACCESS_TOKEN_SECRET';
var REFRESH_TOKEN_SECRET = 'REFRESH_TOKEN_SECRET';
var application = express();
var applicationRouter = express.Router();
var httpServer = http.createServer(application);
var authorizationMiddleware = function (request, response, next) {
    var authorizationHeader = request.headers.authorization;
    if (!authorizationHeader) {
        response.status(401).send('Отсутствует токен доступа!');
        return;
    }
    var accessToken = authorizationHeader.replace('Bearer ', '');
    try {
        var _a = jwt.verify(accessToken, ACCESS_TOKEN_SECRET), id_1 = _a.id, username_1 = _a.username;
        var user = users.find(function (user) { return user.id === id_1 && user.username === username_1; });
        if (!user) {
            response.status(403).send('Доступ запрещен!');
            return;
        }
        request.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            response.status(401).send('Пользователь не авторизован!');
        }
    }
};
var socketIoServer = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*',
    },
});
socketIoServer.on('connection', function (socket) {
    socket.on('message', function (message) {
        var user = users.find(function (_a) {
            var id = _a.id;
            return message.userId === id;
        });
        if (!user) {
            return;
        }
        var newMessage = {
            id: messages.length ? String(+messages[messages.length - 1].id + 1) : '0',
            fromUser: user.username,
            channelId: message.channelId,
            content: message.message,
        };
        messages.push(newMessage);
        socketIoServer.emit('message', newMessage);
    });
    socket.on('user_status', function (message) {
        var userConnection = {
            userId: message.userId,
            socketId: socket.id,
        };
        var isConnected = usersConnections.find(function (usersConnection) {
            return usersConnection.userId === message.userId && usersConnection.socketId === socket.id;
        });
        if (!isConnected) {
            usersConnections.push(userConnection);
        }
        users = users.map(function (user) { return (user.id === message.userId ? __assign(__assign({}, user), { isOnline: true }) : user); });
        socketIoServer.emit('user_status', { userId: userConnection.userId, isOnline: true });
    });
    socket.on('disconnect', function () {
        var userStatus = usersConnections.find(function (_a) {
            var socketId = _a.socketId;
            return socketId === socket.id;
        });
        if (!userStatus) {
            return;
        }
        usersConnections = usersConnections.filter(function (usersStatusesItem) { return usersStatusesItem.socketId !== userStatus.socketId; });
        users = users.map(function (user) {
            return user.id === userStatus.userId ? __assign(__assign({}, user), { isOnline: false }) : user;
        });
        socketIoServer.emit('user_status', { userId: userStatus.userId, isOnline: false });
    });
});
application.use(cors({ origin: function (_, callback) { return callback(null, true); }, credentials: true }));
application.use(express.json());
application.use(cookieParser());
application.use(applicationRouter);
applicationRouter.get('/login', function (request, response) {
    var refreshToken = request.cookies.refresh_token;
    try {
        var _a = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET), id = _a.id, username = _a.username;
        var accessToken = jwt.sign({ id: id, username: username }, ACCESS_TOKEN_SECRET, {
            expiresIn: '1h',
        });
        var updatedRefreshToken = jwt.sign({ id: id, username: username }, REFRESH_TOKEN_SECRET, {
            expiresIn: '1d',
        });
        response.cookie('refresh_token', updatedRefreshToken);
        response.send({ access_token: accessToken });
    }
    catch (error) {
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            response.status(401).send('Пользователь не авторизован!');
        }
    }
});
applicationRouter.post('/login', function (request, response) {
    var _a = request.body, username = _a.username, password = _a.password;
    var user = users.find(function (user) { return user.username === username && user.password === password; });
    if (!user) {
        response.status(401).send('Неверные логин или пароль!');
        return;
    }
    var id = user.id;
    var userData = { id: id, username: username };
    var accessToken = jwt.sign(userData, ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    var refreshToken = jwt.sign(userData, REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
    response.cookie('refresh_token', refreshToken, { httpOnly: true });
    response.send({ access_token: accessToken });
});
applicationRouter.get('/logout', authorizationMiddleware, function (_, response) {
    response.clearCookie('refresh_token');
    response.send();
});
applicationRouter.get('/user', authorizationMiddleware, function (request, response) {
    var user = request.user;
    response.send(user);
});
applicationRouter.get('/user/:userId', authorizationMiddleware, function (request, response) {
    var userId = request.params.userId;
    var userData = users.find(function (user) { return userId === user.id; });
    if (!userData) {
        return;
    }
    response.send(userData);
});
applicationRouter.get('/users', authorizationMiddleware, function (_, response) {
    response.send(users);
});
applicationRouter.get('/user/:userId/channels', authorizationMiddleware, function (request, response) {
    var userId = request.params.userId;
    var userChannels = usersChannels.filter(function (userChannel) { return userChannel.userId === userId; });
    var userChannelsData = channels.filter(function (_a) {
        var id = _a.id;
        return userChannels.map(function (_a) {
            var channelId = _a.channelId;
            return channelId;
        }).includes(id);
    });
    response.send(userChannelsData);
});
applicationRouter.post('/user/:userId/channels', authorizationMiddleware, function (request, response) {
    var userId = request.params.userId;
    if (!request.body) {
        return;
    }
    var channelName = request.body.channelName;
    var channelId = channels.length ? String(+channels[channels.length - 1].id + 1) : '0';
    var channel = {
        id: channelId,
        name: channelName,
    };
    var usersChannel = {
        userId: userId,
        channelId: channelId,
    };
    channels.push(channel);
    usersChannels.push(usersChannel);
    response.send();
});
applicationRouter.get('/user/:userId/channel/:channelId/members', authorizationMiddleware, function (request, response) {
    var _a = request.params, userId = _a.userId, channelId = _a.channelId;
    var userChannels = usersChannels.filter(function (userChannel) { return userChannel.userId === userId; });
    var userChannel = userChannels.find(function (userChannel) { return userChannel.channelId === channelId; });
    if (!userChannel) {
        return;
    }
    var userChannelMembers = users.filter(function (_a) {
        var id = _a.id;
        return usersChannels
            .filter(function (usersChannel) { return usersChannel.channelId === userChannel.channelId; })
            .map(function (_a) {
            var userId = _a.userId;
            return userId;
        })
            .includes(id);
    });
    response.send(userChannelMembers);
});
applicationRouter.post('/user/:userId/channel/:channelId/members', authorizationMiddleware, function (request, response) {
    var _a = request.params, userId = _a.userId, channelId = _a.channelId;
    var usersChannel = {
        userId: userId,
        channelId: channelId,
    };
    usersChannels.push(usersChannel);
    usersConnections.forEach(function (userConnection) {
        if (userConnection.userId === userId) {
            channels.forEach(function (channel) {
                if (channel.id === channelId) {
                    socketIoServer.to(userConnection.socketId).emit('user_channel', channel);
                }
            });
        }
    });
    response.send();
});
applicationRouter.get('/user/:userId/channels/:channelId/messages', authorizationMiddleware, function (request, response) {
    var channelId = request.params.channelId;
    var userMessages = messages.filter(function (message) { return message.channelId === channelId; });
    response.send(userMessages);
});
httpServer.listen(3000, '0.0.0.0');
