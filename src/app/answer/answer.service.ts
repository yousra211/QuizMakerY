import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Answer } from './answer.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnswerService {
  private apiUrl = 'http://localhost:8080/answers'; // backend

  constructor(private http: HttpClient) {}

  addAnswers(answers: Answer[]): Observable<any> {
    return this.http.post(this.apiUrl, answers);
  }
}