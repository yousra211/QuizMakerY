import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { NavbarComponent } from './app/navbar/navbar.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './app/interceptors/jwtInterceptor';


const { providers = [], ...restAppConfig } = appConfig;

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      withInterceptors([
        jwtInterceptor
      ])
    ),
    ...providers 
  ],
  ...restAppConfig
})
.catch(err => console.error(err));
