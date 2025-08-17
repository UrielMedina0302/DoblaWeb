import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, finalize } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  resetForm: FormGroup;
  message = '';
  error = '';
  loading = false;
  passwordVisible = false;
  confirmPasswordVisible = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
Validators.pattern(/^(?=.*[a-záéíóúüñ])(?=.*[A-ZÁÉÍÓÚÜÑ])(?=.*\d)(?=.*[@$!%*?&])[A-Za-záéíóúüñÁÉÍÓÚÜÑ\d@$!%*?&]{8,}$/)        ]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });

    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.error = 'Token no proporcionado';
        setTimeout(() => {
          this.router.navigate(['/forgot-password'], {
            queryParams: { error: 'token-invalido' }
          });
        }, 3000);
      }
    });
  }

  ngOnInit(): void {
    this.setupPasswordValidation();
  }

  private setupPasswordValidation(): void {
    const newPasswordCtrl = this.resetForm.get('newPassword');
    const confirmPasswordCtrl = this.resetForm.get('confirmPassword');

    // Suscripción única para newPassword
    newPasswordCtrl?.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(() => {
      if (confirmPasswordCtrl?.touched && confirmPasswordCtrl.value) {
        confirmPasswordCtrl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      }
    });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('newPassword');
    const confirmPassword = formGroup.get('confirmPassword');

    if (password && confirmPassword && password.value && confirmPassword.value) {
      return password.value === confirmPassword.value ? null : { mismatch: true };
    }
    return null;
  }

  get f() {
    return this.resetForm.controls;
  }

  togglePasswordVisibility(field: string) {
    if (field === 'password') {
      this.passwordVisible = !this.passwordVisible;
    } else {
      this.confirmPasswordVisible = !this.confirmPasswordVisible;
    }
  }

// reset-password.component.ts
async onSubmit() {
  if (this.resetForm.invalid || !this.token) {
    this.resetForm.markAllAsTouched();
    return;
  }

  this.loading = true;
  this.error = '';
  this.message = '';

  try {
    const response = await lastValueFrom(
      this.authService.resetPassword(
        this.token, 
        this.resetForm.value.newPassword
      ).pipe(
        finalize(() => this.loading = false)
      )
    );
    
    this.message = '¡Contraseña actualizada correctamente!';
    setTimeout(() => this.router.navigate(['/login']), 2000);
    
  } catch (error: any) {
    console.error('Error en reset password:', error);
    
    this.loading = false;
    this.error = error.message;
    
    if (error.code === 'TOKEN_EXPIRED_OR_INVALID') {
      setTimeout(() => {
        this.router.navigate(['/forgot-password'], {
          queryParams: { error: 'token-invalido' }
        });
      }, 3000);
    }
  }
}}