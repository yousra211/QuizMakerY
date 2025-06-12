import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, NgModule, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { Question, QuestionOption } from './question.model';
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
        // options reste undefined pour les questions directes
      }

      // Pour les questions QCM
      if (questionValue.type === 'mcq' && questionValue.options) {
        const questionOptions: QuestionOption[] = questionValue.options.map((option: any) => ({
          text: option.text,
          isCorrect: option.isCorrect
        }));
        
        // Gérer options - toutes les options (correctes et incorrectes)
        if (questionOptions.length === 1) {
          questionData.options = questionOptions[0].text;
        } else {
          questionData.options = JSON.stringify(questionOptions);
        }
        
        // Gérer response - seulement les options correctes
        const correctOptions = questionOptions
          .filter(option => option.isCorrect)
          .map(option => option.text);
          
        if (correctOptions.length > 0) {
          if (correctOptions.length === 1) {
            questionData.response = correctOptions[0];
          } else {
            questionData.response = JSON.stringify(correctOptions);
          }
        }
      }

      console.log('Question envoyée:', questionData);
      return questionData;
    });

    console.log('Toutes les questions:', questionsData);

    const examId = localStorage.getItem('currentExamId');
    if (examId) {
      this.questionService.addQuestionsForExam(+examId, questionsData).subscribe({
        next: (response) => {
          console.log('Questions ajoutées avec succès', response);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error("Erreur complète:", err);
          console.error("Status:", err.status);
          console.error("Message:", err.error);
          console.error("Body envoyé:", questionsData);
        }
      });
    } else {
      console.error("examId manquant dans le localStorage");
    }
  } else {
    console.error("Formulaire invalide ou aucune question ajoutée");
  }
}
}