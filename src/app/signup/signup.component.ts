
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
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      confirmPassword: ['', Validators.required]}, 
      { validator: this.passwordMatchValidator });
  }

  

  /*closeForm() {
    this.showForm = false;
  }*/
    fermer() {
      this.activeModal.close();
    }

  onSubmit() {
    if ( this.signupForm.valid ) {

      const newcreatorData = {
        
        fullname: this.signupForm.value.fullname,
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
/*
  onSubmit() {
    if (this.signupForm.valid) {
      this.signupService.registerCreator(this.signupForm).subscribe({
        next: () => {
          this.signupMessage = 'Inscription réussie!';
          this.signupForm.reset();
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (error) => {
          this.signupError = error.error || 'Échec de l\'inscription.';
        }
      });
    }
  }
    */
   
}
