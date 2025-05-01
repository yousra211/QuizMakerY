import { Component, OnInit } from '@angular/core';
import { CreatorsService } from '../creators/creators.service';
import { CreatorResponse } from '../login/creatorResponse.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
  editMode=false;
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

  constructor(private creatorsService: CreatorsService) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
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
      
      // Afficher les valeurs pour le débogage
      console.log('Profile - Données chargées:');
      console.log('fullname:', this.fullname);
      console.log('username:', this.username);
      console.log('email:', this.email);
      
      // Vérifier les valeurs manquantes
      if (!this.fullname) console.error('creatorFullName manquant dans le localStorage');
      if (!this.username) console.error('creatorUserName manquant dans le localStorage');
      if (!this.email) console.error('creatorEmail manquant dans le localStorage');
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
    this.creatorsService.updateCreator(this.creator).subscribe({
      next: (response) => {
        console.log('Mise à jour réussie:', response);
        
        // Mettre à jour les données locales et le localStorage
        this.fullname = response.fullname;
        this.username = response.username;
        this.email = response.email;
        
        localStorage.setItem('creatorFullName', response.fullname);
        localStorage.setItem('creatorUserName', response.username);
        localStorage.setItem('creatorEmail', response.email);
        
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