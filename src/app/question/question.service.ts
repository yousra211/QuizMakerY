import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Question } from './question.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private apiUrl = 'http://localhost:8080'; // backend
 newQuestions = signal<Question[]>([]);
 
  constructor(private http: HttpClient) {}

  
  addQuestionsForExam(examId: number, questionsData: Question[]): Observable<Question[]> {
    // const headers = this.loginService.getAuthHeaders(); // Décommentez si vous utilisez l'authentification
    const url = `${this.apiUrl}/exams/${examId}/questions`;
    return this.http.post<Question[]>(url, questionsData);
  }
}