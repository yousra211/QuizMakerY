import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoginService } from '../login/login.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private loginService: LoginService, private router: Router) {}

  canActivate(): boolean {
    if (this.loginService.isLoggedIn()) {
      return true;
    } else {
      // Redirection vers /login si pas connecté
      this.router.navigate(['/login']);
      return false;
    }
  }
}

/*
Un AuthGuard sert à protéger des routes Angular (comme /dashboard, /creators, etc.) pour empêcher un utilisateur non connecté d’y accéder.

🔐 Par exemple :

Sans AuthGuard : un utilisateur peut taper /dashboard dans l’URL même s’il n’est pas connecté.

Avec AuthGuard : Angular le redirige vers /login si le JWT est absent ou expiré.
*/
