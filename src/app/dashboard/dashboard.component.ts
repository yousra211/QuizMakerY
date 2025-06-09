import { Component } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { ProfileComponent } from "../profile/profile.component";
import { ExamComponent } from "../exam/exam.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgbNavModule, NgbNavModule, ProfileComponent, ExamComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  active = 'profile';
}