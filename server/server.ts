import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import * as http from 'http';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';
import { Server } from 'socket.io';

type TokenUserData = Pick<UserModel, 'id' | 'username'>;

interface ChannelNameData {
  channelName: string;
}

interface UserData {
  user: UserModel;
}

interface ChannelModel {
  id: string;
  name: string;
}

interface UserChannelModel {
  userId: string;
  channelId: string;
}

interface UserConnectionModel {
  userId: string;
  socketId: string;
}

interface UserModel {
  id: string;
  username: string;
  password: string;
  isOnline: boolean;
}

interface MessageModel {
  id: string;
  fromUser: string;
  channelId: string;
  content: string;
}

let usersConnections: UserConnectionModel[] = [];

const messages: MessageModel[] = [];
const channels: ChannelModel[] = [];
const usersChannels: UserChannelModel[] = [];

let users: UserModel[] = [
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

const ACCESS_TOKEN_SECRET = 'ACCESS_TOKEN_SECRET';
const REFRESH_TOKEN_SECRET = 'REFRESH_TOKEN_SECRET';

const application = express();
const applicationRouter = express.Router();
const httpServer = http.createServer(application);

const authorizationMiddleware: express.RequestHandler = (request, response, next) => {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader) {
    response.status(401).send('Отсутствует токен доступа!');

    return;
  }

  const accessToken = authorizationHeader.replace('Bearer ', '');

  try {
    const { id, username } = jwt.verify(accessToken, ACCESS_TOKEN_SECRET) as TokenUserData;
    const user = users.find((user) => user.id === id && user.username === username);

    if (!user) {
      response.status(403).send('Доступ запрещен!');

      return;
    }

    (request as express.Request & UserData).user = user;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      response.status(401).send('Пользователь не авторизован!');
    }
  }
};

const socketIoServer = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

socketIoServer.on('connection', (socket) => {
  socket.on('message', (message) => {
    const user = users.find(({ id }) => message.userId === id);

    if (!user) {
      return;
    }

    const newMessage: MessageModel = {
      id: messages.length ? String(+messages[messages.length - 1].id + 1) : '0',
      fromUser: user.username,
      channelId: message.channelId,
      content: message.message,
    };

    messages.push(newMessage);

    socketIoServer.emit('message', newMessage);
  });

  socket.on('user_status', (message) => {
    const userConnection: UserConnectionModel = {
      userId: message.userId,
      socketId: socket.id,
    };

    const isConnected = usersConnections.find(
      (usersConnection) =>
        usersConnection.userId === message.userId && usersConnection.socketId === socket.id,
    );

    if (!isConnected) {
      usersConnections.push(userConnection);
    }

    users = users.map((user) => (user.id === message.userId ? { ...user, isOnline: true } : user));

    socketIoServer.emit('user_status', { userId: userConnection.userId, isOnline: true });
  });

  socket.on('disconnect', () => {
    const userStatus = usersConnections.find(({ socketId }) => socketId === socket.id);

    if (!userStatus) {
      return;
    }

    usersConnections = usersConnections.filter(
      (usersStatusesItem) => usersStatusesItem.socketId !== userStatus.socketId,
    );

    users = users.map((user) =>
      user.id === userStatus.userId ? { ...user, isOnline: false } : user,
    );

    socketIoServer.emit('user_status', { userId: userStatus.userId, isOnline: false });
  });
});

application.use(cors({ origin: (_, callback) => callback(null, true), credentials: true }));
application.use(express.json());
application.use(cookieParser());
application.use(applicationRouter);

applicationRouter.get('/login', (request, response) => {
  const refreshToken = request.cookies.refresh_token;

  try {
    const { id, username } = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as TokenUserData;

    const accessToken = jwt.sign({ id, username }, ACCESS_TOKEN_SECRET, {
      expiresIn: '1h',
    });

    const updatedRefreshToken = jwt.sign({ id, username }, REFRESH_TOKEN_SECRET, {
      expiresIn: '1d',
    });

    response.cookie('refresh_token', updatedRefreshToken);
    response.send({ access_token: accessToken });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      response.status(401).send('Пользователь не авторизован!');
    }
  }
});

applicationRouter.post('/login', (request, response) => {
  const { username, password } = request.body;
  const user = users.find((user) => user.username === username && user.password === password);

  if (!user) {
    response.status(401).send('Неверные логин или пароль!');

    return;
  }

  const { id } = user;
  const userData = { id, username };

  const accessToken = jwt.sign(userData, ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign(userData, REFRESH_TOKEN_SECRET, { expiresIn: '1d' });

  response.cookie('refresh_token', refreshToken, { httpOnly: true });
  response.send({ access_token: accessToken });
});

applicationRouter.get('/logout', authorizationMiddleware, (_, response) => {
  response.clearCookie('refresh_token');
  response.send();
});

applicationRouter.get('/user', authorizationMiddleware, (request, response) => {
  const user = (request as express.Request & UserData).user;

  response.send(user);
});

applicationRouter.get('/user/:userId', authorizationMiddleware, (request, response) => {
  const { userId } = request.params;
  const userData = users.find((user) => userId === user.id);

  if (!userData) {
    return;
  }

  response.send(userData);
});

applicationRouter.get('/users', authorizationMiddleware, (_, response) => {
  response.send(users);
});

applicationRouter.get('/user/:userId/channels', authorizationMiddleware, (request, response) => {
  const { userId } = request.params;
  const userChannels = usersChannels.filter((userChannel) => userChannel.userId === userId);

  const userChannelsData = channels.filter(({ id }) =>
    userChannels.map(({ channelId }) => channelId).includes(id),
  );

  response.send(userChannelsData);
});

applicationRouter.post('/user/:userId/channels', authorizationMiddleware, (request, response) => {
  const { userId } = request.params;

  if (!request.body) {
    return;
  }

  const { channelName } = request.body as ChannelNameData;
  const channelId = channels.length ? String(+channels[channels.length - 1].id + 1) : '0';

  const channel: ChannelModel = {
    id: channelId,
    name: channelName,
  };

  const usersChannel: UserChannelModel = {
    userId,
    channelId,
  };

  channels.push(channel);
  usersChannels.push(usersChannel);

  response.send();
});

applicationRouter.get(
  '/user/:userId/channel/:channelId/members',
  authorizationMiddleware,
  (request, response) => {
    const { userId, channelId } = request.params;

    const userChannels = usersChannels.filter((userChannel) => userChannel.userId === userId);
    const userChannel = userChannels.find((userChannel) => userChannel.channelId === channelId);

    if (!userChannel) {
      return;
    }

    const userChannelMembers = users.filter(({ id }) =>
      usersChannels
        .filter((usersChannel) => usersChannel.channelId === userChannel.channelId)
        .map(({ userId }) => userId)
        .includes(id),
    );

    response.send(userChannelMembers);
  },
);

applicationRouter.post(
  '/user/:userId/channel/:channelId/members',
  authorizationMiddleware,
  (request, response) => {
    const { userId, channelId } = request.params;

    const usersChannel: UserChannelModel = {
      userId,
      channelId,
    };

    usersChannels.push(usersChannel);

    usersConnections.forEach((userConnection) => {
      if (userConnection.userId === userId) {
        channels.forEach((channel) => {
          if (channel.id === channelId) {
            socketIoServer.to(userConnection.socketId).emit('user_channel', channel);
          }
        });
      }
    });

    response.send();
  },
);

applicationRouter.get(
  '/user/:userId/channels/:channelId/messages',
  authorizationMiddleware,
  (request, response) => {
    const { channelId } = request.params;

    const userMessages = messages.filter((message) => message.channelId === channelId);

    response.send(userMessages);
  },
);

httpServer.listen(3000, '0.0.0.0');
