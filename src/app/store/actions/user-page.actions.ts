import { createAction, props } from '@ngrx/store';
import { UserModel } from '../../models/user.model';
import { ChannelModel } from '../../models/channel.model';
import { MessageModel } from '../../models/message.model';

export const getUser = createAction('[User Page] Get User');
export const getUsers = createAction('[User Page] Get Users');
export const sendMessage = createAction('[User Page] Send Message', props<{ message: string }>());
export const sendUserId = createAction('[User Page] Send User ID', props<{ userId: string }>());
export const getMessages = createAction('[User Page] Get Messages', props<{ channelId: string }>());

export const setMessage = createAction(
  '[User Page] Set Message',
  props<{ message: MessageModel }>(),
);

export const setUserChannel = createAction(
  '[User Page] Set User Channel',
  props<{ channel: ChannelModel }>(),
);

export const setUserStatus = createAction(
  '[User Page] Set User Status',
  props<{ userId: string; isOnline: boolean }>(),
);

export const setMessages = createAction(
  '[User Page] Set Messages',
  props<{ messages: MessageModel[] }>(),
);

export const setUser = createAction(
  '[User Page] Set User',
  props<{ user: Omit<UserModel, 'password'> }>(),
);

export const setUsers = createAction(
  '[User Page] Set Users',
  props<{ users: Omit<UserModel, 'password'>[] }>(),
);

export const getUserChannels = createAction(
  '[User Page] Get User Channels',
  props<{ userId: string }>(),
);

export const setUserChannels = createAction(
  '[User Page] Set User Channels',
  props<{ channels: ChannelModel[] }>(),
);

export const addUserChannel = createAction(
  '[User Page] Add User Channel',
  props<{ channelName: string }>(),
);

export const getChannelMembers = createAction(
  '[User Page] Get Channel Members',
  props<{ channelId: string }>(),
);

export const setChannelMembers = createAction(
  '[User Page] Set Channel Members',
  props<{ channelMembers: Omit<UserModel, 'password'>[] }>(),
);

export const addChannelMember = createAction(
  '[User Page] Add Channel Member',
  props<{ userId: string }>(),
);

export const setChannel = createAction(
  '[User Page] Set Channel ID',
  props<{ channel: ChannelModel }>(),
);
