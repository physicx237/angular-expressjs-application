import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { routes } from '../../app.routes';
import { API_URL } from '../../app.config';
import { AuthorizationService } from './authorization.service';

const username = 'user1';
const password = 'user1';

const accessToken = { access_token: 'access_token' };

describe('AuthorizationService', () => {
  let httpMock: HttpTestingController;
  let authorizationService: AuthorizationService;
  let apiUrl: string;
  let socketSpy: jasmine.SpyObj<Socket>;

  beforeEach(() => {
    socketSpy = jasmine.createSpyObj('Socket', ['fromEvent', 'emit', 'connect', 'disconnect']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter(routes),
        AuthorizationService,
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
    authorizationService = TestBed.inject(AuthorizationService);
    apiUrl = TestBed.inject(API_URL);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should login', (doneFn: DoneFn) => {
    authorizationService.login(username, password).subscribe((response) => {
      expect(response.body).toEqual(accessToken);

      doneFn();
    });

    const url = apiUrl + '/login';

    const request = httpMock.expectOne(url);

    expect(request.request.method).toBe('POST');

    request.flush(accessToken);
  });

  it('should login with refresh token', (doneFn: DoneFn) => {
    authorizationService.loginWithRefreshToken().subscribe((response) => {
      expect(response.body).toEqual(accessToken);

      doneFn();
    });

    const url = apiUrl + '/login';

    const request = httpMock.expectOne(url);

    expect(request.request.method).toBe('GET');

    request.flush(accessToken);
  });

  it('should logout', (doneFn: DoneFn) => {
    authorizationService.logout().subscribe((response) => {
      expect(response.status).toBe(200);

      doneFn();
    });

    const url = apiUrl + '/logout';

    const request = httpMock.expectOne(url);

    expect(request.request.method).toBe('GET');

    request.flush(null, { status: 200, statusText: '' });
  });
});
