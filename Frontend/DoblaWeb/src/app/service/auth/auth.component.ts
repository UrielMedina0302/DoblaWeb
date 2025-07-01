import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-auth',
  imports: [],
  template: `
    <button (click)="login()">Login</button>
    <button (click)="logout()">Logout</button>
  `,
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
 private isAuthenticated = false;

 constructor(private router: Router) { }

  login() {
    this.isAuthenticated = true;
    localStorage.setItem('auth', 'true'); 
    this.router.navigate(['/Inicio']); // Redirect to home after login
  }

  logout() {
    this.isAuthenticated = false;
    localStorage.removeItem('auth');
  }

  isLoggedIn() {
    return this.isAuthenticated || localStorage.getItem('auth') === 'true';
  }
}
