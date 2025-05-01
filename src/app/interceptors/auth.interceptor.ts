import { HttpInterceptorFn } from '@angular/common/http';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const router = inject(Router);
  const authToken = localStorage.getItem('basicAuth');

  // Si nous avons un token d'authentification, l'ajouter à la requête
  if (authToken) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Basic ${authToken}`)
    });
    
    console.log('Requête avec authentification:', req.url);
    
    // Intercepter les erreurs de la réponse
    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si nous recevons une erreur 401 (Non autorisé), rediriger vers la page de connexion
        if (error.status === 401) {
          console.log('Session expirée ou non autorisée. Redirection vers la page de connexion...');
          
          // Nettoyer le localStorage
          localStorage.removeItem('basicAuth');
          localStorage.removeItem('creatorId');
          localStorage.removeItem('creatorFullName');
          localStorage.removeItem('creatorUserName');
          localStorage.removeItem('creatorEmail');
          localStorage.removeItem('creatorPhoto');
          
          // Rediriger vers la page de connexion
          router.navigate(['/login']);
        }
        
        // Propager l'erreur
        return throwError(() => error);
      })
    );
  }

  console.log('Requête sans authentification:', req.url);
  
  // Si pas de token, laisser passer la requête telle quelle
  return next(req);
};