import { Component } from '@angular/core';
import { ReactiveFormsModule , FormBuilder, Validators} from '@angular/forms';
import{NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { ExamService } from '../exam.service';



@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent {
 
    constructor(private fb:FormBuilder, private examService:examService,  private activeModal: NgbActiveModal){}
  formexam= this.fb.group({
    "id":['',Validators.required],
    "title":['',Validators.required],
    "duration":['',Validators.required],
    "description":['',Validators.required],
    "passingscore":['',Validators.required],
  }) 
  
    ajouterexam(){
      this.examService.addexam(this.formexam.value)
      this.activeModal.close()
    }
    Fermer(){
      this.activeModal.close()
  
  }
  
  }
