import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, timeout, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

interface Product {
  _id: string;
  name: string;
  description: string;
  images: any[]; // Cambiado para manejar tanto strings como objetos
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/product`;
  private readonly defaultHeaders: HttpHeaders;

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.defaultHeaders = new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  }

  // product.service.ts - MEJORAR handleError

private handleError(error: HttpErrorResponse): Observable<never> {
  console.error('Error completo en ProductService:', error);
  
  // Extraer mensaje del servidor si está disponible
  const serverMessage = error.error?.message || error.error?.error;
  
  let userMessage = 'Error desconocido';
  
  if (error.status === 0) {
    userMessage = 'Error de conexión con el servidor';
  } else if (error.status === 400) {
    userMessage = serverMessage || 'Datos inválidos enviados al servidor';
  } else if (error.status === 401) {
    userMessage = 'Sesión expirada. Por favor inicia sesión nuevamente';
    this.authService.logout();
  } else if (error.status === 403) {
    userMessage = serverMessage || 'No tienes permisos para realizar esta acción';
  } else if (error.status === 404) {
    userMessage = 'Recurso no encontrado';
  } else if (error.status >= 500) {
    userMessage = serverMessage || 'Error interno del servidor. Por favor intenta más tarde';
  }
  
  return throwError(() => new Error(userMessage));
}

  // Método optimizado para headers
  private getAuthHeaders(forFormData: boolean = false): HttpHeaders {
    let headers = new HttpHeaders();

    const token = this.authService.getToken();
    const user = this.authService.getCurrentUser();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    if (user?.id) {
      headers = headers.set('X-User-Id', user.id.toString());
    }

    if (user?.role) {
      headers = headers.set('X-User-Role', user.role);
    }

    // Para FormData, no establecer Content-Type
    if (!forFormData) {
      headers = headers.set('Content-Type', 'application/json');
    }

    return headers;
  }

  // Método principal para obtener productos
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      map((response: any) => {
        // Transformación para manejar diferentes formatos de respuesta
        const products = response.data || response;
        if (!Array.isArray(products)) return [];
        
        return products.map((product: any) => ({
          _id: product._id || product.id,
          name: product.name,
          description: product.description,
          images: this.transformImages(product.images),
          isActive: product.isActive,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }));
      }),
      catchError(this.handleError)
    );
  }

  // Método para productos activos
  getActiveProducts(): Observable<Product[]> {
    return this.getProducts().pipe(
      map(products => products.filter(product => product.isActive))
    );
  }

  // Método mejorado para obtener URLs de imágenes
  getProductImageUrl(imageInfo: any): string {
    if (!imageInfo) return 'assets/default-product.png';

    // Caso 1: URL completa directa
    if (typeof imageInfo === 'string' && imageInfo.startsWith('http')) {
      return imageInfo;
    }

    // Caso 2: Objeto con filename (formato preferido)
    if (imageInfo.filename) {
      return `${environment.apiUrl}/product/image/${encodeURIComponent(imageInfo.filename)}`;
    }

    // Caso 3: Objeto con url
    if (imageInfo.url) {
      if (imageInfo.url.startsWith('http')) return imageInfo.url;
      return `${environment.apiUrl}${imageInfo.url.startsWith('/') ? '' : '/'}${imageInfo.url}`;
    }

    // Default
    return 'assets/default-product.png';
  }

  // Método transformImages actualizado
  private transformImages(images: any): any[] {
    if (!images) return [];
    
    return (Array.isArray(images) ? images : [images]).map(img => {
      // Si ya es un objeto formateado
      if (typeof img === 'object' && (img.url || img.filename)) {
        return img;
      }
      
      // Si es string (formato antiguo)
      if (typeof img === 'string') {
        return {
          filename: img.split('/').pop(),
          url: img.startsWith('http') ? img : `${environment.apiUrl}/${img.replace(/^\/+/, '')}`
        };
      }
      
      // Formato no reconocido
      return { url: 'assets/default-product.png' };
    });
  }

  // Crear producto con validación mejorada
  createProduct(formData: FormData): Observable<Product> {
    this.validateAdminAccess();
    this.validateFormData(formData);

    // Configurar headers específicos para FormData
    const headers = this.getAuthHeaders(true);

    // Debug: mostrar información sobre los archivos
    console.log('Enviando FormData con:', {
      fileCount: formData.getAll('images').length,
      name: formData.get('name'),
      description: formData.get('description')
    });

    return this.http.post<Product>(this.apiUrl, formData, {
      headers: headers
    }).pipe(
      map(response => this.transformProduct(response)),
      tap(() => this.auditOperation('create')),
      catchError(error => {
        console.error('Error detallado en createProduct:', {
          status: error.status,
          message: error.message,
          serverError: error.error
        });
        return this.handleAdminError(error);
      })
    );
  }

  // Actualizar producto con validación de ID
  updateProduct(id: string, formData: FormData | Partial<Product>): Observable<Product> {
    this.validateAdminAccess();
    this.validateProductId(id);

    const url = this.buildProductUrl(id);

    return this.http.patch<Product>(url, formData, {
      headers: this.getAuthHeaders(formData instanceof FormData)
    }).pipe(
      map(response => this.transformProduct(response)),
      tap(() => this.auditOperation('update')),
      catchError(error => this.handleAdminError(error))
    );
  }

  // Eliminar producto con validación
  deleteProduct(id: string): Observable<void> {
    this.validateAdminAccess();
    this.validateProductId(id);

    const url = this.buildProductUrl(id);

    return this.http.delete<void>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => this.auditOperation('delete')),
      catchError(error => this.handleAdminError(error))
    );
  }

  // Métodos auxiliares privados
  private validateAndTransformResponse(response: any): Product[] {
    if (!response) {
      throw new Error('Respuesta vacía del servidor');
    }
    return Array.isArray(response) 
      ? response.map(p => this.transformProduct(p)) 
      : [this.transformProduct(response)];
  }

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

  private validateAdminAccess(): void {
    if (!this.authService.isAdmin()) {
      console.error('Intento de acceso sin permisos de administrador');
      throw this.createError('Acción no autorizada: Se requieren privilegios de administrador', 403);
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

  private buildProductUrl(id: string): string {
    return `${this.apiUrl}/${id}`.replace(/([^:]\/)\/+/g, '$1');
  }

  private handleReadError(error: HttpErrorResponse): Observable<Product[]> {
    console.error('Error al leer productos:', this.getErrorDetails(error));
    return of([]);
  }

  private handleAdminError(error: HttpErrorResponse): Observable<never> {
    const errorDetails = this.getErrorDetails(error);
    console.error('Error en operación admin:', errorDetails);

    if (error.status === 403) {
      this.authService.logout();
    }

    return throwError(() => this.createError(
      this.getUserFriendlyMessage(error),
      error.status
    ));
  }

  private auditOperation(operation: string): void {
    console.log(`Operación ${operation} realizada`);
    // Aquí podrías implementar un servicio de auditoría real
  }

  private getErrorDetails(error: HttpErrorResponse): any {
    return {
      name: error.name,
      status: error.status,
      message: error.message,
      url: error.url,
      serverMessage: error.error?.message,
      timestamp: new Date()
    };
  }

  private getUserFriendlyMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      return 'Error de conexión con el servidor';
    }

    const messages: Record<number, string> = {
      0: 'Error de red. Verifica tu conexión',
      400: error.error?.message || 'Datos inválidos',
      401: 'Autenticación requerida',
      403: error.error?.message || 'No tienes permisos',
      404: 'Recurso no encontrado',
      500: error.error?.message || 'Error interno del servidor'
    };

    return messages[error.status] || error.error?.message || 'Error desconocido';
  }

  private createError(message: string, status?: number): Error {
    const error = new Error(message);
    (error as any).status = status;
    return error;
  }
}