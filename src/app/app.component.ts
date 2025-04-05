import { ReactiveFormsModule,FormControl,FormGroup } from '@angular/forms';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgFor } from '@angular/common'
import { NgIf } from '@angular/common'
import { FooterComponent } from './shared/footer/footer.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,NgFor,NgIf,ReactiveFormsModule,NavbarComponent,FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

}
  

