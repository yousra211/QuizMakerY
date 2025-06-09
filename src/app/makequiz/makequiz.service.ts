import { Injectable, signal } from '@angular/core';
import { exam } from './makequiz.model';
import { HttpClient } from '@angular/common/http';
import { LoginService } from '../login/login.service';

@Injectable({
  providedIn: 'root'
})
export class MakequizService {
backEndURL="http://localhost:8080"
newexams=signal<exam[]>([])
 

  constructor(private http:HttpClient , private loginService: LoginService) { }

  
  addExamForCreator(creatorId: number, examData: exam) {
 //   const headers = this.loginService.getAuthHeaders();
 const url = `${this.backEndURL}/creator/${creatorId}/exam`;
    return this.http.post<exam>(url, examData);
  }
}
