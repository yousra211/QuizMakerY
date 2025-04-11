import { Component } from '@angular/core';
import { ListComponent } from './list/list.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormComponent } from './form/form.component';
import { HttpClient } from '@angular/common/http';
import { CreatorsService } from './creators.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-creators',
  standalone: true,
  imports: [ListComponent,CommonModule],
  templateUrl: './creators.component.html',
  styleUrl: './creators.component.css'
})
export class CreatorsComponent {

	constructor(private modal:NgbModal, private creatorsService: CreatorsService ) {}

	openModal() {
	  
	  this.modal.open(FormComponent);
	}
  }