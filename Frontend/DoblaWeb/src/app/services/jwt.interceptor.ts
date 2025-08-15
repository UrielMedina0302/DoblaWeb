// src/app/interceptors/jwt.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = authService.getToken();

  // 1. Lista actualizada de endpoints públicos
  const publicEndpoints = [
    '/auth/login',
    '/auth/signup',
    '/auth/forgotPassword', // <-- Añade esta línea
    '/auth/reset-password', // <-- Y esta si aplica
    '/auth/refresh-token',
    '/public/'
  ];

  // Verifica si la URL coincide con algún endpoint público
  const isPublicEndpoint = publicEndpoints.some(endpoint => 
    req.url.includes(endpoint) || 
    req.url.endsWith(endpoint.replace(/\/$/, ''))
  );

  // 2. Excluir completamente endpoints públicos
  if (isPublicEndpoint) {
    return next(req); // No modifica la request para endpoints públicos
  }

  // 3. Manejo cuando no hay token (solo para rutas protegidas)
  if (!token) {
    authService.logout();
    return throwError(() => ({
      status: 401,
      message: 'Sesión no autenticada',
      redirectToLogin: true
    }));
  }

  // 4. Clonar request con headers de autenticación (solo para rutas protegidas)
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
      'X-User-Data': JSON.stringify(authService.getCurrentUser() || {}),
      'Content-Type': req.headers.get('Content-Type') || 'application/json'
    }
  });

  // 5. Manejo de errores
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/logout')) {
        authService.logout();
        router.navigate(['/login'], {
          queryParams: { 
            sessionExpired: true,
            returnUrl: router.url 
          }
        });
      }
      
      return throwError(() => ({
        ...error,
        authError: true,
        redirectToLogin: error.status === 401
      }));
    })
  );
};