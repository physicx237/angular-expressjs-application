import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MonoTypeOperatorFunction, pipe, retry, takeWhile, tap } from 'rxjs';
import { Socket } from 'ngx-socket-io';
import { API_URL } from '../../app.config';
import { MessageModel } from '../../models/message.model';
import { ChannelModel } from '../../models/channel.model';
import { AuthorizationService } from '../authorization/authorization.service';
import { SendMessageModel } from './models/send-message.model';
import { UserStatusModel } from './models/user-status.model';
import { UserDataModel } from '../../models/user-data.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly socket = inject(Socket);
  private readonly apiUrl = inject(API_URL);
  private readonly authorizationService = inject(AuthorizationService);

  getMessage() {
    return this.socket.fromEvent<MessageModel>('message');
  }

  getUserStatus() {
    return this.socket.fromEvent<UserStatusModel>('user_status');
  }

  getUserChannel() {
    return this.socket.fromEvent<ChannelModel>('user_channel');
  }

  sendUserId(userId: string) {
    this.socket.emit('user_status', { userId });
  }

  getMessages(userId: string, channelId: string) {
    const url = this.getUserChannelMessagesUrl(userId, channelId);

    return this.httpClient
      .get<MessageModel[]>(url)
      .pipe(this.retryIfUnauthorizedWithRefreshToken());
  }

  sendMessage(message: SendMessageModel) {
    this.socket.emit('message', message);
  }

  getUser() {
    const url = this.apiUrl + `/user`;

    return this.httpClient
      .get<UserDataModel>(url, {
        observe: 'response',
      })
      .pipe(this.retryIfUnauthorizedWithRefreshToken());
  }

  getUsers() {
    const url = this.apiUrl + '/users';

    return this.httpClient
      .get<UserDataModel[]>(url, {
        observe: 'response',
      })
      .pipe(this.retryIfUnauthorizedWithRefreshToken());
  }

  getUserChannels(userId: string) {
    const url = this.getUserChannelsUrl(userId);

    return this.httpClient
      .get<ChannelModel[]>(url, {
        observe: 'response',
      })
      .pipe(this.retryIfUnauthorizedWithRefreshToken());
  }

  addUserChannel(userId: string, channelName: string) {
    const url = this.getUserChannelsUrl(userId);

    return this.httpClient
      .post(
        url,
        { channelName },
        {
          observe: 'response',
        },
      )
      .pipe(this.retryIfUnauthorizedWithRefreshToken());
  }

  getChannelMembers(userId: string, channelId: string) {
    const url = this.getUserChannelMembersApiUrl(userId, channelId);

    return this.httpClient
      .get<UserDataModel[]>(url, {
        observe: 'response',
      })
      .pipe(this.retryIfUnauthorizedWithRefreshToken());
  }

  addChannelMember(userId: string, channelId: string) {
    const url = this.getUserChannelMembersApiUrl(userId, channelId);

    return this.httpClient
      .post(url, {
        observe: 'response',
      })
      .pipe(this.retryIfUnauthorizedWithRefreshToken());
  }

  private retryIfUnauthorizedWithRefreshToken<T>(): MonoTypeOperatorFunction<T> {
    return pipe(
      retry({
        count: 1,
        delay: () =>
          this.authorizationService.loginWithRefreshToken().pipe(
            takeWhile((response) => response.status === 200),
            tap({
              complete: () => {
                sessionStorage.removeItem('access_token');

                this.router.navigate(['../', 'login'], { relativeTo: this.activatedRoute });
              },
            }),
          ),
      }),
    );
  }

  private getUserApiUrl(userId: string) {
    return this.apiUrl + `/user/${userId}`;
  }

  private getUserChannelMessagesUrl(userId: string, channelId: string) {
    return this.getUserApiUrl(userId) + `/channels/${channelId}/messages`;
  }

  private getUserChannelsUrl(userId: string) {
    return this.getUserApiUrl(userId) + `/channels`;
  }

  private getUserChannelMembersApiUrl(userId: string, channelId: string) {
    return this.getUserApiUrl(userId) + `/channel/${channelId}/members`;
  }
}
