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
  

  ngOnInit() {
    
  }

  cerrarModal() {
    this.mostrarModal = false;
  }
}
