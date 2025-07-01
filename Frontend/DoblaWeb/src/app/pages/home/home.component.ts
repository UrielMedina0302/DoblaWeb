import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  mostrarModal: boolean = true;
  isLoggedIn: boolean = false; // Cambia esto según tu lógica de autenticación
  userRole: string = ''; // Cambia esto según tu lógica de roles de usuario
  loginClient(){
    this.isLoggedIn = true; // Simula un inicio de sesión exitoso
    this.userRole = 'cliente'; // Asigna el rol de cliente
  }
  loginAdmin(){
    this.isLoggedIn = true; // Simula un inicio de sesión exitoso
    this.userRole = 'admin'; // Asigna el rol de administrador
  }
  logout() {
    this.isLoggedIn = false; // Simula un cierre de sesión
    this.userRole = ''; // Limpia el rol del usuario
  }

  ngOnInit() {
    // Aquí puedes agregar lógica adicional si es necesario
  }

  cerrarModal() {
    this.mostrarModal = false;
  }
}
