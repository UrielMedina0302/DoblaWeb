import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/api'; // URL base de tu backend

  constructor(private http: HttpClient) {}

  // Ejemplo: Obtener todos los productos
  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/product`);
  }

  // Ejemplo: Crear un producto
  createProduct(productData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/product`, productData);
  }
}