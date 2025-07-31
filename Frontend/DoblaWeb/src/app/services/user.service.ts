import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/user'; // URL base de tu backend

  constructor(private http: HttpClient) {}

  // Autenticación
  signup(userData: {
    name: string;
    lastname: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData);
  }

  login(credentials: { 
    email: string; 
    password: string 
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials); // Ajusté la ruta para que coincida con tu backend
  }

  // Operaciones CRUD
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getAll`);
  }

  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/getOne/${userId}`);
  }

  updateUser(userId: string, userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/updateOne/${userId}`, userData); // Manteniendo POST como en tu backend
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/deleteOne/${userId}`, {}); // Manteniendo POST como en tu backend
  }

  // Métodos adicionales útiles
  setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  logout(): void {
    localStorage.removeItem('auth_token');
  }
}