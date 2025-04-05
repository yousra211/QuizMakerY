import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SignupComponent } from '../../auth/signup/signup.component';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../auth/auth.component';
import { LoginComponent } from '../../auth/login/login.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

    constructor(private modalService: NgbModal,private authService: AuthService) {}

    openLoginModal() {
      this.modalService.open(LoginComponent);
    }

    openSignupModal() {
      this.modalService.open(SignupComponent);
    }

  }