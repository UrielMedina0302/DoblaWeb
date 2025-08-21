import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-sign-up-layout',
  standalone: true,
  imports: [FormsModule, CommonModule,RouterModule],
  templateUrl: './sign-up-layout.component.html',
  styleUrls: ['./sign-up-layout.component.css']
})
export class SignUpLayoutComponent {
  showEmployeeModal = false;
  employeeEmail = '';
  isLoading = false;
  errorMessage = '';
  
  // Inyección moderna de dependencias
  private authService = inject(AuthService);
  private router = inject(Router);

  openEmployeeModal() {
    this.showEmployeeModal = true;
  }

  closeModal() {
    this.showEmployeeModal = false;
  }

  async sendVerificationRequest() {
    if (!this.employeeEmail) {
      this.errorMessage = 'Por favor ingresa un email válido';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // Verificación adicional de que el servicio está disponible
      if (!this.authService?.requestEmployeeCode) {
        throw new Error('El servicio de autenticación no está configurado correctamente');
      }

      const response = await firstValueFrom(
        this.authService.requestEmployeeCode(this.employeeEmail)
      );
      
      console.log('Respuesta del backend:', response);
      
      if (response.success) {
        this.closeModal();
        this.router.navigate(['/signup'], {
          state: { 
            isEmployee: true,
            email: this.employeeEmail 
          }
        });
      } else {
        this.errorMessage = response?.message || 'Error al procesar la solicitud';
      }
    } catch (error: unknown) {
      if (error instanceof HttpErrorResponse) {
        this.errorMessage = error.error?.message || 'Error de conexión con el servidor';
      } else if (error instanceof Error) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = 'Error desconocido al procesar la solicitud';
      }
      console.error('Error en sendVerificationRequest:', error);
    } finally {
      this.isLoading = false;
    }
  }
}