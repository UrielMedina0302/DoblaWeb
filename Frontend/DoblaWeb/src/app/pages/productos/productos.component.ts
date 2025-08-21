// productos.component.ts - VERSIÓN SIMPLIFICADA
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-productos',
  imports: [CommonModule, RouterModule],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent implements OnInit {
  products: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getActiveProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
        console.log('Productos cargados:', this.products);
      },
      error: (err) => {
        this.error = 'Error al cargar los productos';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  // Método para obtener la URL de la imagen
  getImageUrl(product: any): string {
    if (!product.images || product.images.length === 0) {
      return 'assets/images/placeholder-product.jpg';
    }
    
    // Usar el servicio para obtener la URL correcta
    return this.productService.getProductImageUrl(product.images[0]);
  }

  // Manejar errores de carga de imágenes
  handleImageError(event: Event, product: any): void {
    const imgElement = event.target as HTMLImageElement;
    console.warn('Error cargando imagen para producto:', product.name);
    imgElement.src = 'assets/images/placeholder-product.jpg';
    imgElement.onerror = null;
  }
}