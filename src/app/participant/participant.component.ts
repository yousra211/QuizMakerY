import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ParticipantService } from './participant.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-participant',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule,RouterLink,CommonModule],
  templateUrl: './participant.component.html',
  styleUrl: './participant.component.css'
})
export class ParticipantComponent {
participantForm: FormGroup;
participantData:any ;

 constructor(private fb: FormBuilder,
     private participantService: ParticipantService, private http: HttpClient, private router: Router) {
    this.participantForm = this.fb.group({
      
      email: ['', [Validators.required, Validators.email]],
      fullname: ['', Validators.required],
      cin: ['', Validators.required]}, 
      );
  }

onSubmit() {
  if (this.participantForm.valid) {
    const participantData = {
      email: this.participantForm.value.email,
      fullname: this.participantForm.value.fullname,
      cin: this.participantForm.value.cin
    };

    this.participantService.addParticipant(participantData).subscribe({
      next: (response: any) => {
        // Enregistre l'ID du participant dans le localStorage
        localStorage.setItem('currentParticipantId', response.id.toString());
        
        // Redirection vers la page d'examen
        this.router.navigate(['/exam-participant']);
      },
      error: (err) => {
        console.error("Erreur lors de l'ajout du participant", err);
        // Gestion supplémentaire des erreurs si nécessaire
      }
    });
  } else {
    console.error("Formulaire invalide");
    // Ajoutez éventuellement un feedback utilisateur ici
  }
}
}
