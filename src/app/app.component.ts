import { ReactiveFormsModule,FormControl,FormGroup } from '@angular/forms';

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgFor } from '@angular/common'
import { NgIf } from '@angular/common'
import { FooterComponent } from './shared/footer/footer.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,NgFor,NgIf,ReactiveFormsModule,FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'QuizMaker';
  // Add your component logic here
  items = [
    { id: 1, name: 'Item 1', description: 'Description for item 1' },
    { id: 2, name: 'Item 2', description: 'Description for item 2' },
    { id: 3, name: 'Item 3', description: 'Description for item 3' }
  ];
  
  selectedItem: any = null;
  
  selectItem(item: any): void {
    this.selectedItem = item;
  }
}
  
