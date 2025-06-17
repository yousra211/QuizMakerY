import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SignupComponent } from '../signup/signup.component';
import { NgbActiveModal, NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { LoginService } from '../login/login.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink,CommonModule, NgbModalModule, SignupComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {


  constructor(private loginService : LoginService, private modalService : NgbModal , private router : Router){}

   isLoggedIn(): boolean {
    return this.loginService.isLoggedIn();
  }
  
  logout(): void {
    this.loginService.logout();
  }

isParticipantPage(): boolean {
  return this.router.url.includes('/participant') || 
         this.router.url.includes('/exam-participant');
}


  openSignupModal() {
    this.modalService.open(SignupComponent);
  }

}
