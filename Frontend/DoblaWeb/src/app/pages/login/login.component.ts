import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credenciales = { 
    email: '', 
    password: '' 
  };
  
  mensajeError: string | null = null;
  cargando: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  enviarFormulario() {
    this.mensajeError = null;
    this.cargando = true;

    this.authService.login(this.credenciales.email, this.credenciales.password)
      .pipe(
        finalize(() => this.cargando = false)
      )
      .subscribe({
        next: (response) => {
          // Verificación robusta del usuario
          const user = this.authService.getCurrentUser();
          
          if (!user || !this.authService.getToken()) {
            this.mostrarError('No se pudo iniciar sesión. Datos de usuario incompletos');
            this.authService.logout();
            return;
          }

          // Redirección basada en roles
          this.redirigirSegunRol();
        },
        error: (error) => {
          this.manejarErrorAutenticacion(error);
        }
      });
  }

  private redirigirSegunRol(): void {
    if (this.authService.isAdmin()) {
      this.router.navigate(['/inicio-admin']);
    } else {
      this.router.navigate(['/inicio']);
    }
  }

  private manejarErrorAutenticacion(error: any): void {
    console.group('Error de autenticación');
    console.error('Detalles completos:', error);
    console.groupEnd();

    if (error instanceof Error) {
      this.mostrarError(error.message);
    } else if (error.error?.message) {
      this.mostrarError(error.error.message);
    } else if (!error.status) {
      this.mostrarError('No se pudo conectar con el servidor. Verifica tu conexión.');
    } else {
      this.mostrarError('Error desconocido durante el inicio de sesión');
    }
  }

  private mostrarError(mensaje: string): void {
    this.mensajeError = mensaje;
    // Opcional: scroll al mensaje de error
    setTimeout(() => {
      const errorElement = document.querySelector('.error-message');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }
}