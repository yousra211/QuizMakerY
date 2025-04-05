import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Check if user is already logged in
    if (localStorage.getItem('token')) {
      this.isLoggedInSubject.next(true);
    }
  }

  // Login with email and password
  login(email: string, password: string) {
    return this.http.post<{token: string}>('/api/login', {email, password}).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        this.isLoggedInSubject.next(true);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Login failed:', error);
      }
    });
  }

  // Register new user
  signup(userData: {name: string, email: string, password: string}) {
    return this.http.post('/api/signup', userData).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Signup failed:', error);
      }
    });
  }

  // Logout current user
  logout() {
    localStorage.removeItem('token');
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  // Get current token
  getToken() {
    return localStorage.getItem('token');
  }

  // Check if user is logged in (simple synchronous check)
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
}