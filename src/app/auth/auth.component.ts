// auth.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private backEndURL = 'http://localhost:8080/api/auth/signup';
  // Signal pour stocker les creators
  creators = signal<any[]>([]);

  constructor(private http: HttpClient) { }

  signup(creator: any) {
    const formData = new FormData();
    formData.append('id', creator.get('id')?.value);
    formData.append('name', creator.get('fullname')?.value);
    formData.append('email', creator.get('email')?.value);
    formData.append('password', creator.get('password')?.value);
    
    return this.http.post<any>(this.backEndURL, formData).subscribe(newCreator => {
      this.creators.update(state => [...state, newCreator]);
    });
  }
}
