import { createReducer, on } from '@ngrx/store';
import { ChannelModel } from '../../models/channel.model';
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
import { MessageModel } from '../../models/message.model';
import { UserDataModel } from '../../models/user-data.model';

export interface UserState {
  user: UserDataModel | null;
  channel: ChannelModel | null;
  users: UserDataModel[];
  channels: ChannelModel[];
  channelMembers: UserDataModel[];
  messages: MessageModel[];
}

export const initialState: UserState = {
  user: null,
  channel: null,
  users: [],
  channels: [],
  channelMembers: [],
  messages: [],
};

export const userReducer = createReducer(
  initialState,
  on(setUser, (state, { user }) => ({ ...structuredClone(state), user })),
  on(setChannel, (state, { channel }) => ({ ...structuredClone(state), channel })),
  on(setUsers, (state, { users }) => ({ ...structuredClone(state), users })),
  on(setUserChannels, (state, { channels }) => ({ ...structuredClone(state), channels })),
  on(setUserChannel, (state, { channel }) => ({
    ...structuredClone(state),
    channels: [...structuredClone(state.channels), channel],
  })),
  on(setMessage, (state, { message }) => ({
    ...structuredClone(state),
    messages: [...structuredClone(state.messages), structuredClone(message)],
  })),
  on(setMessages, (state, { messages }) => ({
    ...structuredClone(state),
    messages: [...structuredClone(messages)],
  })),
  on(setChannelMembers, (state, { channelMembers }) => ({
    ...structuredClone(state),
    channelMembers,
  })),
  on(setUserStatus, (state, { userId, isOnline }) => ({
    ...structuredClone(state),
    channelMembers: [
      ...state.channelMembers.map((channelMember) =>
        channelMember.id === userId ? { ...channelMember, isOnline } : channelMember,
      ),
    ],
  })),
);
