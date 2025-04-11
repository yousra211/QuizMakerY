import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-question',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './question.component.html',
  styleUrl: './question.component.css',
  providers: [NgbActiveModal] 
})
export class QuestionComponent {
 
constructor(public activeModal: NgbActiveModal) {}


closeModal() {
  this.activeModal.close();
}
}
