import { RouterModule, Routes } from '@angular/router';
import { CreatorComponent } from './creator/creator.component';
import { ExamComponent } from './exam/exam.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { HomeComponent } from './home/home.component';
import { MakequizComponent } from './makequiz/makequiz.component';
import { FooterComponent } from './shared/footer/footer.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
export const routes: Routes = [

    { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent }, 
  { path: 'makequiz', component: MakequizComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  {path: "creator",component:CreatorComponent},
  {path: "exam",component:ExamComponent},
  {path: '**', redirectTo: 'home' } ,
  {path: 'navbar', component: NavbarComponent}, 
  {path: 'footer', component: FooterComponent},
];
@NgModule({
 
    imports: [BrowserModule,
        ReactiveFormsModule,RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }