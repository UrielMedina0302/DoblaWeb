import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

interface Product {
  _id: string;
  name: string;
  description: string;
  images: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Component({
  selector: 'app-producto-admin',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './producto-admin.component.html',
  styleUrls: ['./producto-admin.component.css']
})
export class ProductoAdminComponent implements OnInit {
  showModal = false;
  modalTitle = '';
  currentAction: 'add' | 'edit' = 'add';
  productForm: FormGroup;
  products: Product[] = [];
  selectedProductId: string | null = null;
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      images: [[]]
    });
  }

  ngOnInit(): void {
    this.verifyAuthentication();
    this.loadProducts();
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
      next: (response: any) => {
        try {
          if (!Array.isArray(response)) {
            throw new Error('Formato de respuesta inválido del servidor');
          }

          this.products = response.map((item: any) => ({
            _id: item._id || '',
            name: item.name || '',
            description: item.description || '',
            images: Array.isArray(item.images) ? item.images : [],
            isActive: Boolean(item.isActive),
            createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
            updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined
          }));
        } catch (error) {
          console.error('Error procesando productos:', error);
          this.errorMessage = 'Error al procesar los datos del servidor';
        } finally {
          this.isLoading = false;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.handleErrorResponse(err, 'cargando productos');
      }
    });
  }

  openModal(action: 'add' | 'edit', productId: string | null = null): void {
    if (!this.authService.isAdmin()) {
      this.errorMessage = 'Se requieren privilegios de administrador';
      return;
    }

    this.currentAction = action;
    this.selectedProductId = productId;
    this.modalTitle = action === 'add' ? 'Agregar Producto' : 'Editar Producto';
    this.showModal = true;
    this.resetModalState();

    if (action === 'edit' && productId) {
      this.prepareEditForm(productId);
    }
  }

  private resetModalState(): void {
    this.selectedFiles = [];
    this.previewUrls = [];
    this.errorMessage = null;
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

  onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  
  if (!input.files || input.files.length === 0) {
    return;
  }

  // Configuración de límites
  const maxSize = 50 * 1024 * 1024; // 50MB
  const maxFiles = 5; // Límite de archivos
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']; // Tipos permitidos

  // Convertir FileList a array
  const files = Array.from(input.files);

  // Validar cantidad de archivos
  if (files.length > maxFiles) {
    this.errorMessage = `Máximo ${maxFiles} archivos permitidos`;
    input.value = ''; // Limpiar selección
    return;
  }

  // Validar tamaño y tipo
  const invalidFiles = files.filter(file => {
    return file.size > maxSize || !allowedTypes.includes(file.type);
  });

  if (invalidFiles.length > 0) {
    this.errorMessage = invalidFiles
      .map(file => {
        if (file.size > maxSize) {
          return `${file.name}: Supera el límite de 50MB`;
        } else {
          return `${file.name}: Tipo de archivo no permitido`;
        }
      })
      .join(', ');
    
    input.value = ''; // Limpiar selección
    return;
  }

  // Si todo está bien, procesar archivos
  this.selectedFiles = files.slice(0, maxFiles);
  this.generateImagePreviews();
  
  // Opcional: Mostrar mensaje de éxito
  this.errorMessage = null;
  console.log('Archivos seleccionados válidos:', this.selectedFiles);
}

  private generateImagePreviews(): void {
    this.previewUrls = [];
    this.selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.previewUrls.push(e.target.result as string);
          this.productForm.get('images')?.setValue(this.previewUrls);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number): void {
    this.previewUrls.splice(index, 1);
    this.selectedFiles.splice(index, 1);
    this.productForm.get('images')?.setValue(this.previewUrls.length > 0 ? this.previewUrls : []);
  }

  submitForm(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      this.errorMessage = 'Por favor complete todos los campos requeridos';
      return;
    }

    if (!this.authService.isAdmin()) {
      this.errorMessage = 'Acceso denegado: Se requieren privilegios de administrador';
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
  
  // Agregar campos básicos
  formData.append('name', this.productForm.value.name);
  formData.append('description', this.productForm.value.description);
  formData.append('isActive', 'true');

  // Agregar imágenes si existen
  if (this.selectedFiles.length > 0) {
    this.selectedFiles.forEach((file, index) => {
      formData.append(`images`, file, file.name);
    });
  }

  return formData;
}

  private createProduct(formData: FormData): void {
  this.isLoading = true;
  this.errorMessage = null;

  this.productService.createProduct(formData).subscribe({
    next: (response) => {
      console.log('Producto creado:', response);
      this.handleSuccess('Producto creado exitosamente');
    },
    error: (err: HttpErrorResponse) => {
      console.error('Error completo:', err);
      this.handleErrorResponse(err, 'creando producto');
    }
  });
}

  private updateProduct(formData: FormData): void {
    if (!this.selectedProductId) return;

    this.productService.updateProduct(this.selectedProductId, formData).subscribe({
      next: () => this.handleSuccess('Producto actualizado exitosamente'),
      error: (err: HttpErrorResponse) => this.handleErrorResponse(err, 'actualizando producto')
    });
  }

  toggleProductStatus(product: Product): void {
    if (!this.authService.isAdmin()) {
      this.errorMessage = 'Se requieren privilegios de administrador';
      return;
    }

    const newStatus = !product.isActive;
    this.productService.updateProduct(product._id, { isActive: newStatus }).subscribe({
      next: () => product.isActive = newStatus,
      error: (err: HttpErrorResponse) => this.handleErrorResponse(err, 'cambiando estado')
    });
  }

  deleteProduct(productId: string): void {
    if (!this.authService.isAdmin()) {
      this.errorMessage = 'Se requieren privilegios de administrador';
      return;
    }

    if (confirm('¿Estás seguro de eliminar este producto permanentemente?')) {
      this.isLoading = true;
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          this.loadProducts();
          this.isLoading = false;
        },
        error: (err: HttpErrorResponse) => this.handleErrorResponse(err, 'eliminando producto')
      });
    }
  }

  private handleSuccess(message: string): void {
    this.loadProducts();
    this.closeModal();
    // Aquí podrías agregar un toast notification
    console.log(message);
  }

  private handleErrorResponse(error: HttpErrorResponse, context: string): void {
    console.error(`Error ${context}:`, error);
    this.errorMessage = this.getErrorMessage(error);
    this.isLoading = false;

    if (error.status === 401 || error.status === 403) {
      this.authService.logout();
      this.router.navigate(['/login'], {
        queryParams: { sessionExpired: true }
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.resetModalState();
  }

  getFullImageUrl(imagePath: string): string {
    if (!imagePath) return 'assets/default-product.png';
    if (imagePath.startsWith('http')) return imagePath;
    return `${environment.apiUrl}/${imagePath.replace(/\\/g, '/')}`;
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Error de conexión con el servidor';
    }
    return error.error?.message || error.message || 'Ocurrió un error inesperado';
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