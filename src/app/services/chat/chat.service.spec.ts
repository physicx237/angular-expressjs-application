import { provideHttpClient } from '@angular/common/http';
import { ChatService } from './chat.service';
import { TestBed } from '@angular/core/testing';
import { MessageModel } from '../../models/message.model';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { API_URL } from '../../app.config';
import { UserDataModel } from '../../models/user-data.model';
import { ChannelModel } from '../../models/channel.model';

const userId = '1';
const channelId = '1';

const user: UserDataModel = {
  id: '1',
  username: 'Dmitry',
  isOnline: false,
};

const messages: MessageModel[] = [
  {
    id: '1',
    fromUser: '1',
    channelId: '1',
    content: 'First',
  },
  {
    id: '2',
    fromUser: '2',
    channelId: '1',
    content: 'Second',
  },
  {
    id: '3',
    fromUser: '3',
    channelId: '1',
    content: 'Third',
  },
];

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

describe('ChatService', () => {
  let httpMock: HttpTestingController;
  let chatService: ChatService;
  let apiUrl: string;
  let socketSpy: jasmine.SpyObj<Socket>;

  beforeEach(() => {
    socketSpy = jasmine.createSpyObj('Socket', ['emit']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        ChatService,
        {
          provide: Socket,
          useValue: socketSpy,
        },
        {
          provide: API_URL,
          useValue: 'http://localhost:3000',
        },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    chatService = TestBed.inject(ChatService);
    apiUrl = TestBed.inject(API_URL);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get messages', (doneFn: DoneFn) => {
    chatService.getMessages(userId, channelId).subscribe((value) => {
      expect(value).toEqual(messages);

      doneFn();
    });

    const url = (chatService as any).getUserChannelMessagesUrl(userId, channelId);

    const request = httpMock.expectOne(url);

    expect(request.request.method).toBe('GET');

    request.flush(messages);
  });

  it('should get user', (doneFn: DoneFn) => {
    chatService.getUser().subscribe((response) => {
      expect(response.body).toEqual(user);

      doneFn();
    });

    const url = apiUrl + '/user';

    const request = httpMock.expectOne(url);

    expect(request.request.method).toBe('GET');

    request.flush(user);
  });

  it('should get users', (doneFn: DoneFn) => {
    chatService.getUsers().subscribe((response) => {
      expect(response.body).toEqual(users);

      doneFn();
    });

    const url = apiUrl + '/users';

    const request = httpMock.expectOne(url);

    expect(request.request.method).toBe('GET');

    request.flush(users);
  });

  it('should get user channels', (doneFn: DoneFn) => {
    chatService.getUserChannels(userId).subscribe((response) => {
      expect(response.body).toEqual(channels);

      doneFn();
    });

    const url = (chatService as any).getUserChannels(userId);

    const request = httpMock.expectOne(url);

    expect(request.request.method).toBe('GET');

    request.flush(channels);
  });

  it('should get channel members', (doneFn: DoneFn) => {
    chatService.getChannelMembers(userId, channelId).subscribe((response) => {
      expect(response.body).toEqual(users);

      doneFn();
    });

    const url = (chatService as any).getUserChannels(userId);

    const request = httpMock.expectOne(url);

    expect(request.request.method).toBe('GET');

    request.flush(users);
  });
});
