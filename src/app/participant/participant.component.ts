import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ParticipantService } from './participant.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-participant',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule,RouterLink,CommonModule],
  templateUrl: './participant.component.html',
  styleUrl: './participant.component.css'
})
export class ParticipantComponent implements OnInit {
  participantForm: FormGroup;
  participantData: any;
  
  // Nouvelles propriétés pour récupérer les paramètres de l'URL
  private examId: number = 0;
  private token: string = '';

  constructor(
    private fb: FormBuilder,
    private participantService: ParticipantService, 
    private http: HttpClient, 
    private router: Router,
    private route: ActivatedRoute // Ajouter ActivatedRoute
  ) {
    this.participantForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      fullname: ['', Validators.required],
      cin: ['', Validators.required]
    });
  }

  // Ajouter ngOnInit
  ngOnInit() {
    // Récupérer l'examId et le token de l'URL
    this.examId = +this.route.snapshot.params['examId'];
    this.token = this.route.snapshot.params['token'];
    
    console.log('Exam ID:', this.examId, 'Token:', this.token);
    
    // Vérifier si les paramètres sont présents
    if (!this.examId || !this.token) {
      console.error('Paramètres manquants dans l\'URL');
      // Optionnel : rediriger vers une page d'erreur
    }
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

          // MODIFICATION ICI : Redirection avec examId et token
          this.router.navigate(['/exam-participant', this.examId, this.token]);
        },
        error: (err) => {
          console.error("Erreur lors de l'ajout du participant", err);
        }
      });
    } else {
      console.error("Formulaire invalide");
    }
  }
}