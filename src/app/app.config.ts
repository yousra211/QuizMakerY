import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

export const appConfig: ApplicationConfig = {
  providers: [importProvidersFrom(NgbModalModule),provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(), provideHttpClient(withFetch())]
};
