import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-producto-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './producto-admin.component.html',
  styleUrls: ['./producto-admin.component.css']
})
export class ProductoAdminComponent {
  showModal = false;
  modalTitle = '';
  currentAction = ''; // 'add' o 'edit'
  productForm: FormGroup;
  selectedProductIndex: number | null = null;

  // Datos de ejemplo (reemplaza con tu estructura real)
  products = [
    {
      name: 'Producto 1',
      description: 'Descripción del producto 1',
      price: '1,250.00',
      image: 'img/producto-ejemplo.jpg'
    },
    {
      name: 'Producto 2',
      description: 'Descripción del producto 2',
      price: '1,750.00',
      image: 'img/producto-ejemplo2.jpg'
    }
  ];

  constructor(private fb: FormBuilder) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      image: ['']
    });
  }

  openModal(action: string, index: number | null = null): void {
    this.currentAction = action;
    this.selectedProductIndex = index;
    this.modalTitle = action === 'add' ? 'Agregar Producto' : 'Editar Producto';
    this.showModal = true;

    if (action === 'edit' && index !== null) {
      this.productForm.patchValue(this.products[index]);
    } else {
      this.productForm.reset();
    }
  }

  closeModal(): void {
    this.showModal = false;
  }

  submitForm(): void {
    if (this.productForm.valid) {
      const productData = this.productForm.value;

      if (this.currentAction === 'add') {
        this.products.push(productData);
      } else if (this.currentAction === 'edit' && this.selectedProductIndex !== null) {
        this.products[this.selectedProductIndex] = productData;
      }

      this.closeModal();
    }
  }

  deleteProduct(index: number): void {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.products.splice(index, 1);
    }
  }
}