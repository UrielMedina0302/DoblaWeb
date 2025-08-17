import { Component, OnInit, inject } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './components/header/header.component';
import { BodyComponent } from './components/body/body.component';
import { HeaderAdminComponent } from './components/header-admin/header-admin.component';
import { Footer1Component } from './components/footer1/footer1.component';
import { HeaderClientComponent } from './components/header-client/header-client.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    HeaderComponent,
    BodyComponent,
    HeaderAdminComponent,
    Footer1Component,
    HeaderClientComponent
  ],
  template: `
    @if (showMainHeader) {
      <app-header />
    }
    @if (showHeaderClient) {
      <app-header-client />
    }
    @if (showHeaderAdmin) {
      <app-header-admin />
    }
    
    <app-body />
    
    @if (showFooter) {
      <app-footer1 />
    }
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private router = inject(Router);

  showMainHeader = true;
  showHeaderClient = false;
  showHeaderAdmin = false;
  showFooter = false;

  ngOnInit() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateHeaderFooterVisibility(event.urlAfterRedirects || event.url);//usa urlAfterRedirects para 
      });

    this.updateHeaderFooterVisibility(this.router.url);
  }

  private updateHeaderFooterVisibility(url: string): void {
  // Extrae el path base sin parámetros/fragmentos
  const basePath = this.getBasePath(url);
  
  console.log('URL:', url, 'BasePath:', basePath); // Debug importante

  // Rutas que NO deben mostrar headers/footer
  const isAuthRoute = ['login', 'signup', 'login-layout', 'signup-layout', 'forgot-password', 'reset-password'].includes(basePath);

  // Resetear todos los flags primero
  this.showMainHeader = false;
  this.showHeaderClient = false;
  this.showHeaderAdmin = false;
  this.showFooter = false;

  // Lógica prioritaria para admin
  if (['inicio-admin', 'producto-admin', 'nosotros-admin', 'contacto-admin'].includes(basePath)) {
    this.showHeaderAdmin = true;
    this.showFooter = true;
    return;
  }

  // Lógica para cliente
  if (['home', 'productos', 'nosotros', 'contacto'].includes(basePath)) {
    this.showHeaderClient = true;
    this.showFooter = true;
    return;
  }

  // Ruta principal (home)
  if (basePath === '') {
    this.showMainHeader = true;
    this.showFooter = false; // Asegura que no se muestre footer en home
    return;
  }

  // Default para otras rutas
  this.showMainHeader = !isAuthRoute;
}

private getBasePath(url: string): string {
  return url.split('?')[0].split('#')[0].replace(/^\/|\/$/g, '');
}
}