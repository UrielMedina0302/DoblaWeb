import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { jwtInterceptor } from './services/jwt.interceptor'; // Cambiado a minúscula para coincidir con el nombre de clase
import {provideNoopAnimations} from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideNoopAnimations(),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(
      withFetch(), // Añadido para compatibilidad con SSR
      withInterceptors([jwtInterceptor]) // Nombre debe coincidir con la clase exportada
    ),
  ]
};