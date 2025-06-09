import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from './exam.service';
import { Subscription, interval } from 'rxjs';
import { NgbActiveModal, NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Exam } from './exam.model';

@Component({
  selector: 'app-exam',
  standalone: true,
  templateUrl: './exam.component.html',
  imports: [NgIf,NgFor, NgbModalModule,CommonModule, ReactiveFormsModule],
  styleUrls: ['./exam.component.css'],
  providers: [NgbActiveModal]
})
export class ExamComponent implements OnInit {
  exams = signal<Exam[]>([]);
  isDeleteModalOpen = false;
  examToDelete: Exam | null = null;
  
  private examService = inject(ExamService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadExams();
  }

  // Charger les examens du créateur connecté
  loadExams(): void {
    const creatorId = localStorage.getItem('creatorId');
    if (creatorId) {
      this.examService.getExamsByCreator(+creatorId).subscribe({
        next: (exams: Exam[]) => {
          this.exams.set(exams);
        },
        error: (err) => {
          console.error('Erreur lors du chargement des examens:', err);
        }
      });
    } else {
      console.error('creatorId manquant dans le localStorage');
      // Optionnel: rediriger vers la page de connexion
      this.router.navigate(['/login']);
    }
  }

  // Ouvrir le modal de suppression
  openDeleteModal(exam: Exam): void {
    this.examToDelete = exam;
    this.isDeleteModalOpen = true;
  }

  // Fermer le modal de suppression
  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.examToDelete = null;
  }

  // Confirmer la suppression
  confirmDelete(): void {
    if (this.examToDelete && this.examToDelete.id) {
      this.examService.deleteExam(this.examToDelete.id).subscribe({
        next: () => {
          console.log('Examen supprimé avec succès');
          this.loadExams(); // Recharger la liste
          this.closeDeleteModal();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
        }
      });
    }
  }

  // Voir les détails d'un examen
  seeExam(exam: Exam): void {
    this.router.navigate(['/exam-view', exam.id]);
  }

  // Modifier un examen
  updateExam(exam: Exam): void {
    // Stocker l'ID de l'examen à modifier
    localStorage.setItem('examToUpdateId', exam.id!.toString());
    // Rediriger vers la page de modification (vous pouvez créer une page dédiée)
    this.router.navigate(['/update-exam', exam.id]);
  }

  // Voir les détails d'un examen (optionnel)
  viewExamDetails(exam: Exam): void {
    this.router.navigate(['/exam-details', exam.id]);
  }

  // Créer un nouvel examen
  createNewExam(): void {
    this.router.navigate(['/makequiz']);
  }
}