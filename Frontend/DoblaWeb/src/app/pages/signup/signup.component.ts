import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  // Datos del formulario
  userData = {
    name: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  constructor(private userService: UserService) {}

  onSubmit() {
    // Validación básica
    if (this.userData.password !== this.userData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    // Llama al servicio de registro
    this.userService.signup(this.userData).subscribe({
      next: (response) => {
        console.log('Registro exitoso', response);
        // Redirige al usuario o muestra mensaje de éxito
      },
      error: (error) => {
        console.error('Error en registro', error);
        // Muestra mensaje de error al usuario
      }
    });
  }}