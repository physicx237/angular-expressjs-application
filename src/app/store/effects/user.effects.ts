import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { exhaustMap, filter, map, of, switchMap, tap, withLatestFrom } from 'rxjs';
import { ChatService } from '../../services/chat/chat.service';
import {
  addChannelMember,
  addUserChannel,
  getChannelMembers,
  getMessages,
  getUser,
  getUserChannels,
  getUsers,
  sendMessage,
  sendUserId,
  setChannelMembers,
  setMessage,
  setMessages,
  setUser,
  setUserChannel,
  setUserChannels,
  setUsers,
  setUserStatus,
} from '../actions/user-page.actions';
import { channelSelector, userSelector } from '../selectors/user.selectors';

@Injectable({
  providedIn: 'root',
})
export class UserEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly chatService = inject(ChatService);

  getMessage$ = createEffect(() =>
    this.chatService.getMessage().pipe(
      withLatestFrom(this.store.select(channelSelector)),
      filter(([message, channel]) => channel!.id === message.channelId),
      map(([message]) => setMessage({ message })),
    ),
  );

  getUserChannel$ = createEffect(() =>
    this.chatService.getUserChannel().pipe(map((channel) => setUserChannel({ channel }))),
  );

  getUserStatus$ = createEffect(() => {
    return this.chatService
      .getUserStatus()
      .pipe(map(({ userId, isOnline }) => setUserStatus({ userId, isOnline })));
  });

  getUsers$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(getUsers),
      exhaustMap(() =>
        this.chatService.getUsers().pipe(map((response) => setUsers({ users: response.body! }))),
      ),
    );
  });

  getMessages$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(getMessages),
      withLatestFrom(this.store.select(userSelector)),
      exhaustMap(([{ channelId }, user]) =>
        this.chatService
          .getMessages(user!.id, channelId)
          .pipe(map((messages) => setMessages({ messages }))),
      ),
    );
  });

  getUserChannels$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(getUserChannels),
      exhaustMap(({ userId }) =>
        this.chatService
          .getUserChannels(userId)
          .pipe(map((response) => setUserChannels({ channels: response.body! }))),
      ),
    );
  });

  addUserChannel$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(addUserChannel),
      withLatestFrom(this.store.select(userSelector)),
      exhaustMap(([{ channelName }, user]) =>
        this.chatService
          .addUserChannel(user!.id, channelName)
          .pipe(map(() => getUserChannels({ userId: user!.id }))),
      ),
    );
  });

  addChannelMember$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(addChannelMember),
      withLatestFrom(this.store.select(channelSelector)),
      exhaustMap(([{ userId }, channel]) =>
        this.chatService
          .addChannelMember(userId, channel!.id)
          .pipe(map(() => getChannelMembers({ channelId: channel!.id }))),
      ),
    );
  });

  sendUserId$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(sendUserId),
        map(({ userId }) => userId),
        tap((userId) => this.chatService.sendUserId(userId)),
      );
    },
    {
      dispatch: false,
    },
  );

  getUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(getUser),
      exhaustMap(() =>
        this.chatService.getUser().pipe(
          switchMap((response) => {
            const user = response.body!;

            return of(
              setUser({ user }),
              getUserChannels({ userId: user.id }),
              sendUserId({ userId: user.id }),
            );
          }),
        ),
      ),
    );
  });

  getChannelMembers$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(getChannelMembers),
      withLatestFrom(this.store.select(userSelector)),
      exhaustMap(([{ channelId }, user]) =>
        this.chatService
          .getChannelMembers(user!.id, channelId)
          .pipe(
            switchMap((response) =>
              of(
                setChannelMembers({ channelMembers: response.body! }),
                sendUserId({ userId: user!.id }),
              ),
            ),
          ),
      ),
    );
  });

  sendMessage$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(sendMessage),
        withLatestFrom(this.store.select(userSelector), this.store.select(channelSelector)),
        map(([{ message }, user, channel]) => ({
          userId: user!.id,
          channelId: channel!.id,
          message,
        })),
        tap((message) => this.chatService.sendMessage(message)),
      );
    },
    {
      dispatch: false,
    },
  );
}
