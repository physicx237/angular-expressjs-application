import { ChannelModel } from '../../models/channel.model';
import { MessageModel } from '../../models/message.model';
import { UserDataModel } from '../../models/user-data.model';
import { UserStatusModel } from '../../services/chat/models/user-status.model';
import {
  setChannel,
  setChannelMembers,
  setMessage,
  setMessages,
  setUser,
  setUserChannel,
  setUserChannels,
  setUsers,
  setUserStatus,
} from '../actions/user-page.actions';
import { UserState, initialState, userReducer } from './user.reducers';

describe('User Reducers', () => {
  describe('setUser action', () => {
    it('should set user', () => {
      const user: UserDataModel = {
        id: '1',
        username: 'user1',
        isOnline: false,
      };

      const newState: UserState = {
        user,
        channel: null,
        users: [],
        channels: [],
        channelMembers: [],
        messages: [],
      };

      const action = setUser({ user });
      const state = userReducer(initialState, action);

      expect(state).toEqual(newState);
      expect(state).not.toBe(initialState);
    });
  });

  describe('setChannel action', () => {
    it('should set channel', () => {
      const channel: ChannelModel = {
        id: '1',
        name: 'Channel 1',
      };

      const newState: UserState = {
        user: null,
        channel,
        users: [],
        channels: [],
        channelMembers: [],
        messages: [],
      };

      const action = setChannel({ channel });
      const state = userReducer(initialState, action);

      expect(state).toEqual(newState);
      expect(state).not.toBe(initialState);
    });
  });

  describe('setUsers action', () => {
    it('should set users', () => {
      const users: UserDataModel[] = [
        {
          id: '1',
          username: 'user1',
          isOnline: false,
        },
        {
          id: '2',
          username: 'user2',
          isOnline: false,
        },
        {
          id: '3',
          username: 'user3',
          isOnline: false,
        },
      ];

      const newState: UserState = {
        user: null,
        channel: null,
        users,
        channels: [],
        channelMembers: [],
        messages: [],
      };

      const action = setUsers({ users });
      const state = userReducer(initialState, action);

      expect(state).toEqual(newState);
      expect(state).not.toBe(initialState);
    });
  });

  describe('setUserChannels action', () => {
    it('should set channels', () => {
      const channels: ChannelModel[] = [
        {
          id: '1',
          name: 'Channel 1',
        },
        {
          id: '2',
          name: 'Channel 2',
        },
        {
          id: '3',
          name: 'Channel 3',
        },
      ];

      const newState: UserState = {
        user: null,
        channel: null,
        users: [],
        channels,
        channelMembers: [],
        messages: [],
      };

      const action = setUserChannels({ channels });
      const state = userReducer(initialState, action);

      expect(state).toEqual(newState);
      expect(state).not.toBe(initialState);
    });
  });

  describe('setUserChannel action', () => {
    it('should set channel', () => {
      const channel: ChannelModel = {
        id: '1',
        name: 'Channel 1',
      };

      const newState: UserState = {
        user: null,
        channel: null,
        users: [],
        channels: [channel],
        channelMembers: [],
        messages: [],
      };

      const action = setUserChannel({ channel });
      const state = userReducer(initialState, action);

      expect(state).toEqual(newState);
      expect(state).not.toBe(initialState);
    });
  });

  describe('setMessage action', () => {
    it('should set message', () => {
      const message: MessageModel = {
        id: '1',
        fromUser: '1',
        channelId: '1',
        content: 'Hello!',
      };

      const newState: UserState = {
        user: null,
        channel: null,
        users: [],
        channels: [],
        channelMembers: [],
        messages: [message],
      };

      const action = setMessage({ message });
      const state = userReducer(initialState, action);

      expect(state).toEqual(newState);
      expect(state).not.toBe(initialState);
    });
  });

  describe('setMessages action', () => {
    it('should set messages', () => {
      const messages: MessageModel[] = [
        {
          id: '1',
          fromUser: '1',
          channelId: '1',
          content: 'Hello!',
        },
        {
          id: '2',
          fromUser: '2',
          channelId: '1',
          content: 'Hello!',
        },
        {
          id: '3',
          fromUser: '3',
          channelId: '1',
          content: 'Hello!',
        },
      ];

      const newState: UserState = {
        user: null,
        channel: null,
        users: [],
        channels: [],
        channelMembers: [],
        messages,
      };

      const action = setMessages({ messages });
      const state = userReducer(initialState, action);

      expect(state).toEqual(newState);
      expect(state).not.toBe(initialState);
    });
  });

  describe('setChannelMembers action', () => {
    it('should set channel members', () => {
      const channelMembers: UserDataModel[] = [
        {
          id: '1',
          username: 'user1',
          isOnline: false,
        },
        {
          id: '2',
          username: 'user2',
          isOnline: false,
        },
        {
          id: '3',
          username: 'user3',
          isOnline: false,
        },
      ];

      const newState: UserState = {
        user: null,
        channel: null,
        users: [],
        channels: [],
        channelMembers,
        messages: [],
      };

      const action = setChannelMembers({ channelMembers });
      const state = userReducer(initialState, action);

      expect(state).toEqual(newState);
      expect(state).not.toBe(initialState);
    });
  });

  describe('setUserStatus action', () => {
    it('should set user status', () => {
      const initialState: UserState = {
        user: null,
        channel: null,
        users: [],
        channels: [],
        channelMembers: [
          {
            id: '1',
            username: 'user1',
            isOnline: false,
          },
          {
            id: '2',
            username: 'user2',
            isOnline: false,
          },
          {
            id: '3',
            username: 'user3',
            isOnline: false,
          },
        ],
        messages: [],
      };

      const newState: UserState = {
        user: null,
        channel: null,
        users: [],
        channels: [],
        channelMembers: [
          {
            id: '1',
            username: 'user1',
            isOnline: false,
          },
          {
            id: '2',
            username: 'user2',
            isOnline: true,
          },
          {
            id: '3',
            username: 'user3',
            isOnline: false,
          },
        ],
        messages: [],
      };

      const userStatus: UserStatusModel = {
        userId: '2',
        isOnline: true,
      };

      const action = setUserStatus({ userId: userStatus.userId, isOnline: userStatus.isOnline });
      const state = userReducer(initialState, action);

      expect(state).toEqual(newState);
      expect(state).not.toBe(initialState);
    });
  });
});
