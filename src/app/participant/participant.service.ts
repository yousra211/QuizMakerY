import { Injectable, signal } from '@angular/core';
import { participant } from './participant.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Participant } from '../answer/answer.model';

@Injectable({
  providedIn: 'root'
})
export class ParticipantService {
  
backEndUrl = 'http://localhost:8080/participants';
newParticipant=signal<participant[]>([])
  constructor(private http: HttpClient) {}

  addParticipant(participantData: any): Observable<any> {
    return this.http.post(`${this.backEndUrl}`, participantData);
  }
 updateTotalScore(participantId: number, score: number): Observable<void> {
  return this.http.put<void>(`${this.backEndUrl}/${participantId}/score`, score);
}

getParticipantById(id: number): Observable<any> {
  return this.http.get(`${this.backEndUrl}/${id}`);
}
// participant.service.ts
updateParticipantScore(participantId: number, totalScore: number): Observable<any> {
  return this.http.put(`${this.backEndUrl}/${participantId}/score`, { totalScore });
}

  /*
  addParticipant(theparticipant: participant){
      this.http.post<participant>(this.backEndUrl,theparticipant).subscribe(nouveauParticipant=>{
          this.newParticipant.update(state=>[...state,nouveauParticipant])
        })
  }*/

}