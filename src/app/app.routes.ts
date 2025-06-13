import { RouterModule, Routes } from '@angular/router';

import { ExamComponent } from './exam/exam.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { HomeComponent } from './home/home.component';
import { MakequizComponent } from './makequiz/makequiz.component';
import { NavbarComponent } from './navbar/navbar.component';
import { CreatorsComponent } from './creators/creators.component';
import { QuestionComponent } from './question/question.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { ExamViewComponent } from './exam-view/exam-view.component';
import { ListComponent } from './creators/list/list.component';
import { AdminGuard } from './login/admin.guard';
import { FooterComponent } from './shared/footer/footer.component';
export const routes: Routes = [

  { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'question',  component: QuestionComponent },
  { path: 'home', component: HomeComponent }, 
  { path: 'makequiz', component: MakequizComponent },
  { path: 'login', component: LoginComponent },
  // { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'signup', component: SignupComponent },
  {path: "creators",component:CreatorsComponent },
  {path: "exam",component:ExamComponent},
  //{path: '**', redirectTo: 'home' } ,
  {path: "navbar",component:NavbarComponent},
   {path: 'footer', component: FooterComponent},
  {path: "dashboard",component:DashboardComponent},
  {path: "profile",component:ProfileComponent},
  { path: 'exam-view/:id',component: ExamViewComponent},
 { path: 'admin', canActivate: [AdminGuard], children: [{ path: 'creators', component: ListComponent }]},
  { path: 'creator/list', component: ListComponent }
];
@NgModule({
 
    imports: [BrowserModule,
        ReactiveFormsModule,RouterModule.forRoot(routes)
       ],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }