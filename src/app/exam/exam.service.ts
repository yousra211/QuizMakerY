// exam.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, switchMap } from 'rxjs';
import { Exam } from './exam.model';
import { Question } from '../question/question.model';


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
    // D'abord récupérer l'examen
    const exam$ = this.http.get<Exam>(`${this.apiUrl}/exams/${examId}`);
    // Ensuite récupérer les questions
    const questions$ = this.http.get<Question[]>(`${this.apiUrl}/exams/${examId}/questions`);
    
    // Combiner les deux appels
    return exam$.pipe(
      switchMap(exam => 
        questions$.pipe(
          map(questions => ({
            ...exam,
            questions: questions
          }))
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
/*zainab code
  getExam(examLink: string, token: string): Observable<{ exam: ExamData, questions: Question[] }> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<{ exam: ExamData, questions: Question[] }>(`${this.apiUrl}/exam/${examLink}`, { headers });
  }

  getExamByLink(uniqueLink: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/link/${uniqueLink}`);
  }
  
  // Add this method to your ExamService class
addExam(examData: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/add-exam`, examData);
}

  submitExam(examId: string, answers: Answer[], location: any, token: string): Observable<SubmissionResult> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post<SubmissionResult>(`${this.apiUrl}/submit-exam/${examId}`, { answers, location }, { headers });
  }*/
}
