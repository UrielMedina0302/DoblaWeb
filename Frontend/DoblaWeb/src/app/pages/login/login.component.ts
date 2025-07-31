import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  template: `
    <h1>Login</h1>
    <button routerLink="/login">Ir a Registro</button>
  `,
})
export class LoginComponent {

}
