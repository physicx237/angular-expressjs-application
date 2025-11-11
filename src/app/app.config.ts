import {
  ApplicationConfig,
  InjectionToken,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideSocketIo } from 'ngx-socket-io';
import { providePrimeNG } from 'primeng/config';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { routes } from './app.routes';
import { authorizationInterceptor } from './interceptors/authorization-interceptor';
import { UserEffects } from './store/effects/user.effects';
import { userReducer } from './store/reducers/user.reducers';
import Aura from '@primeuix/themes/Aura';

const apiUrl = 'http://localhost:3000';

export const API_URL = new InjectionToken<string>('API_URL');

export const PRIME_NG_MODULES = [
  ButtonModule,
  InputTextModule,
  FloatLabelModule,
  ToastModule,
  DialogModule,
  SelectModule,
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authorizationInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false,
        },
      },
    }),
    provideStore({ user: userReducer }),
    provideEffects([UserEffects]),
    provideSocketIo({ url: apiUrl }),
    {
      provide: API_URL,
      useValue: apiUrl,
    },
  ],
};
