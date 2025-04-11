
import { CommonModule } from '@angular/common';
import { Component , ViewChild } from '@angular/core';
import {ExamService} from '../exam.service';
import { LoupeComponent } from './loupe/loupe.component';
import { ConfirmComponent } from './confirm/confirm.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent {
exams: any;
@ViewChild("nomLoupe") loupeComponent!: LoupeComponent;
constructor(private examService : examService,private modal:NgbModal){}
ngAfterViewInit(){
 const title=this.loupeComponent.value
 if ((title!="")&&(title!=undefined)){
  this.exams=this.examService.filtrerexamsBytitle(title)
 }else{
  this.exams=this.examService.getexams()
 }

}
ngOnInit(){
 this.exams=this.examService.getexams()
}
filtrer(title:string){
 this.exams=this.examService.filtrerexamsBytitle(title)
}
deleteexam(exam:any){

 this.examService.deleteexam(exam.id)
const indexToRemove=this.exams.index0f(exam)
this.exams.splicve(indexToRemove,1);
}
openModal(exam:any){
 const dialogRef= this.modal.open(ConfirmComponent);
dialogRef.result.then(data=>{
 if (data=='ok'){
   this.deleteexam(exam)
 }
})
}
}
