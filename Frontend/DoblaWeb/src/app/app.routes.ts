import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { NosotrosComponent } from './pages/nosotros/nosotros.component';
import { ContactoComponent } from './pages/contacto/contacto.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { InicioComponent } from './pages/inicio/inicio.component';
import { LoginLayoutComponent } from './pages/login-layout/login-layout.component'; 
import { SignUpLayoutComponent } from './pages/sign-up-layout/sign-up-layout.component';
import { InicioAdminComponent } from './pages/inicio-admin/inicio-admin.component';
import { ProductoAdminComponent } from './pages/producto-admin/producto-admin.component';
import { NosotrosAdminComponent } from './pages/nosotros-admin/nosotros-admin.component';
import { ContactoAdminComponent } from './pages/contacto-admin/contacto-admin.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
export const routes: Routes = [
    // Mantenemos tus rutas exactamente como las tienes:
  { path: '', component: HomeComponent, data: { showFooter: true } },
  { path: 'home', component: InicioComponent, data: { showHeaderClient: true, showFooter: true }},
  { path: 'login', component: LoginComponent, data: { hideHeaders: true }},
  { path: 'signup', component: SignupComponent, data: { hideHeaders: true }},
  { path: 'nosotros', component: NosotrosComponent, data: { showHeaderClient: true, showFooter: true }},
  { path: 'contacto', component: ContactoComponent, data: { showHeaderClient: true, showFooter: true }},
  { path: 'productos', component: ProductosComponent, data: { showHeaderClient: true, showFooter: true }},
  { path: 'inicio-admin', component: InicioAdminComponent, data: { showHeaderAdmin: true }},
  { path: 'producto-admin', component: ProductoAdminComponent, data: { showHeaderAdmin: true }},
  { path: 'nosotros-admin', component: NosotrosAdminComponent, data: { showHeaderAdmin: true }},
  { path: 'contacto-admin', component: ContactoAdminComponent, data: { showHeaderAdmin: true }},
  { path: 'login-layout', component: LoginLayoutComponent },
  { path: 'signup-layout', component: SignUpLayoutComponent },
  {path: 'forgot-password', component: ForgotPasswordComponent, data: { hideHeaders: true }},
  { path: 'reset-password', component: ResetPasswordComponent, data: { hideHeaders: true }},
  // Modificamos solo la ruta comodín para evitar redirecciones no deseadas
  { path: '**', component: HomeComponent } // En lugar de redirectTo
];
