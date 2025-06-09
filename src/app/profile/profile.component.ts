import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CreatorsService } from '../creators/creators.service';
import { CreatorResponse } from '../login/creatorResponse.model';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
  selectedFile: File | null = null;
  profileImageUrl: string | ArrayBuffer | null = null;
  previewImageUrl: string | null = null;


  // Base URL pour les images du backend (ajustez selon votre configuration)
  private apiBaseUrl = 'http://localhost:8080';
  
  // Définir un timestamp unique au démarrage du composant pour éviter le cache
  private defaultImageTimestamp = new Date().getTime();

  originalCreator: CreatorResponse = {
    id: 0,
    fullname: '',
    username: '',
    email: '',
    photoUrl: ''
  };
     
  creator: CreatorResponse = {
    id: 0,
    fullname: '',
    username: '',
    email: '',
    photoUrl: ''
  };

  constructor(
    private profileService: ProfileService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Vérifier si nous sommes dans le navigateur avant d'utiliser localStorage
    if (isPlatformBrowser(this.platformId)) {
      // Récupérer l'ID du créateur depuis le localStorage
      const creatorId = localStorage.getItem('creatorId');
      
      if (creatorId) {
        // Convertir en nombre
        const id = +creatorId;
        
        // Charger les données depuis le serveur
        this.loadCreatorData(id);
      } 
    }
  }

  loadCreatorData(id: number): void {
    // Tenter de charger les données depuis le serveur
    this.profileService.getCreatorProfile(id).subscribe({
      next: (response) => {
        // Mettre à jour les données du composant avec les données du serveur
        this.creator = response;
        this.originalCreator = {...response};
        
        // Log pour déboguer
        console.log('Données du créateur chargées:', this.creator);
      },
      error: (error) => {
        console.error('Erreur lors du chargement du profil:', error);
      }
    });
  }

  changeEditMode() {
    this.editMode = true;
    this.selectedFile = null;
  }
  
  cancelEdit() {
    // Restaurer les valeurs originales
    this.creator = {...this.originalCreator};
    this.editMode = false;
    this.selectedFile = null;
    this.profileImageUrl = null;
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
  
      const reader = new FileReader();
      reader.onload = (e:any) => {
        this.profileImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
  
  /**
   * Détermine l'URL de l'image de profil à afficher selon la logique suivante:
   * 1. Si une nouvelle image a été sélectionnée localement, l'afficher
   * 2. Si le creator a une photoUrl qui vient du backend, l'afficher en ajoutant le préfixe du backend
   * 3. Sinon, afficher l'image par défaut du dossier assets
   */
  getProfileImageSrc(): string {
    // Si une image sélectionnée en cours de prévisualisation existe
    if (this.previewImageUrl) {
      return this.previewImageUrl;
    }
  
    // Si une URL d'image de profil (par exemple après un téléchargement réussi)
    if (this.profileImageUrl) {
      return this.profileImageUrl as string;
    }
  
    // Si le créateur a une photo définie depuis le backend
    if (this.creator && this.creator.photoUrl && this.creator.photoUrl.trim() !== '') {
      // URL complète
      if (this.creator.photoUrl.startsWith('http://') || this.creator.photoUrl.startsWith('https://')) {
        return this.creator.photoUrl;
      }
  
      // Chemin relatif (stocké dans static/photos)
      return `${this.apiBaseUrl}${this.creator.photoUrl.startsWith('/') ? '' : '/'}${this.creator.photoUrl}`;
    }
  
    // Fallback image par défaut dans Angular assets
    return `assets/profile.jpeg?t=${this.defaultImageTimestamp}`;
  }
  
  
onImageError(event: any): void {
  event.target.src = 'assets/profile.jpeg';
}
  
  saveChanges() {
    if (this.selectedFile) {
      // Mise à jour avec nouvelle image
      this.profileService.updateCreatorProfileWithImage(
        this.creator.id,
        this.creator.fullname,
        this.creator.username,
        this.creator.email,
        this.selectedFile
      ).subscribe({
        next: (response) => {
          this.creator = response;
          this.originalCreator = {...response};
          this.editMode = false;
          this.selectedFile = null;
          this.profileImageUrl = `/photos/${this.creator.id}.jpg?${new Date().getTime()}`;
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du profil avec image', error);
          alert('Erreur lors de la mise à jour du profil');
        }
      });
    } else {
      // Mise à jour sans nouvelle image
      const creatorToUpdate = {
        id: this.creator.id,
        fullname: this.creator.fullname,
        username: this.creator.username,
        email: this.creator.email
      };
      
      this.profileService.updateCreatorProfile(creatorToUpdate).subscribe({
        next: (response) => {
          this.creator = response;
          this.originalCreator = {...response};
          this.editMode = false;
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du profil', error);
          alert('Erreur lors de la mise à jour du profil');
        }
      });
    }
  }
}