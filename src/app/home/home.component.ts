import { Component } from '@angular/core';
import { RouterOutlet,Router } from '@angular/router';
import { MakequizComponent } from '../makequiz/makequiz.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MakequizComponent, RouterOutlet],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  title = 'QuizMaker';
    // Add your component logic here
    items = [
      { id: 1, name: 'Item 1', description: 'Description for item 1' },
      { id: 2, name: 'Item 2', description: 'Description for item 2' },
      { id: 3, name: 'Item 3', description: 'Description for item 3' }
    ];
    
    selectedItem: any = null;
  
  constructor(private router: Router) {}
  
  selectItem(item: any): void {
    this.selectedItem = item;
  }
  
  createQuiz(): void {
    this.router.navigate(['/makequiz']);
  }
  
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
  
  goToSignup(): void {
    this.router.navigate(['/signup']);
  }
}
