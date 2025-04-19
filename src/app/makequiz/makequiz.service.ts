import { Injectable, signal } from '@angular/core';
import { exam } from './makequiz.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MakequizService {
backEndURL="http://localhost:8080/exams"
newexams=signal<exam[]>([])
 

  constructor(private http:HttpClient) { }

  addExam(newexam:exam) {
    this.http.post<exam>(this.backEndURL,newexam).subscribe(nouveauExam=>{
      this.newexams.update(state=>[...state,nouveauExam])
    })
   }

}
