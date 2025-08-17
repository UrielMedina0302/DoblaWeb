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

  // Endpoints públicos
  const publicEndpoints = [
    '/auth/login',
    '/auth/signup',
    '/auth/forgotPassword',
    '/auth/resetPassword'
  ];

  // Verificar si es endpoint público
  const isPublicEndpoint = publicEndpoints.some(endpoint => 
    req.url.includes(endpoint)
  );

  if (isPublicEndpoint) {
    return next(req);
  }

  if (!token) {
    authService.logout();
    router.navigate(['/login']);
    return throwError(() => ({ 
      status: 401,
      message: 'No autenticado' 
    }));
  }

  // Solo agregar Authorization para rutas protegidas
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};