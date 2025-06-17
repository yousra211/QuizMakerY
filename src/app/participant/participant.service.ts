import { Injectable, signal } from '@angular/core';
import { participant } from './participant.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  /*
  addParticipant(theparticipant: participant){
      this.http.post<participant>(this.backEndUrl,theparticipant).subscribe(nouveauParticipant=>{
          this.newParticipant.update(state=>[...state,nouveauParticipant])
        })
  }*/

}