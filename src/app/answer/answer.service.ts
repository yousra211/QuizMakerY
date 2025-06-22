import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Answer } from './answer.model';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AnswerService {
  private apiUrl = 'http://localhost:8080'; // URL de base du backend
  
  // Headers par défaut
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  // Méthode pour ajouter des réponses génériques
  addAnswers(answers: Answer[]): Observable<any> {
    const url = `${this.apiUrl}/answers`;
    console.log('Envoi vers:', url);
    console.log('Données:', answers);
    
    return this.http.post(url, answers, this.httpOptions)
      .pipe(
        timeout(30000), // Timeout de 30 secondes
        retry(2), // Réessayer 2 fois en cas d'échec
        catchError(this.handleError)
      );
  }

  // Méthode principale pour ajouter des réponses pour un participant
  addAnswersForParticipant(participantId: number, answers: Answer[]): Observable<Answer[]> {
    const url = `${this.apiUrl}/participants/${participantId}/answers`;
    
    console.log('=== ENVOI RÉPONSES PARTICIPANT ===');
    console.log('URL:', url);
    console.log('Participant ID:', participantId);
    console.log('Nombre de réponses:', answers.length);
    console.log('Données à envoyer:', answers);

    // Validation des données avant envoi
    if (!participantId || participantId <= 0) {
      return throwError(() => new Error('ID participant invalide'));
    }

    if (!answers || answers.length === 0) {
      return throwError(() => new Error('Aucune réponse à envoyer'));
    }

    // Validation de chaque réponse
    const invalidAnswers = answers.filter(answer => 
      !answer.questionId || 
      answer.text === undefined || 
      answer.text === null || 
      answer.text.trim() === ''
    );

    if (invalidAnswers.length > 0) {
      console.error('Réponses invalides détectées:', invalidAnswers);
      return throwError(() => new Error(`${invalidAnswers.length} réponse(s) invalide(s) détectée(s)`));
    }

    return this.http.post<Answer[]>(url, answers, this.httpOptions)
      .pipe(
        timeout(30000), // Timeout de 30 secondes
        retry(1), // Réessayer 1 fois
        catchError(this.handleError)
      );
  }

  // Pour récupérer les réponses d'un participant
  getParticipantAnswers(participantId: number): Observable<Answer[]> {
    const url = `${this.apiUrl}/participants/${participantId}/answers`;
    console.log('Récupération réponses depuis:', url);
    
    return this.http.get<Answer[]>(url, this.httpOptions)
      .pipe(
        timeout(15000),
        catchError(this.handleError)
      );
  }

  // Méthode pour tester la connexion au serveur
  testConnection(): Observable<any> {
    const url = `${this.apiUrl}/test`; // Endpoint de test simple
    return this.http.get(url, this.httpOptions)
      .pipe(
        timeout(5000),
        catchError(this.handleError)
      );
  }

  // Gestion centralisée des erreurs
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('=== ERREUR HTTP DÉTAILLÉE ===');
    console.error('Type d\'erreur:', error.constructor.name);
    console.error('Status:', error.status);
    console.error('Status Text:', error.statusText);
    console.error('URL:', error.url);
    console.error('Message:', error.message);
    console.error('Headers:', error.headers);
    console.error('Error body:', error.error);
    // Pas de stack trace pour HttpErrorResponse

    let errorMessage = 'Erreur inconnue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur client: ${error.error.message}`;
      console.error('Erreur côté client:', error.error.message);
    } else {
      // Erreur côté serveur
      switch (error.status) {
        case 0:
          errorMessage = 'Impossible de contacter le serveur. Vérifiez que le backend est démarré sur http://localhost:8080';
          break;
        case 400:
          errorMessage = `Données invalides: ${error.error?.message || 'Format incorrect'}`;
          break;
        case 401:
          errorMessage = 'Non autorisé - Session expirée';
          break;
        case 403:
          errorMessage = 'Accès interdit';
          break;
        case 404:
          errorMessage = `Endpoint non trouvé: ${error.url}`;
          break;
        case 405:
          errorMessage = 'Méthode HTTP non autorisée';
          break;
        case 409:
          errorMessage = 'Conflit - Données déjà existantes';
          break;
        case 422:
          errorMessage = `Données non valides: ${error.error?.message || 'Validation échouée'}`;
          break;
        case 500:
          errorMessage = 'Erreur interne du serveur';
          break;
        case 502:
          errorMessage = 'Serveur indisponible (Bad Gateway)';
          break;
        case 503:
          errorMessage = 'Service temporairement indisponible';
          break;
        case 504:
          errorMessage = 'Timeout du serveur';
          break;
        default:
          errorMessage = `Erreur HTTP ${error.status}: ${error.statusText}`;
      }
    }

    console.error('Message d\'erreur final:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}