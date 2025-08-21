import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Product {
  _id: string;
  id?: string;
  name: string;
  description: string;
  images: any[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/product`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  // ----------- PRODUCTOS PÚBLICOS ------------
  // product.service.ts - CORRECCIÓN DEL MÉTODO getProducts()
getProducts(): Observable<Product[]> {
  return this.http.get<any>(this.apiUrl).pipe(
    map((response: any) => {
      // El backend devuelve { success: true, data: [...] }
      const products = response.data || response;
      
      // Asegurarse de que es un array
      if (!Array.isArray(products)) {
        console.warn('La respuesta del servidor no es un array:', response);
        return [];
      }
      
      return products.map(p => this.transformProduct(p));
    }),
    catchError(error => this.handleReadError(error))
  );
}

  getActiveProducts(): Observable<Product[]> {
    return this.getProducts().pipe(
      map(products => products.filter(product => product.isActive))
    );
  }

  // ----------- ADMIN: CREAR / EDITAR / ELIMINAR ------------
  createProduct(formData: FormData): Observable<Product> {
    this.validateAdminAccess();
    this.validateFormData(formData);

    return this.http.post<Product>(this.apiUrl, formData, { headers: this.getAuthHeaders(true) }).pipe(
      map(res => this.transformProduct(res)),
      tap(() => this.auditOperation('create')),
      catchError(error => this.handleAdminError(error))
    );
  }

  updateProduct(id: string, formData: FormData | Partial<Product>): Observable<Product> {
    this.validateAdminAccess();
    this.validateProductId(id);
    const url = `${this.apiUrl}/${id}`.replace(/([^:]\/)\/+/g, '$1');

    return this.http.patch<Product>(url, formData, { headers: this.getAuthHeaders(formData instanceof FormData) }).pipe(
      map(res => this.transformProduct(res)),
      tap(() => this.auditOperation('update')),
      catchError(error => this.handleAdminError(error))
    );
  }

  deleteProduct(id: string): Observable<void> {
    this.validateAdminAccess();
    this.validateProductId(id);
    const url = `${this.apiUrl}/${id}`.replace(/([^:]\/)\/+/g, '$1');

    return this.http.delete<void>(url, { headers: this.getAuthHeaders() }).pipe(
      tap(() => this.auditOperation('delete')),
      catchError(error => this.handleAdminError(error))
    );
  }

  // product.service.ts - AGREGA ESTE MÉTODO PÚBLICO
getProductImageUrl(imageInfo: any): string {
  if (!imageInfo) return 'assets/images/placeholder-product.jpg';
  
  // Si es un string
  if (typeof imageInfo === 'string') {
    return this.getFullImageUrl(imageInfo);
  }
  
  // Si es un objeto con url
  if (imageInfo.url) {
    return this.getFullImageUrl(imageInfo.url);
  }
  
  // Si es un objeto con filename
  if (imageInfo.filename) {
    return this.getFullImageUrl(`/api/product/image/${imageInfo.filename}`);
  }
  
  return 'assets/images/placeholder-product.jpg';
}
  // ----------- TRANSFORM / UTILS ------------
  private transformProduct(product: any): Product {
    return {
      ...product,
      id: product.id || product._id || '',
      name: product.name || '',
      description: product.description || '',
      isActive: Boolean(product.isActive),
      createdAt: product.createdAt ? new Date(product.createdAt) : undefined,
      updatedAt: product.updatedAt ? new Date(product.updatedAt) : undefined,
      images: this.transformImages(product.images)
    };
  }

  // product.service.ts - MEJORA transformImages()
private transformImages(images: any): any[] {
  if (!images) return [];
  
  const imageArray = Array.isArray(images) ? images : [images];
  
  return imageArray.map(img => {
    // Si ya es un objeto con URL válida
    if (typeof img === 'object' && img.url) {
      return {
        filename: img.filename || img.url.split('/').pop(),
        url: this.getFullImageUrl(img.url),
        originalname: img.originalname,
        size: img.size,
        mimetype: img.mimetype
      };
    }
    
    // Si es un objeto con filename
    if (typeof img === 'object' && img.filename) {
      return {
        filename: img.filename,
        url: this.getFullImageUrl(`/api/product/image/${img.filename}`),
        originalname: img.originalname,
        size: img.size,
        mimetype: img.mimetype
      };
    }
    
    // Si es un string (filename o URL)
    if (typeof img === 'string') {
      return {
        filename: img.split('/').pop(),
        url: this.getFullImageUrl(img),
        originalname: img
      };
    }
    
    // Default
    return {
      filename: 'default.jpg',
      url: 'assets/images/placeholder-product.jpg',
      originalname: 'Imagen no disponible'
    };
  });
}

// Método auxiliar para construir URLs completas de imágenes
private getFullImageUrl(urlOrPath: string): string {
  if (!urlOrPath) return 'assets/images/placeholder-product.jpg';
  
  // Si ya es una URL completa
  if (urlOrPath.startsWith('http')) {
    return urlOrPath;
  }
  
  // Si es una ruta relativa que comienza con /
  if (urlOrPath.startsWith('/')) {
    return `${environment.apiUrl}${urlOrPath}`;
  }
  
  // Si es solo un filename
  return `${environment.apiUrl}/product/image/${urlOrPath}`;
}

  private getAuthHeaders(forFormData: boolean = false): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.authService.getToken();
    const user = this.authService.getCurrentUser();

    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    if (user?.id) headers = headers.set('X-User-Id', user.id.toString());
    if (user?.role) headers = headers.set('X-User-Role', user.role);
    if (!forFormData) headers = headers.set('Content-Type', 'application/json');

    return headers;
  }

  private validateAdminAccess(): void {
    if (!this.authService.isAdmin()) {
      throw this.createError('Acción no autorizada: se requieren privilegios de administrador', 403);
    }
  }

  private validateProductId(id: string): void {
    if (!id || typeof id !== 'string' || id.length < 1) {
      throw this.createError('ID de producto inválido', 400);
    }
  }

  private validateFormData(formData: FormData): void {
    if (!formData || !(formData instanceof FormData)) {
      throw this.createError('Datos del producto inválidos', 400);
    }
  }

  private auditOperation(operation: string): void {
    console.log(`Operación ${operation} realizada`);
  }

  private handleReadError(error: HttpErrorResponse): Observable<Product[]> {
    console.error('Error al leer productos:', error);
    return of([]); // productos públicos devuelven lista vacía en error
  }

  private handleAdminError(error: HttpErrorResponse): Observable<never> {
    console.error('Error en operación admin:', error);
    if (error.status === 401 || error.status === 403) {
      this.authService.logout();
    }
    return throwError(() => this.createError(error.message, error.status));
  }

  private createError(message: string, status?: number): Error {
    const err = new Error(message);
    (err as any).status = status;
    return err;
  }
}