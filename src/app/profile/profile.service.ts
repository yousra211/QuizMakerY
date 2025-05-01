
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
    // Créer un objet simplifié avec uniquement les propriétés nécessaires
    const profileData = {
      id: creator.id,
      fullname: creator.fullname,
      username: creator.username,
      email: creator.email
    };
    
    // Si photoUrl existe, l'ajouter à l'objet
    if (creator.photoUrl) {
      Object.assign(profileData, { photoUrl: creator.photoUrl });
    }
    
    console.log('Données envoyées au backend:', JSON.stringify(profileData));
    
    return this.http.put<CreatorResponse>(`${this.baseUrl}/${creator.id}`, profileData);
  }
}