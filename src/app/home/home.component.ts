import { Component } from '@angular/core';
import { RouterOutlet,Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SignupComponent } from '../signup/signup.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

signup:any;
signupService:any;

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

    constructor(private router: Router , private modal : NgbModal){
    
    }

ngOnInits(){
this.signup=this.signupService.signup;
}

OpenModal()
{
  this.modal.open(SignupComponent)
}
    goToLogin(login:string):void{
      this.router.navigate([`${login}`]);
    
    }
    
    goToSignup(signup:string):void{
      this.router.navigate([`${signup}`]);
    
    }
    createQuiz() {
     
      console.log('Create quiz clicked');
    }
}

