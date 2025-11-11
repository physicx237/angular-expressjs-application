import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
import { Socket } from 'ngx-socket-io';
import { API_URL } from '../../app.config';
import { AccessTokenModel } from './models/access-token.model';

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  private readonly httpClient = inject(HttpClient);
  private readonly socket = inject(Socket);
  private readonly apiUrl = inject(API_URL);

  private readonly loginUrl = this.apiUrl + '/login';
  private readonly logoutUrl = this.apiUrl + '/logout';

  login(username: string, password: string) {
    return this.httpClient
      .post<AccessTokenModel>(
        this.loginUrl,
        { username, password },
        { observe: 'response', withCredentials: true },
      )
      .pipe(
        tap((response) => {
          switch (response.status) {
            case 200:
              sessionStorage.setItem('access_token', response.body!.access_token);

              this.socket.connect();
              break;
            case 401:
              sessionStorage.removeItem('access_token');
              break;
            default:
              break;
          }
        }),
        catchError((error) => of(error)),
      );
  }

  loginWithRefreshToken() {
    return this.httpClient
      .get<AccessTokenModel>(this.loginUrl, { observe: 'response', withCredentials: true })
      .pipe(
        tap((response) => {
          if (response.status === 200) {
            sessionStorage.setItem('access_token', response.body!.access_token);
          }
        }),
        catchError((error) => of(error)),
      );
  }

  logout() {
    return this.httpClient.get(this.logoutUrl, { observe: 'response', withCredentials: true }).pipe(
      tap(() => {
        sessionStorage.removeItem('access_token');

        this.socket.disconnect();
      }),
      catchError((error) => of(error)),
    );
  }
}
