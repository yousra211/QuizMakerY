import { Component } from '@angular/core';
import { ListComponent } from './list/list.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormComponent } from './form/form.component';
import { HttpClient , HttpClientModule} from '@angular/common/http';

@Component({
  selector: 'app-creator',
  standalone: true,
  imports: [ListComponent, HttpClientModule],
  templateUrl: './creator.component.html',
  styleUrl: './creator.component.css'
})
export class CreatorComponent {

	constructor(private modal:NgbModal, private http: HttpClient) {}

	openModal() {
	  // Your logic to open the modal goes here
	  this.modal.open(FormComponent);
	}
  }