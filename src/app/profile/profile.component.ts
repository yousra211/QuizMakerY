import { Component, OnInit } from '@angular/core';
import { CreatorsService } from '../creators/creators.service';
import { CreatorResponse } from '../login/creatorResponse.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { catchError, of } from 'rxjs';
import { ProfileService } from './profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  fullname = '';
  username = '';
  email = '';
  editMode = false;
  originalCreator: CreatorResponse = {
    id: 0,
    fullname: '',
    username: '',
    email: ''
  };
  
  creator: CreatorResponse = {
    id: 0,
    fullname: '',
    username: '',
    email: ''
  };

  // Propriété pour vérifier si localStorage est disponible
  private get isLocalStorageAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    if (!this.isLocalStorageAvailable) {
      console.log('Rendu côté serveur détecté, localStorage non disponible');
      return; // Sortir tôt si localStorage n'est pas disponible
    }

    // Récupérer l'ID du créateur depuis le localStorage
    const creatorId = localStorage.getItem('creatorId');
    
    if (creatorId) {
      // Convertir en nombre
      const id = +creatorId;
      
      // Charger les données depuis le serveur
      this.loadCreatorData(id);
    } else {
      console.error('ID du créateur non trouvé dans le localStorage');
      this.loadFromLocalStorage(); // Fallback sur localStorage
    }
  }

  loadCreatorData(id: number): void {
    // Tenter de charger les données depuis le serveur
    this.profileService.getCreatorProfile(id)
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des données:', error);
          
          // En cas d'erreur, utiliser les données du localStorage comme fallback
          if (this.isLocalStorageAvailable) {
            this.loadFromLocalStorage();
          }
          
          // Retourner un observable vide pour continuer
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          // Mettre à jour les données du composant avec les données du serveur
          this.creator = response;
          this.originalCreator = {...response};
          
          // Mettre à jour les variables individuelles pour l'affichage
          this.fullname = response.fullname;
          this.username = response.username;
          this.email = response.email;
          
          // Mettre à jour le localStorage avec les données les plus récentes
          if (this.isLocalStorageAvailable) {
            this.updateLocalStorage(response);
          }
        }
      });
  }

  loadFromLocalStorage(): void {
    if (!this.isLocalStorageAvailable) {
      return;
    }

    // Récupérer les données du localStorage
    this.fullname = localStorage.getItem('creatorFullName') ?? '';
    this.username = localStorage.getItem('creatorUserName') ?? '';
    this.email = localStorage.getItem('creatorEmail') ?? '';
        
    // Initialiser les données du creator
    this.creator = {
      id: +(localStorage.getItem('creatorId') ?? 0),
      fullname: this.fullname,
      username: this.username,
      email: this.email,
      photoUrl: localStorage.getItem('creatorPhoto') ?? ''
    };
        
    // Conserver une copie des données originales
    this.originalCreator = {...this.creator};
  }

  updateLocalStorage(creator: CreatorResponse): void {
    if (!this.isLocalStorageAvailable) {
      return;
    }

    localStorage.setItem('creatorId', creator.id.toString());
    localStorage.setItem('creatorFullName', creator.fullname);
    localStorage.setItem('creatorUserName', creator.username);
    localStorage.setItem('creatorEmail', creator.email);
    if (creator.photoUrl) {
      localStorage.setItem('creatorPhoto', creator.photoUrl);
    }
  }

  toggleEditMode() {
    this.editMode = true;
  }
  
  cancelEdit() {
    // Restaurer les valeurs originales
    this.creator = {...this.originalCreator};
    this.editMode = false;
  }
  
  saveChanges() {
    // Appeler le service pour mettre à jour les données
    this.profileService.updateCreatorProfile(this.creator).subscribe({
      next: (response) => {
        console.log('Mise à jour réussie:', response);
                
        // Mettre à jour les données locales et le localStorage
        this.fullname = response.fullname;
        this.username = response.username;
        this.email = response.email;
                
        if (this.isLocalStorageAvailable) {
          this.updateLocalStorage(response);
        }
                
        // Mettre à jour l'original pour les futures annulations
        this.originalCreator = {...response};
                
        // Sortir du mode édition
        this.editMode = false;
      },
      error: (error) => {
        // Afficher plus de détails sur l'erreur
        console.error('Erreur détaillée lors de la mise à jour:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Erreur complète:', JSON.stringify(error));
                
        // Message d'erreur plus informatif
        alert(`Erreur lors de la mise à jour du profil (${error.status}). Vérifiez la console pour plus de détails.`);
      }
    });
  }
}