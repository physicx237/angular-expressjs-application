import { createSelector } from '@ngrx/store';
import { UserState } from '../reducers/user.reducers';

interface AppState {
  user: UserState;
}

const selectUser = (appState: AppState) => appState.user;

export const userSelector = createSelector(selectUser, (userState) => userState.user);
export const usersSelector = createSelector(selectUser, (userState) => userState.users);
export const channelSelector = createSelector(selectUser, (userState) => userState.channel);
export const channelsSelector = createSelector(selectUser, (userState) => userState.channels);
export const messagesSelector = createSelector(selectUser, (userState) => userState.messages);

export const channelMembersSelector = createSelector(
  selectUser,
  (userState) => userState.channelMembers,
);
