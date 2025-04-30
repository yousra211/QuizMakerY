import { Component, OnInit } from '@angular/core';
import { CreatorsService } from '../creators/creators.service';
import { CreatorResponse } from '../login/creatorResponse.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  fullname = '';
  username = '';
  email = '';
  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      // Récupérer les données du localStorage
      this.fullname = localStorage.getItem('creatorFullName') ?? '';
      this.username = localStorage.getItem('creatorUserName') ?? '';
      this.email = localStorage.getItem('creatorEmail') ?? '';
      
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

  creator: CreatorResponse = {
    id: +(localStorage.getItem('creatorId') ?? 0),
    fullname: localStorage.getItem('creatorFullName') ?? '',
    username: localStorage.getItem('creatorUserName') ?? '',
    email: localStorage.getItem('creatorEmail') ?? '',
    photoUrl: localStorage.getItem('creatorPhoto') ?? ''
  };

  constructor(private creatorsService: CreatorsService) {}

  modifier() {
    this.creatorsService.updateCreator(this.creator);
  }
}

