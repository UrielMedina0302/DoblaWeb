import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-header-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header-admin.component.html',
  styleUrls: ['./header-admin.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class HeaderAdminComponent {
  showDropdown = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-container')) {
      this.showDropdown = false;//
    }
  }

  onLogout() {
  // Cerrar dropdown inmediatamente
  this.showDropdown = false;
  
  this.authService.logout().subscribe({
    next: () => {
      console.log('Logout completado');
      // Redirigir al login y forzar recarga
      this.router.navigate(['/login']).then(() => {
      window.location.reload(); // Opcional: asegura limpieza completa
      });
    },
    error: (err) => {
      console.error('Error durante logout:', err);
      // Forzar redirección incluso con error
      this.router.navigate(['/login']).then(() => {
       // window.location.reload();
      });
    }
  });
}
}