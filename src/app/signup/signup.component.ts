
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgFor } from '@angular/common';
import { NgIf } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

import { Router, RouterLink } from '@angular/router';
import { SignupService } from './signup.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule,RouterLink,CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
  providers: [NgbActiveModal]
})
export class SignupComponent {
  /*showForm: boolean = true;*/
  signupForm: FormGroup;
  newcreatorData:any
  signupMessage: string = '';
  signupError: string = '';
 

  constructor(private fb: FormBuilder,private activeModal: NgbActiveModal,
     private signupService: SignupService, private http: HttpClient, private router: Router) {
    this.signupForm = this.fb.group({
      fullname: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      confirmPassword: ['', Validators.required]}, 
      { validator: this.passwordMatchValidator });
  }

    fermer() {
      this.activeModal.close();
    }

  onSubmit() {
    if ( this.signupForm.valid ) {

      const newcreatorData = {
        
        fullname: this.signupForm.value.fullname,
        username: this.signupForm.value.username,
        email: this.signupForm.value.email,
        password: this.signupForm.value.password,
        confirmPassword: this.signupForm.value.confirmPassword
      };

      this.signupService.registerCreator( newcreatorData);
      this.router.navigate(['/home']);
    } else {
      console.error("Formulaire invalide ");
       }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

}
