import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExamComponent } from '../exam/exam.component';
import { NgIf } from '@angular/common';
import { NgbActiveModal, NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { QuestionComponent } from '../question/question.component';
import { Router } from '@angular/router';
import { MakequizService } from './makequiz.service';
import { exam } from './makequiz.model';

@Component({
  selector: 'app-makequiz',
  standalone: true,
  imports: [NgIf , NgbModalModule, ReactiveFormsModule],
  templateUrl: './makequiz.component.html',
  styleUrl: './makequiz.component.css',
  providers: [NgbActiveModal] 
})
export class MakequizComponent {
  
  makequizForm: FormGroup;
  examData:any
  uniqueLink: string = '';
  constructor(private fb: FormBuilder ,private makequizService:MakequizService ,private router: Router,private activeModal: NgbActiveModal) {
    this.makequizForm = this.fb.group({
      title: ['', [Validators.required]],
      duration: ['', [Validators.required, Validators.min(0)]],
      description: [''],
      uniqueLink: ['']
    });
  }

  onSubmit() {
    if (this.makequizForm.valid) {
      const examData: exam = {
        title: this.makequizForm.value.title,
        duration: this.makequizForm.value.duration,
        description: this.makequizForm.value.description,
        uniqueLink: this.makequizForm.value.uniqueLink,
      };
  
      const creatorId = localStorage.getItem('creatorId');
      console.log("creatorId dans localStorage:", creatorId);
      if (creatorId) {
        console.log("Contenu examData à envoyer:", examData);

        this.makequizService.addExamForCreator(+creatorId, examData).subscribe({
          next: (nouveauExam) => {
            // Facultatif : mettre à jour un signal local si tu veux
            // this.makequizService.newexams.update(state => [...state, nouveauExam]);
  
            this.router.navigate(['/question']);
          },
          error: (err) => console.error("Erreur lors de l'ajout de l'examen", err)
        });
      } else {
        console.error("creatorId manquant dans le localStorage");
      }
    } else {
      console.error("Formulaire invalide");
    }
  }
  
  cancel() {
    this.activeModal.close();
  }

}
