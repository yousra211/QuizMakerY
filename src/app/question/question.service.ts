import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Question } from './question.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private apiUrl = 'http://localhost:8080/questions'; // backend

  constructor(private http: HttpClient) {}

  saveQuestions(questions: Question[]): Observable<any> {
    return this.http.post(this.apiUrl, questions);
  }
}