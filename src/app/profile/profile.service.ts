
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreatorResponse } from '../login/creatorResponse.model';


@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private baseUrl = 'http://localhost:8080/creators';

  constructor(private http: HttpClient) {}

  // Récupérer le profil du créateur par son ID
  getCreatorProfile(id: number): Observable<CreatorResponse> {
    return this.http.get<CreatorResponse>(`${this.baseUrl}/${id}`);
  }

  // Mettre à jour le profil du créateur
  updateCreatorProfile(creator: CreatorResponse): Observable<CreatorResponse> {
    return this.http.put<CreatorResponse>(`${this.baseUrl}/${creator.id}`, creator);
  }
   // Mettre à jour le profil du créateur avec une nouvelle image
   updateCreatorProfileWithImage(
    id: number,
    fullname: string,
    username: string,
    email: string,
    file: File
  ): Observable<CreatorResponse> {
    const formData = new FormData();
  
    formData.append('fullname', fullname);
    formData.append('username', username);
    formData.append('email', email);
    formData.append('file', file); // Nom exact attendu côté backend
  
    return this.http.put<CreatorResponse>(`${this.baseUrl}/${id}/image`, formData);
  }
  
  
  
}