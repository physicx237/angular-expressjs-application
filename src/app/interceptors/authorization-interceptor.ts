import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_URL } from '../app.config';

export const authorizationInterceptor: HttpInterceptorFn = (request, next) => {
  const apiUrl = inject(API_URL);

  const requestUrl = request.url.replace(apiUrl, '');
  const requestMethod = request.method;

  if (requestUrl === '/login' && requestMethod === 'POST') {
    return next(request);
  }

  const accessToken = sessionStorage.getItem('access_token');

  const requestClone = request.clone({
    headers: request.headers.set('Authorization', `Bearer ${accessToken}`),
    withCredentials: true,
  });

  return next(requestClone);
};
