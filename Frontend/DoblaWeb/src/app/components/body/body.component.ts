import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-body',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <div class="content">
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./body.component.css']
})
export class BodyComponent {

}
