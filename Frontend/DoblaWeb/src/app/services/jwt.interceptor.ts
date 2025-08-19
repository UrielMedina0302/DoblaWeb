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
    '/auth/resetPassword',
    '/auth/request-employee-code',
    '/auth/verify-employee-code'
  ];

  // URLs de imágenes que no requieren token
  const imagePatterns = [
  '/uploads/products/',
  '/api/images/'
];

  // Verificar si es endpoint público
  const isPublicEndpoint = publicEndpoints.some(endpoint => req.url.includes(endpoint));

  // Verificar si es solicitud de imagen
  const isImageRequest = imagePatterns.some(pattern => req.url.includes(pattern));

  if (isPublicEndpoint || isImageRequest) {
    console.log(`[Interceptor] Solicitud pública o de imagen: ${req.url}`);
    return next(req);
  }

  if (!token) {
    console.warn('[Interceptor] No hay token disponible');
    authService.logout();
    router.navigate(['/login']);
    return throwError(() => ({ 
      status: 401,
      message: 'No autenticado' 
    }));
  }

  // Clonar la solicitud y agregar el token
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
      'Content-Type': req.headers.get('Content-Type') || 'application/json'
    }
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('[Interceptor] Error en la solicitud:', error);
      
      if (error.status === 401 || error.status === 403) {
        authService.logout();
        router.navigate(['/login'], {
          queryParams: { sessionExpired: true }
        });
      }
      
      return throwError(() => error);
    })
  );
};