import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, HttpClientModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  forgotForm: FormGroup;
  message: string = '';
  error: string = '';
  loading: boolean = false;

  constructor() {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get emailControl() {
    return this.forgotForm.get('email');
  }

onSubmit() {
  if (this.forgotForm.invalid) {
    this.forgotForm.markAllAsTouched();
    return;
  }

  this.loading = true;
  this.error = '';

  this.authService.requestPasswordReset(this.forgotForm.value.email).subscribe({
    next: (response) => {
      this.loading = false;
      this.message = 'Se ha enviado un correo con instrucciones';
    },
    error: (err) => {
      this.loading = false;
      
      // Manejo específico para error 401
      if (err.status === 401) {
        this.error = 'Error de configuración: El backend requiere autenticación para esta ruta';
        console.error('Backend mal configurado. La ruta forgotPassword no debería requerir autenticación');
      } else {
        this.error = err.error?.message || 'Error al procesar tu solicitud';
      }
    }
  });
  }

  private markAllAsTouched() {
    Object.values(this.forgotForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}