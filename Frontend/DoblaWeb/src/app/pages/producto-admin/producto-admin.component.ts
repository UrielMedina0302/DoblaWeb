import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { environment } from '../../../environments/environment';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

interface Product {
  _id: string;
  name: string;
  description: string;
  images: any[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Component({
  selector: 'app-producto-admin',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, DatePipe],
  templateUrl: './producto-admin.component.html',
  styleUrls: ['./producto-admin.component.css']
})
export class ProductoAdminComponent implements OnInit {
  showModal = false;
  showDeleteConfirmation = false;
  currentAction: 'add' | 'edit' = 'add';
  productForm: FormGroup;
  products: Product[] = [];
  selectedProductId: string | null = null;
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  errorDismissible = true;
  productToDelete: string | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.verifyAuthentication();
    this.loadProducts();
  }

  truncateDescription(description: string, limit: number = 100): string {
    if (!description) return '';
    if (description.length <= limit) return description;
    return `${description.substring(0, limit)}...`;
  }

  private verifyAuthentication(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url }
      });
    }
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.productService.getProducts().subscribe({
      next: (products: Product[]) => {
        this.products = products;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.handleServiceError(err, 'cargar productos');
        this.isLoading = false;
      }
    });
  }

getProductImage(product: Product): string {
  if (!product.images || product.images.length === 0) {
    return 'assets/default-product.png';
  }

  const firstImage = product.images[0];
  
  // Caso 1: Es un string (nombre de archivo)
  if (typeof firstImage === 'string') {
    return `${environment.apiUrl}/api/products/image/${encodeURIComponent(firstImage)}`;
  }
  
  // Caso 2: Tiene propiedad 'filename'
  if (firstImage.filename) {
    return `${environment.apiUrl}/api/products/image/${encodeURIComponent(firstImage.filename)}`;
  }
  
  // Caso 3: Tiene propiedad 'url' completa
  if (firstImage.url) {
    return firstImage.url;
  }
  
  return 'assets/default-product.png';
}

  handleImageError(event: Event): void {
  const target = event.target as HTMLImageElement;
  target.src = 'assets/img/default.jpg'; // imagen por defecto
}


  getFullImageUrl(image: any): string {
    if (!image) return 'assets/default-product.png';
    
    if (typeof image === 'string') {
      return image.startsWith('http') ? image : `${environment.apiUrl}/${image}`;
    }
    
    if (image.url) return image.url;
    
    if (image.path) {
      return image.path.startsWith('http') ? image.path : 
             `${environment.apiUrl}/${image.path.replace(/\\/g, '/')}`;
    }
    
    return 'assets/default-product.png';
  }

  openModal(action: 'add' | 'edit', productId: string | null = null): void {
    if (!this.authService.isAdmin()) {
      this.errorMessage = 'Se requieren privilegios de administrador';
      this.errorDismissible = true;
      return;
    }

    this.currentAction = action;
    this.selectedProductId = productId;
    this.showModal = true;
    this.resetModalState();

    if (action === 'edit' && productId) {
      this.prepareEditForm(productId);
    }
  }

  private resetModalState(): void {
    this.selectedFiles = [];
    this.previewUrls = [];
    this.productForm.reset();
  }

  private prepareEditForm(productId: string): void {
    const product = this.products.find(p => p._id === productId);
    if (product) {
      this.productForm.patchValue({
        name: product.name,
        description: product.description
      });
      this.previewUrls = product.images.map(img => this.getFullImageUrl(img));
    }
  }

  handleFileInput(target: EventTarget | null): void {
    const input = target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    const maxFiles = 5;
    const allowedTypes = ['image/jpeg', 'image/png'];

    const files = Array.from(input.files);
    
    if (files.length > maxFiles) {
      this.errorMessage = `Máximo ${maxFiles} imágenes permitidas`;
      this.errorDismissible = true;
      input.value = '';
      return;
    }

    const invalidFiles = files.filter(file => 
      file.size > maxSize || !allowedTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      this.errorMessage = invalidFiles.map(file => 
        file.size > maxSize ? 
        `${file.name}: Supera 5MB` : 
        `${file.name}: Tipo no permitido`
      ).join(', ');
      this.errorDismissible = true;
      input.value = '';
      return;
    }

    this.selectedFiles = files.slice(0, maxFiles);
    this.generateImagePreviews();
  }

  private generateImagePreviews(): void {
    this.previewUrls = [];
    const promises = this.selectedFiles.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target?.result) {
            resolve(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(urls => {
      this.previewUrls = urls;
    });
  }

  removeImage(index: number): void {
    this.previewUrls.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }

  showFieldError(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return field ? (field.invalid && (field.touched || field.dirty)) : false;
  }

  showImageError(): boolean {
    return this.currentAction === 'add' && this.selectedFiles.length === 0;
  }

  submitForm(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      this.errorMessage = 'Por favor complete todos los campos requeridos correctamente';
      this.errorDismissible = true;
      return;
    }

    if (this.currentAction === 'add' && this.selectedFiles.length === 0) {
      this.errorMessage = 'Debes seleccionar al menos una imagen';
      this.errorDismissible = true;
      return;
    }

    if (!this.authService.isAdmin()) {
      this.errorMessage = 'Acceso denegado: Se requieren privilegios de administrador';
      this.errorDismissible = true;
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const formData = this.prepareFormData();

    if (this.currentAction === 'add') {
      this.createProduct(formData);
    } else if (this.currentAction === 'edit' && this.selectedProductId) {
      this.updateProduct(formData);
    }
  }

  private prepareFormData(): FormData {
    const formData = new FormData();
    
    formData.append('name', this.productForm.value.name);
    formData.append('description', this.productForm.value.description);

    if (this.selectedFiles.length > 0) {
      this.selectedFiles.forEach((file) => {
        formData.append('images', file, file.name);
      });
    }

    return formData;
  }

  private createProduct(formData: FormData): void {
    this.productService.createProduct(formData).subscribe({
      next: () => {
        this.handleSuccess('Producto creado exitosamente');
      },
      error: (err: HttpErrorResponse) => {
        this.handleErrorResponse(err, 'creando producto');
      }
    });
  }

  private updateProduct(formData: FormData): void {
    if (!this.selectedProductId) return;

    this.productService.updateProduct(this.selectedProductId, formData).subscribe({
      next: () => {
        this.handleSuccess('Producto actualizado exitosamente');
      },
      error: (err: HttpErrorResponse) => {
        this.handleErrorResponse(err, 'actualizando producto');
      }
    });
  }

  toggleProductStatus(product: Product): void {
    if (!this.authService.isAdmin()) {
      this.errorMessage = 'Se requieren privilegios de administrador';
      this.errorDismissible = true;
      return;
    }

    const newStatus = !product.isActive;
    const confirmation = confirm(`¿Estás seguro de querer ${newStatus ? 'activar' : 'desactivar'} este producto?`);
    
    if (!confirmation) return;

    this.isLoading = true;
    this.productService.updateProduct(product._id, { isActive: newStatus }).subscribe({
      next: () => {
        product.isActive = newStatus;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.handleErrorResponse(err, 'cambiando estado del producto');
      }
    });
  }

  confirmDelete(productId: string): void {
    if (!this.authService.isAdmin()) {
      this.errorMessage = 'Se requieren privilegios de administrador';
      this.errorDismissible = true;
      return;
    }

    this.productToDelete = productId;
    this.showDeleteConfirmation = true;
  }

  cancelDelete(): void {
    this.productToDelete = null;
    this.showDeleteConfirmation = false;
  }

  deleteProduct(): void {
    if (!this.productToDelete) return;

    this.isLoading = true;
    this.productService.deleteProduct(this.productToDelete).subscribe({
      next: () => {
        this.showDeleteConfirmation = false;
        this.productToDelete = null;
        this.loadProducts();
      },
      error: (err: HttpErrorResponse) => {
        this.handleErrorResponse(err, 'eliminando producto');
        this.showDeleteConfirmation = false;
      }
    });
  }

  private handleSuccess(message: string): void {
    this.loadProducts();
    this.closeModal();
    this.isLoading = false;
    console.log(message);
  }

  private handleServiceError(error: HttpErrorResponse, context: string): void {
    console.error(`Error al ${context}:`, error);
    
    if (error.status === 401 || error.status === 403) {
      this.authService.logout();
      this.router.navigate(['/login'], {
        queryParams: { sessionExpired: true }
      });
      return;
    }

    const errorMessages: {[key: number]: string} = {
      0: 'Error de conexión con el servidor',
      400: 'Datos inválidos enviados al servidor',
      404: 'Recurso no encontrado',
      409: 'Conflicto: El producto ya existe',
      500: 'Error interno del servidor'
    };

    this.errorMessage = errorMessages[error.status] || 
                       error.error?.message || 
                       `Error al ${context}. Por favor intente nuevamente.`;
    this.errorDismissible = true;
    this.isLoading = false;
  }

  private handleErrorResponse(error: HttpErrorResponse, context: string): void {
    this.handleServiceError(error, context);
  }

  closeModal(): void {
    this.showModal = false;
    this.resetModalState();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}