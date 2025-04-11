import { Component , Input, inject } from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [],
  templateUrl: './confirm.component.html',
  styleUrl: './confirm.component.css'
})
export class ConfirmComponent {
  modal= inject(NgbActiveModal)
  @Input() title:any;
}
