import { HttpInterceptorFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = authService.getToken();

  const publicEndpoints = [
    '/auth/login',
    '/auth/signup',
    '/auth/forgotPassword',
    '/auth/resetPassword',
    '/auth/request-employee-code',
    '/auth/verify-employee-code',
    '/api/product' // GET productos públicos
  ];

  const imagePatterns = ['/uploads/products/', '/api/product/image/'];

  const isPublicEndpoint = publicEndpoints.some(ep => req.url.includes(ep));
  const isImageRequest = imagePatterns.some(p => req.url.includes(p));

  if (isPublicEndpoint || isImageRequest) {
    console.log(`[Interceptor] Solicitud pública o de imagen: ${req.url}`);
    return next(req);
  }

  if (!token) {
    console.warn('[Interceptor] No hay token disponible');
    authService.logout();
    router.navigate(['/login']);
    return throwError(() => ({ status: 401, message: 'No autenticado' }));
  }

  const contentType = req.headers.get('Content-Type');
  const headers: { [name: string]: string | string[] } = { Authorization: `Bearer ${token}` };

  if (!contentType && !(req.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const authReq = req.clone({ setHeaders: headers });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('[Interceptor] Error en la solicitud:', error);
      if (error.status === 401 || error.status === 403) {
        authService.logout();
        router.navigate(['/login'], { queryParams: { sessionExpired: true } });
      }
      return throwError(() => error);
    })
  );
};
