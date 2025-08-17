// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Observable, tap, catchError, throwError, of } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { HttpHeaders } from '@angular/common/http';
import { timeout } from 'rxjs/operators';

interface User {
  id: number;
  name: string;
  lastname?: string;
  email: string;
  role: string; // Puede ser 'Admin', 'admin', 'User', etc.
  [key: string]: any;
}

interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private readonly tokenKey = environment.jwtKey || 'auth_token';
  private readonly userKey = `${environment.jwtKey || 'auth_token'}_user`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  

  // Métodos públicos
  getToken(): string | null {
    return localStorage.getItem(environment.jwtKey); // Asegúrate que jwtKey esté definido en environment
  }

  getCurrentUser(): User | null {
    const userData = localStorage.getItem(`${environment.jwtKey}_user`);
    if (!userData) return null;

    try {
      return JSON.parse(userData) as User;
    } catch (e) {
      console.error('Error parsing user data:', e);
      this.clearAuthData();
      return null;
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
  return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
    tap((response: any) => {
      // Verificación flexible de la respuesta
      const token = response?.token || response?.accessToken || response?.data?.token;
      const user = response?.user || response?.usuario || response?.data?.user;

      if (!token || !user) {
        console.error('Estructura de respuesta inválida:', response);
        throw new Error(`La respuesta del servidor no contiene token o user. Recibido: ${JSON.stringify(response)}`);
      }

      this.storeAuthData({ token, user });
    }),
    catchError(error => {
      this.clearAuthData();
      return throwError(() => this.handleAuthError(error));
    })
  );
}

  private storeAuthData(response: AuthResponse): void {
    localStorage.setItem(environment.jwtKey, response.token);
    localStorage.setItem(`${environment.jwtKey}_user`, JSON.stringify(response.user));
  }

  private clearAuthData(): void {
    localStorage.removeItem(environment.jwtKey);
    localStorage.removeItem(`${environment.jwtKey}_user`);
  }

 private handleAuthError(error: any): Error {
  // Extrae el verdadero error HTTP si está encapsulado
  const httpError = error.error || error;
  
  console.group('[AuthService] Error detallado');
  console.log('Error completo:', error);
  console.log('Tipo:', httpError.name);
  console.log('Status:', httpError.status || 'No disponible');
  console.log('Mensaje original:', httpError.message);
  console.log('Datos del servidor:', httpError.error);
  console.log('URL:', error.url || `${this.apiUrl}/login`);
  console.groupEnd();

  // Determina el mensaje basado en el error real
  let userFriendlyMessage: string;

  if (!httpError.status) {
    // Caso cuando no hay conexión o error desconocido
    userFriendlyMessage = httpError.message || 'Error de conexión con el servidor';
  } else {
    // Mapeo de códigos de estado
    const errorMessages: {[key: number]: string} = {
      400: httpError.error?.message || 'Datos inválidos',
      401: httpError.error?.message || 'Credenciales incorrectas',
      403: 'No tienes permisos para esta acción',
      404: 'Servicio no encontrado',
      500: 'Error interno del servidor'
    };

    userFriendlyMessage = errorMessages[httpError.status] || 
                         httpError.error?.message || 
                         'Error durante la autenticación';
  }

  return new Error(userFriendlyMessage);
  }

  isAdmin(): boolean {
  try {
    const user = this.getCurrentUser();
    const userRole = user?.role;
    // Valida 'Admin' o 'admin' (case-sensitive)
    return userRole === 'Admin' || userRole === 'admin';
  } catch (e) {
    console.warn('Error al verificar rol:', e);
      return false;
    }
}


  signup(userData: { 
    name: string; 
    lastname: string; 
    email: string; 
    password: string 
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, userData).pipe(
      catchError(error => throwError(() => this.handleAuthError(error)))
    );
  }

  logout(): Observable<void> {
  // Limpiar datos locales primero (importante para casos de error)
  this.clearAuthData();
  
  return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
    catchError(error => {
      console.error('Error en logout backend:', error);
      // Continuar el flujo aunque falle el logout del backend
      return of(undefined);
    }),
    tap(() => {
      // Redirigir solo si es necesario (dejamos que el componente maneje esto)
      console.log('Logout completado en backend');
    })
  );
}



  isLoggedIn(): boolean {
    const token = localStorage.getItem(environment.jwtKey);
    return !!token && !this.isTokenExpired(token);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp < Date.now() / 1000;
    } catch (e) {
      return true;
    }
  }
  requestPasswordReset(email: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Request-Source': 'Angular-Forgot-Password'
    });

    return this.http.post(
      `${this.apiUrl}/forgotPassword`,
      { email },
      { headers , withCredentials:false}
    ).pipe(
      catchError(error => {
        console.error('Error en requestPasswordReset:', error);
        return throwError(() => error);
      })
    );
  }

// // auth.service.ts
// resetPassword(token: string, newPassword: string): Observable<any> {
//   // Validación básica del token
//   if (!token || token.length !== 64) {
//     return throwError(() => ({
//       status: 400,
//       code: 'INVALID_TOKEN',
//       message: 'Token de recuperación inválido'
//     }));
//   }

//   const headers = new HttpHeaders({
//     'Content-Type': 'application/json',
//     'X-Request-Source': 'Angular-Reset-Password'
//   });

//   return this.http.patch(
//     `${this.apiUrl}/resetPassword/${encodeURIComponent(token)}`,
//     { 
//       password: newPassword,
//       passwordConfirm: newPassword 
//     },
//     { 
//       headers,
//       observe: 'response' // Para obtener la respuesta completa
//     }
//   ).pipe(
//     timeout(30000), // Timeout de 30 segundos
//     catchError((error: HttpErrorResponse) => {
//       console.error('Error en resetPassword:', {
//         status: error.status,
//         url: error.url,
//         error: error.error
//       });

//       let userMessage = 'Error al cambiar la contraseña';
//       let errorCode = 'UNKNOWN_ERROR';
      
//       if (error.status === 401) {
//         userMessage = error.error?.message || 'El enlace ha expirado o es inválido';
//         errorCode = 'TOKEN_EXPIRED_OR_INVALID';
//       } else if (error.status === 0) {
//         userMessage = 'Error de conexión con el servidor';
//         errorCode = 'NETWORK_ERROR';
//       }

//       return throwError(() => ({
//         status: error.status,
//         code: errorCode,
//         message: userMessage,
//         details: error.error?.details || {}
//       }));
//     })
//   );
// }
// auth.service.ts
resetPassword(token: string, newPassword: string): Observable<any> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  return this.http.patch(
    `${this.apiUrl}/resetPassword/${encodeURIComponent(token)}`,
    { 
      password: newPassword,
      passwordConfirm: newPassword 
    },
    { headers }
  ).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Error al cambiar la contraseña';
      
      if (error.status === 401) {
        errorMessage = error.error?.message || 'El enlace ha expirado o es inválido';
      }

      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        details: error.error?.details
      }));
    })
  );
}
}