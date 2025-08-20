import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface SignupData {
  name: string;
  lastname: string;
  email: string;
  password: string;
  role?: string;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  userData = {
    name: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  errorMessage: string = '';
  isLoading: boolean = false;
  passwordMismatch: boolean = false;
  showCodeModal: boolean = false;
  verificationCode: string = '';
  isEmployee: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {isEmployee?: boolean, email?: string};
    
    if (state?.isEmployee) {
      this.isEmployee = true;
      this.userData.email = state.email || '';
      this.showCodeModal = true;
    }
  }

  onSubmit() {
    if (this.userData.password !== this.userData.confirmPassword) {
      this.passwordMismatch = true;
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    if (this.isEmployee && !this.verificationCode) {
      this.errorMessage = 'Debes ingresar el código de verificación';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Crear objeto con tipo definido
    const signupData: SignupData = {
      name: this.userData.name,
      lastname: this.userData.lastname,
      email: this.userData.email,
      password: this.userData.password,
      role: this.isEmployee ? 'employee' : 'user'
    };

    this.authService.signup(signupData).subscribe({
      next: () => {
        const redirectTo = this.isEmployee ? '/inicio-admin' : '/login';
        this.router.navigate([redirectTo]);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al registrar usuario';
        this.isLoading = false;
      }
    });
  }

  verifyCode() {
    if (!this.verificationCode) {
      this.errorMessage = 'Por favor ingresa el código';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.verifyEmployeeCode(this.userData.email, this.verificationCode)
      .subscribe({
        next: (response) => {
          if (response.isValid) {
            this.showCodeModal = false;
            this.onSubmit();
          } else {
            this.errorMessage = 'Código inválido o expirado';
          }
        },
        error: (err) => {
          this.errorMessage = 'Error al verificar el código';
          console.error(err);
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }
}