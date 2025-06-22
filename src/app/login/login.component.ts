import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgFor } from '@angular/common'
import { NgIf } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LoginService } from './login.service';
import { Router } from '@angular/router';
import { LoginRequest } from './loginRequest.model';
import { CreatorResponse } from './creatorResponse.model';
import { JwtResponse } from './jwtResponse.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgFor,NgIf,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  action:string="Login"
  
  constructor(private fb: FormBuilder,
  private router:Router,
  private http: HttpClient , 
  private loginService:LoginService) {
    
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }
  
  onSubmit(): void {
  if (this.loginForm.valid) {
    const loginPayload: LoginRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.loginService.login(loginPayload).subscribe({
      next: (jwt: JwtResponse) => {
        console.log('JWT reçu:', jwt);
        
       
    // Extraire le créateur depuis jwt.creator
    const creator = jwt.creator;

    localStorage.setItem('jwtToken', jwt.token); 

    localStorage.setItem('username', creator.username);
    localStorage.setItem('fullname', creator.fullname);
    localStorage.setItem('roles', creator.roles);

    this.router.navigate(['/dashboard']);
  },
      error: (err) => {
        console.error('Erreur de connexion', err);
        alert('Email ou mot de passe incorrect');
      }
    });
  } else {
    this.loginForm.markAllAsTouched();
  }
}


}