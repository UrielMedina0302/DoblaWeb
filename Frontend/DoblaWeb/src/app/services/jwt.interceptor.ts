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

  // 1. Excluir endpoints públicos (ajusta según tus necesidades)
  const publicEndpoints = [
    '/auth/login',
    '/auth/signup',
    '/auth/refresh-token',
    '/public/'
  ];

  if (publicEndpoints.some(endpoint => req.url.includes(endpoint))) {
    return next(req);
  }

  // 2. Manejo cuando no hay token
  if (!token) {
    authService.logout();
    return throwError(() => ({
      status: 401,
      message: 'Sesión no autenticada',
      redirectToLogin: true // Bandera personalizada
    }));
  }

  // 3. Clonar request con headers de autenticación
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
      'X-User-Data': JSON.stringify(authService.getCurrentUser() || {}),
      'Content-Type': req.headers.get('Content-Type') || 'application/json'
    }
  });

  // 4. Manejo de errores
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Caso especial cuando el token expira
      if (error.status === 401 && !req.url.includes('/auth/logout')) {
        authService.logout();
        router.navigate(['/login'], {
          queryParams: { 
            sessionExpired: true,
            returnUrl: router.url 
          }
        });
      }
      
      // Propaga el error con información adicional
      return throwError(() => ({
        ...error,
        authError: true,
        redirectToLogin: error.status === 401
      }));
    })
  );
};