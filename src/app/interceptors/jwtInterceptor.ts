import { HttpInterceptorFn } from '@angular/common/http';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const router = inject(Router);
  
  // ✅ EXCLURE les endpoints participants (pas d'auth requise)
  const publicEndpoints = [
    '/participants',
    '/home',
    '/auth/',  
    '/exam-participant'
  ];
  
    // ✅ VÉRIFICATION AMÉLIORÉE - méthode simple et robuste
  const isPublicEndpoint = publicEndpoints.some(endpoint => {
    return req.url.includes(endpoint);
  });
  
  console.log('🔍 JWT Interceptor Debug:');
  console.log('  - URL complète:', req.url);
  console.log('  - Method:', req.method);
  console.log('  - Is Public?', isPublicEndpoint);
  
  // ✅ SI PUBLIC, PASSER SANS TOKEN
  if (isPublicEndpoint) {
  let modifiedReq = req;

  if (!(req.body instanceof FormData)) {
    modifiedReq = req.clone({
      headers: req.headers.set('Content-Type', 'application/json')
    });
  }

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('❌ Erreur sur endpoint public:', error);
      handlePublicEndpointError(error, router);
      return throwError(() => error);
    })
  );
}

  
  // ✅ ENDPOINT PRIVÉ - VÉRIFICATION TOKEN
  console.log('🔒 Endpoint privé, vérification token...');
  const jwtToken = localStorage.getItem('jwtToken');
  
  if (!jwtToken) {
    console.log('❌ Pas de token pour endpoint privé');
    redirectToLogin(router);
    return throwError(() => new Error('Token manquant'));
  }
  
  // ✅ VÉRIFICATION EXPIRATION TOKEN
  if (!isTokenValid(jwtToken)) {
    console.log('❌ Token expiré');
    clearAuthData();
    redirectToLogin(router);
    return throwError(() => new Error('Token expiré'));
  }
  
  // ✅ AJOUT DU TOKEN À LA REQUÊTE
  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${jwtToken}`)
  });
  
  console.log('✅ Requête avec JWT pour:', req.url);
  
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('❌ Erreur HTTP détaillée:');
      console.error('  - Status:', error.status);
      console.error('  - StatusText:', error.statusText);
      console.error('  - URL:', error.url);
      console.error('  - Message:', error.message);
      
      // Gestion des erreurs d'authentification
      if (error.status === 401 || error.status === 403) {
        console.log('🚨 Erreur d\'authentification/autorisation');
        clearAuthData();
        redirectToLogin(router);
      }
      
      return throwError(() => error);
    })
  );
};

// ✅ FONCTIONS UTILITAIRES (inchangées)
function isTokenValid(token: string): boolean {
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return false;
    
    const payload = JSON.parse(atob(tokenParts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    console.log('  - Token expire à:', new Date(payload.exp * 1000));
    console.log('  - Heure actuelle:', new Date());
    console.log('  - Token valide:', payload.exp > currentTime ? 'OUI' : 'NON');
    
    return payload.exp > currentTime;
  } catch (error) {
    console.log('⚠️ Erreur décodage token:', error);
    return false;
  }
}

function clearAuthData(): void {
  localStorage.removeItem('jwtToken');
  localStorage.removeItem('creatorId');
  localStorage.removeItem('creatorName');
  localStorage.removeItem('creatorUserName');
  localStorage.removeItem('email');
  localStorage.removeItem('isAdmin');
}

function redirectToLogin(router: Router): void {
  router.navigate(['/login']);
}

function handlePublicEndpointError(error: HttpErrorResponse, router: Router): void {
  if (error.status === 403) {
    console.log('🚨 Erreur 403 sur endpoint public - vérifiez la config backend');
  }
}