import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, NgModule } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-question',
  standalone: true,
  imports: [CommonModule ,   ReactiveFormsModule],
  templateUrl: './question.component.html',
  styleUrl: './question.component.css',
  providers: [NgbActiveModal ,   ReactiveFormsModule] 
})
export class QuestionComponent {
  examForm: FormGroup | undefined;
  mediaTypes: string[] = ['image', 'audio', 'video']; // Si tu veux proposer des médias
/*
  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.examForm = this.fb.group({
      questions: this.fb.array([])
    });
  }

  // Raccourci pour accéder au tableau des questions
  get questions(): FormArray {
    return this.examForm.get('questions') as FormArray;
  }

  // Ajouter une nouvelle question
  addQuestion(type: string): void {
    const questionForm = this.fb.group({
      type: [type, Validators.required],
      statement: ['', Validators.required],
      mediaType: ['none'],
      answer: [''], // utilisé seulement pour question directe
      options: this.fb.array([
        this.createOption(),
        this.createOption()
      ]), // utilisé seulement pour QCM
      grade: [0, [Validators.required, Validators.min(0)]],
      duration: [60, [Validators.required, Validators.min(1)]]
    });

    this.questions.push(questionForm);
  }

  // Créer une option pour les QCM
  createOption(): FormGroup {
    return this.fb.group({
      text: ['', Validators.required],
      isCorrect: [false]
    });
  }

  // Ajouter une option à une question QCM
  addOption(questionIndex: number): void {
    const options = this.questions.at(questionIndex).get('options') as FormArray;
    options.push(this.createOption());
  }

  // Supprimer une option d'une question QCM
  removeOption(questionIndex: number, optionIndex: number): void {
    const options = this.questions.at(questionIndex).get('options') as FormArray;
    if (options.length > 2) {
      options.removeAt(optionIndex);
    }
  }

  // Supprimer une question
  removeQuestion(index: number): void {
    this.questions.removeAt(index);
  }

  // Fonction appelée quand tu cliques sur "Créer l'examen"
  onSubmit(): void {
    if (this.examForm.valid) {
      const questionsPayload = this.examForm.value.questions;
      this.http.post('http://localhost:8080/questions', questionsPayload).subscribe(
        (        response: any) => {
          console.log('Questions enregistrées avec succès!', response);
          alert('Examen créé avec succès!');
          this.examForm.reset();
          this.questions.clear(); // Vide les questions après enregistrement
        },
        (        error: any) => {
          console.error('Erreur lors de l\'enregistrement des questions', error);
          alert('Erreur lors de la création de l\'examen.');
        }
      );
    } else {
      alert('Veuillez remplir toutes les informations des questions.');
    }
  }

  // Récupérer le FormArray des options d'une question
  getOptionsFromQuestion(index: number): FormArray {
    return this.questions.at(index).get('options') as FormArray;
  }
}


closeModal() {
  this.activeModal.close();
}*/
}
