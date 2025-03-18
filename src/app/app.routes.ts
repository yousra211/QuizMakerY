import { RouterModule, Routes } from '@angular/router';
import { CreatorComponent } from './creator/creator.component';
import { ExamComponent } from './exam/exam.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { HomeComponent } from './home/home.component';
import { MakequizComponent } from './makequiz/makequiz.component';
export const routes: Routes = [
    {path: "creator",component:CreatorComponent},
    {path: "exam",component:ExamComponent},
    { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent }, 
  { path: 'makequiz', component: MakequizComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent }

];
@NgModule({
   
    imports: [BrowserModule,
        ReactiveFormsModule,RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }