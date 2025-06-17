import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Answer } from './answer.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnswerService {
  private apiUrl = 'http://localhost:8080'; // backend

  constructor(private http: HttpClient) {}

  addAnswers(answers: Answer[]): Observable<any> {
    return this.http.post(this.apiUrl, answers);
  }

// Dans AnswerService
addAnswersForParticipant(participantId: number, answers: Answer[]): Observable<Answer[]> {
  const url = `${this.apiUrl}/participants/${participantId}/answers`;
  return this.http.post<Answer[]>(url, answers);
}

//ghanhtaja bach n afficher les reponses dialo n creator
  // Pour récupérer les réponses d'un participant (optionnel)
    getParticipantAnswers(participantId: number): Observable<Answer[]> {
        return this.http.get<Answer[]>(`${this.apiUrl}?participantId=${participantId}`);
    }
}