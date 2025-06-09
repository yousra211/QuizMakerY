import { ReactiveFormsModule,FormControl,FormGroup } from '@angular/forms';
import { NavbarComponent } from './navbar/navbar.component';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgFor } from '@angular/common'
import { NgIf } from '@angular/common'
import { NgbAccordionModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap'; // importez uniquement les modules dont vous avez besoin

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,NgFor,NgIf,ReactiveFormsModule,NavbarComponent,NgbAccordionModule, NgbAlertModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

}
  
