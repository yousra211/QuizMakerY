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
  selectedFile: File | null = null;

  originalCreator :CreatorResponse = {
    id: 0,
    fullname: '',
    username: '',
    email: '',
    imageUrl: ''
  };
  
  creator:CreatorResponse = {
    id: 0,
    fullname: '',
    username: '',
    email: '',
    imageUrl: ''
  };

 
  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    
    // Récupérer l'ID du créateur depuis le localStorage
    const creatorId = localStorage.getItem('creatorId');
    
    if (creatorId) {
      // Convertir en nombre
      const id = +creatorId;
      
      // Charger les données depuis le serveur
      this.loadCreatorData(id);
    } 
  }

  loadCreatorData(id: number): void {
    // Tenter de charger les données depuis le serveur
    this.profileService.getCreatorProfile(id).subscribe(response => {
       
          // Mettre à jour les données du composant avec les données du serveur
          this.creator = response;
          this.originalCreator = {...response};
          
         
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
  }
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
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