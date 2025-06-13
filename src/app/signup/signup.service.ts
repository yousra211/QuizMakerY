
import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { newCreator } from '../signup/signup.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignupService {
   backEndUrl = 'http://localhost:8080/auth/register';
newcreators=signal<newCreator[]>([])
  constructor(private http: HttpClient) {}

registerCreator(newcreator:newCreator) { //////   i may not need it ////
    this.http.post<newCreator>(this.backEndUrl,newcreator).subscribe(nouveauCreator=>{
      this.newcreators.update(state=>[...state,nouveauCreator])
    })
    }




}