// exam.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Exam } from './exam.model';
import { Question } from '../question/question.model';
import { Answer } from '../answer/answer.model';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ExamService {
   private apiUrl = 'http://localhost:8080'; // Ajustez selon votre configuration

  constructor(private http: HttpClient) { }

  // Récupérer tous les examens d'un créateur
  getExamsByCreator(creatorId: number): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${this.apiUrl}/creators/${creatorId}/exams`);
  }

  // Récupérer un examen par ID avec ses questions
  getExamById(examId: number): Observable<Exam> {
    return this.http.get<Exam>(`${this.apiUrl}/exams/${examId}`);
  }

  // Récupérer un examen avec ses questions par ID
  getExamWithQuestions(examId: number): Observable<Exam> {
    const exam$ = this.http.get<Exam>(`${this.apiUrl}/exams/${examId}`).pipe(
      catchError((error: any) => {
        console.error('Erreur lors de la récupération de l\'examen', error);
        throw new Error('Impossible de charger les détails de l\'examen');
      })
    );

    const questions$ = this.http.get<Question[]>(`${this.apiUrl}/exams/${examId}/questions`).pipe(
      catchError((error: any) => {
        console.error('Erreur lors de la récupération des questions', error);
        return of([] as Question[]); // Typage explicite ici
      })
    );

    return exam$.pipe(
      switchMap(exam => 
        questions$.pipe(
          map(questions => ({
            ...exam,
            questions: questions || []
          } as Exam)) // Assertion de type ici
        )
      )
    );
  }

  // Supprimer un examen
  deleteExam(examId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/exams/${examId}`);
  }

  // Mettre à jour un examen
  updateExam(exam: Exam): Observable<Exam> {
    return this.http.put<Exam>(`${this.apiUrl}/exams`, exam);
  }

  // Récupérer tous les examens (optionnel)
  getAllExams(): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${this.apiUrl}/exams`);
  }
 /* about exam participant 
 submitAnswer(answer: Answer): Observable<Answer> {
    return this.http.post<Answer>(
      `${this.apiUrl}/answers`, 
      answer, 
      this.httpOptions
    );
  }
 submitMultipleAnswers(answers: Answer[]): Observable<Answer[]> {
    return this.http.post<Answer[]>(
      `${this.apiUrl}/answers/batch`, 
      answers, 
      this.httpOptions
    );
  }
  getParticipantAnswers(participantId: number, examId: number): Observable<Answer[]> {
    return this.http.get<Answer[]>(
      `${this.apiUrl}/answers/participant/${participantId}/exam/${examId}`
    );
  }
   hasParticipantSubmitted(participantId: number, examId: number): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}/answers/participant/${participantId}/exam/${examId}/exists`
    );
  }
}
  */
}
