import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
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
      tap(creator => {
        // Stocker les identifiants pour l'authentification Basic
        const basicAuth = btoa(`${payload.email}:${payload.password}`);
        localStorage.setItem('basicAuth', basicAuth);
      })
    );
}
  logout(): void {
    localStorage.removeItem('email');
    localStorage.removeItem('password');
    localStorage.removeItem('creatorId');
    localStorage.removeItem('creatorName');
    localStorage.removeItem('basicAuth'); 
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
}
