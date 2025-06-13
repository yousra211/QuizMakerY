import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
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


  constructor(private loginService : LoginService, private modalService : NgbModal){}

   isLoggedIn(): boolean {
    return this.loginService.isLoggedIn();
  }
  
  logout(): void {
    this.loginService.logout();
  }




  openSignupModal() {
    this.modalService.open(SignupComponent);
  }

}
