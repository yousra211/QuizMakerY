import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { LoginRequest } from './loginRequest.model';
import { CreatorResponse } from './creatorResponse.model';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private baseUrl = 'http://localhost:8080/auth'; 

  constructor(private http: HttpClient, private router: Router) {}

login(payload: LoginRequest): Observable<CreatorResponse> {
    return this.http.post<CreatorResponse>(`${this.baseUrl}/login`, payload)
    .pipe(
      tap((response: CreatorResponse) => {
        // Stocker les identifiants pour l'authentification Basic
        const basicAuth = btoa(`${payload.email}:${payload.password}`);
        localStorage.setItem('basicAuth', basicAuth);
        
        // Store user data based on response
        if (response.roles && response.roles.includes('ROLE_ADMIN')) {
          localStorage.setItem('isAdmin', 'true');
        } else {
          
          localStorage.setItem('creatorId', response.id.toString());
          localStorage.setItem('creatorName', response.fullname);
          localStorage.setItem('creatorUserName', response.username); // Utilisez le username renvoyé par l'API
        }
        localStorage.setItem('email', payload.email);
      })
    );
  }
////////// zidta
  isAdmin(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('isAdmin') === 'true';
    }
    return false; // Default return value when localStorage is not available
  }



 logout(): void {
  localStorage.removeItem('email');
  localStorage.removeItem('password');
  localStorage.removeItem('creatorId');
  localStorage.removeItem('creatorName');
  localStorage.removeItem('creatorUserName');
  localStorage.removeItem('basicAuth');
  localStorage.removeItem('isAdmin');
  
  // Rediriger vers login
  this.router.navigate(['/login']);
}
  getAuthHeaders() {
    const auth = localStorage.getItem('basicAuth');
    if (auth) {
      console.log("En-tête d'authentification utilisé:", `Basic ${auth}`); // Pour déboguer
      return new HttpHeaders({
        'Authorization': `Basic ${auth}`
      });
    }
    return new HttpHeaders();
  }

  isLoggedIn(): boolean {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('basicAuth') !== null;
  }
  return false;
}

}