
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgFor } from '@angular/common';
import { NgIf } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule,RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
  providers: [NgbActiveModal]
})
export class SignupComponent {

  signupForm: FormGroup;
  signupMessage: string = '';
  signupData:any;
  action:string="sign up"
  

  constructor(private fb: FormBuilder, 
      private http: HttpClient ,
      private activeModal: NgbActiveModal) {
    this.signupForm = this.fb.group({
      fullname: ['', Validators.required], 
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      confirmPassword: ['', Validators.required]
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  onSubmit() {
    console.log("ok")
      const formData = new FormData();
      formData.append('fullname', this.signupForm.get('fullname')?.value); 
      formData.append('username', this.signupForm.get('username')?.value);
      formData.append('email', this.signupForm.get('email')?.value);
      formData.append('password', this.signupForm.get('password')?.value);

      this.http.post('http://localhost:8080/api/auth/signup', formData, { responseType: 'text' })
        .subscribe({
          next: (response) => {
            this.signupMessage = 'Signup successful!';
            this.signupForm.reset();
          },
          error: (error) => {
            this.signupMessage = error.error || 'Signup failed. Try again.';
          }
        });
    }

    fermer() {
      this.activeModal.close();
    }
    
  
    ngOnInit(){
      if(this.action=="Modifier")
      this.signupForm.setValue(this.signupData)
    }
  } 
