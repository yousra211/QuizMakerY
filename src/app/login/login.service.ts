import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { LoginRequest } from './loginRequest.model';
import { CreatorResponse } from './creatorResponse.model';
import { Router } from '@angular/router';
import { JwtResponse } from './jwtResponse.model';



@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private baseUrl = 'http://localhost:8080/auth';
  
  constructor(private http: HttpClient, private router: Router) {}

  login(payload: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.baseUrl}/login`, payload)
      .pipe(
        tap((response: JwtResponse) => {
          // Stocker le token JWT
          localStorage.setItem('jwtToken', response.token);
          
          // Stocker les données utilisateur
          const creator = response.creator;
          
          if (creator.roles && creator.roles.includes('ROLE_ADMIN')) {
            localStorage.setItem('isAdmin', 'true');
          } else {
            localStorage.setItem('creatorId', creator.id.toString());
            localStorage.setItem('creatorName', creator.fullname);
            localStorage.setItem('creatorUserName', creator.username);
          }
          
          localStorage.setItem('email', creator.email);
          
          console.log('JWT Token stocké:', response.token);
        })
      );
  }

  isAdmin(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('isAdmin') === 'true';
    }
    return false;
  }

  logout(): void {
    // Supprimer tous les éléments liés à l'authentification
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('email');
    localStorage.removeItem('creatorId');
    localStorage.removeItem('creatorName');
    localStorage.removeItem('creatorUserName');
    localStorage.removeItem('isAdmin');
    
    // Rediriger vers login
    this.router.navigate(['/login']);
  }

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      console.log("Token JWT utilisé:", `Bearer ${token}`);
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  isLoggedIn(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        // Optionnel : vérifier si le token n'est pas expiré
        return !this.isTokenExpired(token);
      }
    }
    return false;
  }

  // Méthode pour vérifier si le token JWT est expiré
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // exp est en secondes, on convertit en millisecondes
      return Date.now() > exp;
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      return true; // Si on ne peut pas décoder, considérer comme expiré
    }
  }

  // Méthode pour obtenir le token JWT
  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  // Méthode pour décoder le token et obtenir les informations utilisateur
  getTokenPayload(): any {
    const token = this.getToken();
    if (token) {
      try {
        return JSON.parse(atob(token.split('.')[1]));
      } catch (error) {
        console.error('Erreur lors du décodage du token:', error);
        return null;
      }
    }
    return null;
  }
}