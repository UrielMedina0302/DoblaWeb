import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-inicio',
  imports: [],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {
 showModal = true;//Muestra el modal de bienvenida al entrar a la pagina
  constructor() { }

  ngOnInit(): void {
    // Aquí puedes inicializar cualquier dato o llamar a servicios
  }

  cerrarModal(): void {
    this.showModal = false; // Cambia el estado para ocultar el modal 
  }
  }
