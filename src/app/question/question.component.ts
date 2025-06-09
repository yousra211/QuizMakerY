import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, NgModule, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { Question } from './question.model';
import { QuestionService } from './question.service';
import { Router } from '@angular/router';
import { response } from 'express';

@Component({
  selector: 'app-question',
  standalone: true,
  imports: [CommonModule ,   ReactiveFormsModule],
  templateUrl: './question.component.html',
  styleUrl: './question.component.css',
  providers: [NgbActiveModal ,   ReactiveFormsModule] 
})
export class QuestionComponent implements OnInit {

  examForm: FormGroup;
  mediaTypes = ['None', 'Image', 'Video', 'Audio'];

  constructor(private fb: FormBuilder,
    private questionService:QuestionService ,private router: Router
  ) {
    this.examForm = this.fb.group({
      questions: this.fb.array([])
    });
  }
ngOnInit(): void {

}

  get questions() {
    return this.examForm.get('questions') as FormArray;
  }

  getOptions(questionIndex: number) {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  addQuestion(type: string) {
    const questionGroup = this.fb.group({
      type: [type],
      statement: ['', Validators.required],
      mediaType: ['None'],
      grade: [1, [Validators.required, Validators.min(0)]],
      response: [''],
      options: this.fb.array(type === 'mcq' ? this.createInitialOptions() : [])
    });

    this.questions.push(questionGroup);
  }

  createInitialOptions() {
    return [
      this.createOption('', false),
      this.createOption('', false)
    ];
  }

  createOption(text: string, isCorrect: boolean) {
    return this.fb.group({
      text: [text, Validators.required],
      isCorrect: [isCorrect]
    });
  }

  addOption(questionIndex: number) {
    this.getOptions(questionIndex).push(this.createOption('', false));
  }

  removeOption(questionIndex: number, optionIndex: number) {
    this.getOptions(questionIndex).removeAt(optionIndex);
  }

  removeQuestion(questionIndex: number) {
    this.questions.removeAt(questionIndex);
  }

   onSubmit() {
    if (this.examForm.valid && this.questions.length > 0) {
      const questionsData: Question[] = this.questions.controls.map(questionControl => {
        const questionValue = questionControl.value;
        
        const questionData: Question = {
          text: questionValue.statement,
          type: questionValue.type === 'direct' ? 'directe' : 'QCM',
          grade: questionValue.grade,
        };

        // Pour les questions directes
        if (questionValue.type === 'direct') {
          questionData.response = questionValue.response;
        }

        // Pour les questions QCM
if (questionValue.type === 'mcq' && questionValue.options) {
  // Assigner directement le tableau d'options, pas la string JSON
  questionData.options = questionValue.options.map((option: any) => ({
    text: option.text,
    isCorrect: option.isCorrect
  }));

  // Récupérer TOUTES les options correctes pour le champ response
  const correctOptions = questionValue.options
    .filter((option: any) => option.isCorrect)
    .map((option: any) => option.text);

  if (correctOptions.length > 0) {
    if (correctOptions.length === 1) {
      questionData.response = correctOptions[0];
    } else {
      // Enregistrer toutes les réponses correctes
      questionData.response = JSON.stringify(correctOptions);
    }
  }
} else {
  // Pour les questions directes, options reste undefined/null
  questionData.options = undefined;
}
     

        return questionData;
      });

      const examId = localStorage.getItem('currentExamId');
      if (examId) {
        this.questionService.addQuestionsForExam(+examId, questionsData).subscribe({
          next: (response) => {
            console.log('Questions ajoutées avec succès', response);
            // Rediriger vers une page de confirmation ou dashboard
            this.router.navigate(['/dashboard']); // Ajustez selon votre routing
          },
          error: (err) => console.error("Erreur lors de l'ajout des questions", err)
        });
      } else {
        console.error("examId manquant dans le localStorage");
      }
    } else {
      console.error("Formulaire invalide ou aucune question ajoutée");
    }
  }
}