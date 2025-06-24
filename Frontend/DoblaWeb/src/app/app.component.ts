import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { BodyComponent } from './components/body/body.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderAdminComponent } from './components/header-admin/header-admin.component';
import { Footer1Component } from './components/footer1/footer1.component';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, BodyComponent, FooterComponent,HeaderAdminComponent,Footer1Component],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'DoblaWeb';
}
