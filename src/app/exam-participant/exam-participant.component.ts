
import { Component, OnInit, OnDestroy, signal, PLATFORM_ID, Inject, EventEmitter, Output, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ExamService } from '../exam/exam.service';
import { AnswerService } from '../answer/answer.service';
import { Exam } from '../exam/exam.model';
import { Answer, getQuestionId } from '../answer/answer.model';
import { Question, QuestionOption } from '../question/question.model';
import { lastValueFrom, Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ParticipantService } from '../participant/participant.service';
import { CommonModule, isPlatformBrowser, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProctoringService } from './proctoring.service';

@Component({
  selector: 'app-exam-participant',
  standalone: true,
imports: [CommonModule , NgIf,FormsModule],
  templateUrl: './exam-participant.component.html',
  styleUrl: './exam-participant.component.css'
})
export class ExamParticipantComponent implements OnInit, OnDestroy {
    @Input() examStarted = false;
  @Input() autoStartOnExam = true;
  @Output() examViolation = new EventEmitter<void>();

  tabSwitchCount = 0;
  maxTabSwitches = 2; // Set maximum allowed tab switches
  trigger$ = new Subject<void>();
  isRecording = false;

  initializationError: string | null = null;
  showWarning = false;
  warningMessage = '';

  // Signals pour l'état du composant
  loading = signal(false);
  error = signal<string | null>(null);
  exam = signal<any>(null);
  questions: any[] = [];
  questionsCount = 0;
  finalScore: number = 0;
  

  timeLeft = signal<string>('00:00');
  remainingSeconds = 0;
  private timerInterval: any;
  private examDuration = 0; 
  
  // Stockage des réponses du participant
  private participantAnswers: Map<number, any> = new Map();
  private participantId: number | null = null;
  String: any;

  
  private examId: number = 0;
  private token: string = '';
  private hasBeenViolated = false;

  constructor(
    private route: ActivatedRoute,
    private modalService: NgbModal ,
    private router: Router,
    private examService: ExamService,
    private answerService: AnswerService,
    private participantService: ParticipantService,
    private proctoring: ProctoringService,
      @Inject(PLATFORM_ID) private platformId: Object
  ) {}




  ngOnInit() {
  
        // NOUVEAU : Récupérer examId et token de l'URL
    this.examId = +this.route.snapshot.params['examId'];
    this.token = this.route.snapshot.params['token'];
    
    console.log('Exam ID:', this.examId, 'Token:', this.token);
    
    // Vérifier si les paramètres sont présents
    if (!this.examId || !this.token) {
      console.error('Paramètres manquants dans l\'URL');
      this.error.set('Lien d\'examen invalide');
      return;
    }
    // Récupération de l'ID du participant
    const storedId = this.isBrowser() ? localStorage.getItem('currentParticipantId'): null;
    if (storedId) {
      this.participantId = parseInt(storedId, 10);
    } else {
      console.error('Aucun ID participant trouvé dans le localStorage');
     this.router.navigate(['/exam', this.examId, this.token]);
      return;
    }
    
        this.loadExam();
 this.proctoring.examViolated.subscribe(() => {
  if (!this.hasBeenViolated) {
    this.hasBeenViolated = true;
    this.invalidateExam();
  }
});

        // Start monitoring
    this.proctoring.startClipboardMonitoring();
      this.proctoring.startProctoring();
  }

private isBrowser(): boolean {
  return isPlatformBrowser(this.platformId);
}

invalidateExam(): void {
  if (this.timerInterval) clearInterval(this.timerInterval);

  this.participantAnswers.clear();
  this.error.set('Exam invalidated due to tab switching.');

  setTimeout(() => {
    alert('⚠️ Tab switching is not allowed. Your exam has been invalidated.');
    this.router.navigate(['/participant']);
  }, 100); 
  this.proctoring.stopProctoring();

}

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
     this.proctoring.stopProctoring() ;
  }

  private loadExam() {
    this.loading.set(true);
    this.error.set(null);
    
   

    this.examService.getExamWithQuestions(this.examId).subscribe({
      next: (exam: Exam) => {
        console.log('Exam reçu:', exam);
        this.exam.set(exam);
        this.questions = exam.questions || [];
   
        // Initialisation du timer
        this.examDuration = exam.duration * 60;
        this.remainingSeconds = this.examDuration;
        this.updateTimeDisplay();
        this.startTimer();
        
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'examen:', err);
        this.error.set('Erreur lors du chargement de l\'examen');
        this.loading.set(false);
      }
    });
  }

  private startTimer() {
    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      this.updateTimeDisplay();
      
      if (this.remainingSeconds <= 0) {
        clearInterval(this.timerInterval);
        this.submitExam();
      }
    }, 1000);
  }

  private updateTimeDisplay() {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;
    this.timeLeft.set(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  }

  // Méthode corrigée pour obtenir les options (SANS LOGS RÉPÉTITIFS)
  getQuestionOptions(question: Question): QuestionOption[] {
    if (!question.options || question.type === 'directe') {
      return [];
    }

    try {
      let parsed;
      
      if (Array.isArray(question.options)) {
        parsed = question.options;
      } else if (typeof question.options === 'string') {
        if (!question.options.startsWith('[') && !question.options.startsWith('{')) {
          return [{ text: question.options, isCorrect: false }];
        }
        parsed = JSON.parse(question.options);
      } else {
        return [];
      }
      
      if (Array.isArray(parsed)) {
        return parsed.map(option => ({ 
          text: option.text || option, 
          isCorrect: false // Pour l'affichage seulement
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Erreur parsing options pour question', question.id, ':', error);
      return [];
    }
  }

  // Méthode corrigée pour obtenir les options originales avec isCorrect
  private getOriginalOptions(question: Question): QuestionOption[] {
    if (!question.options || question.type === 'directe') {
      return [];
    }
    
    try {
      let parsed;
      
      if (Array.isArray(question.options)) {
        parsed = question.options;
      } else if (typeof question.options === 'string') {
        parsed = JSON.parse(question.options);
      } else {
        return [];
      }
      
      if (Array.isArray(parsed)) {
        return parsed.map(option => ({
          text: option.text || option,
          isCorrect: Boolean(option.isCorrect)
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Erreur parsing options originales pour question', question.id, ':', error);
      return [];
    }
  }
  /**
   * Gère la sélection/désélection des options pour les questions QCM
   */
  onOptionChange(questionId: number, optionText: string, event: any) {
    const isChecked = event.target.checked;
    
    if (!this.participantAnswers.has(questionId)) {
      this.participantAnswers.set(questionId, {
        questionId: questionId,
        type: 'QCM',
        selectedOptions: []
      });
    }

    const questionAnswer = this.participantAnswers.get(questionId);
    
    if (isChecked) {
      if (!questionAnswer.selectedOptions.includes(optionText)) {
        questionAnswer.selectedOptions.push(optionText);
      }
    } else {
      const index = questionAnswer.selectedOptions.indexOf(optionText);
      if (index > -1) {
        questionAnswer.selectedOptions.splice(index, 1);
      }
    }
  }

  /**
   * Gère la saisie des réponses pour les questions directes
   */
  onDirectAnswerChange(questionId: number, event: any) {
    const answerText = event.target.value;
    
    this.participantAnswers.set(questionId, {
      questionId: questionId,
      type: 'directe',
      answerText: answerText
    });
  }
fullDiagnostic() {
  console.log('\n🔍 =================== DIAGNOSTIC COMPLET ===================');
  
  console.log('\n📋 1. ÉTAT DES QUESTIONS CHARGÉES:');
  console.log('Nombre de questions:', this.questions.length);
  this.questions.forEach((q, i) => {
    console.log(`Q${i+1} (ID:${q.id}): ${q.type} | Grade:${q.grade} | Response:`, q.response);
  });
  
  console.log('\n📝 2. RÉPONSES DU PARTICIPANT:');
  if (this.participantAnswers.size === 0) {
    console.log('❌ AUCUNE RÉPONSE STOCKÉE !');
    return;
  }
  
  Array.from(this.participantAnswers.entries()).forEach(([qId, answer]) => {
    console.log(`Q${qId}:`, answer);
  });
  
  console.log('\n🧮 3. SIMULATION DU CALCUL DE SCORE:');
  this.simulateScoreCalculation();
}

simulateScoreCalculation() {
  const simulatedAnswers: Answer[] = [];
  let simulatedScore = 0;
  
  console.log('\n--- Création des réponses simulées ---');
  
  this.participantAnswers.forEach((answerData, questionId) => {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) {
      console.log(`❌ Question ${questionId} non trouvée`);
      return;
    }
    
    console.log(`\n📌 Question ${questionId} (${question.type}, ${question.grade}pts):`);
    console.log('Response DB:', question.response);
    
    if (answerData.type === 'QCM' && answerData.selectedOptions?.length > 0) {
      console.log('Options sélectionnées:', answerData.selectedOptions);
      
      answerData.selectedOptions.forEach((optionText: string) => {
        const isCorrect = this.testIsQcmOptionCorrect(question, optionText);
        console.log(`  "${optionText}" -> ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
        
        simulatedAnswers.push({
          text: optionText,
          isCorrect: isCorrect,
          questionId: questionId,
          toleranceRate: question.toleranceRate || 0
        } as Answer);
      });
      
    } else if (answerData.type === 'directe' && answerData.answerText?.trim()) {
      const participantAnswer = answerData.answerText.trim();
      const correctAnswer = question.response;
      
      console.log(`Réponse: "${participantAnswer}" vs "${correctAnswer}"`);
      
      const isCorrect = this.checkDirectAnswer(participantAnswer, correctAnswer, question.toleranceRate || 0);
      console.log(`  -> ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
      
      simulatedAnswers.push({
        text: participantAnswer,
        isCorrect: isCorrect,
        questionId: questionId,
        toleranceRate: question.toleranceRate || 0
      } as Answer);
    }
  });
  
  console.log('\n--- Calcul du score simulé ---');
  simulatedScore = this.calculateScoreFromAnswers(simulatedAnswers);
  console.log(`🎯 SCORE SIMULÉ: ${simulatedScore}`);
  
  return simulatedScore;
}
testIsQcmOptionCorrect(question: Question, optionText: string): boolean {
  console.log(`    🔍 Test option "${optionText}" pour Q${question.id}:`);
  
  if (!question.response) {
    console.log('    ❌ Pas de response dans la question');
    return false;
  }
  
  console.log(`    📄 Response brute: "${question.response}"`);
  console.log(`    📄 Type de response: ${typeof question.response}`);
  
  let correctAnswers: string[] = [];
  
  try {
    if (typeof question.response === 'string') {
      if (question.response.startsWith('[')) {
        // JSON array
        correctAnswers = JSON.parse(question.response);
        console.log('    📋 Parsed as JSON array:', correctAnswers);
      } else {
        // Simple string
        correctAnswers = [question.response];
        console.log('    📋 Treated as simple string:', correctAnswers);
      }
    } else if (Array.isArray(question.response)) {
      correctAnswers = question.response;
      console.log('    📋 Already an array:', correctAnswers);
    }
  } catch (error) {
    console.log('    ❌ Erreur parsing:', error);
    correctAnswers = [question.response as string];
  }
  
  const normalizedOption = optionText.trim().toLowerCase();
  const isCorrect = correctAnswers.some(answer => 
    answer.toString().trim().toLowerCase() === normalizedOption
  );
  
  console.log(`    🎯 "${normalizedOption}" in [${correctAnswers.map(a => a.toString().toLowerCase()).join(', ')}] = ${isCorrect}`);
  
  return isCorrect;
}
calculateScoreFromAnswers(answers: Answer[]): number {
  let totalScore = 0;
  
  // Grouper par question
  const grouped = new Map<number, Answer[]>();
  answers.forEach(answer => {
    if (!grouped.has(answer.questionId)) {
      grouped.set(answer.questionId, []);
    }
    grouped.get(answer.questionId)!.push(answer);
  });
  
  grouped.forEach((qAnswers, questionId) => {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) return;
    
    const grade = question.grade || 0;
    console.log(`\n🧮 Calcul pour Q${questionId} (${grade}pts):`);
    
    if (question.type === 'directe') {
      const answer = qAnswers[0];
      if (answer.isCorrect === true) {
        totalScore += grade;
        console.log(`  ✅ +${grade}pts (directe correcte)`);
      } else {
        console.log(`  ❌ 0pt (directe incorrecte/manuelle)`);
      }
      
    } else if (question.type === 'QCM') {
      // Obtenir les bonnes réponses attendues
      let expectedAnswers: string[] = [];
      try {
        if (typeof question.response === 'string' && question.response.startsWith('[')) {
          expectedAnswers = JSON.parse(question.response);
        } else {
          expectedAnswers = [question.response as string];
        }
      } catch {
        expectedAnswers = [question.response as string];
      }
      
      const selectedAnswers = qAnswers.map(a => a.text.trim());
      const expectedNormalized = expectedAnswers.map(a => a.toString().trim().toLowerCase()).sort();
      const selectedNormalized = selectedAnswers.map(a => a.trim().toLowerCase()).sort();
      
      console.log(`  📋 Attendues: [${expectedNormalized.join(', ')}]`);
      console.log(`  📝 Sélectionnées: [${selectedNormalized.join(', ')}]`);
      
      const isComplete = expectedNormalized.length === selectedNormalized.length &&
                        expectedNormalized.every((expected, i) => expected === selectedNormalized[i]);
      
      if (isComplete) {
        totalScore += grade;
        console.log(`  ✅ +${grade}pts (QCM complet et correct)`);
      } else {
        console.log(`  ❌ 0pt (QCM incomplet/incorrect)`);
      }
    }
  });
  
  return totalScore;
}
testSpecificQuestion(questionId: number) {
  console.log(`\n🔬 TEST SPÉCIFIQUE - Question ${questionId}`);
  
  const question = this.questions.find(q => q.id === questionId);
  if (!question) {
    console.log('❌ Question non trouvée');
    return;
  }
  
  console.log('📋 Question:', {
    id: question.id,
    type: question.type,
    grade: question.grade,
    response: question.response,
    text: question.text.substring(0, 50) + '...'
  });
  
  const participantAnswer = this.participantAnswers.get(questionId);
  if (!participantAnswer) {
    console.log('❌ Aucune réponse participant pour cette question');
    return;
  }
  
  console.log('📝 Réponse participant:', participantAnswer);
  
  if (question.type === 'QCM' && participantAnswer.selectedOptions) {
    participantAnswer.selectedOptions.forEach((option: string) => {
      console.log(`\n🧪 Test option: "${option}"`);
      const isCorrect = this.testIsQcmOptionCorrect(question, option);
      console.log(`Résultat: ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
    });
  }
}
preSubmitCheck() {
  console.log('\n🚦 VÉRIFICATION PRÉ-SOUMISSION');
  
  if (!this.participantId) {
    console.log('❌ participantId manquant:', this.participantId);
    return false;
  }
  
  if (this.participantAnswers.size === 0) {
    console.log('❌ Aucune réponse stockée');
    return false;
  }
  
  console.log('✅ participantId:', this.participantId);
  console.log('✅ Nombre de réponses:', this.participantAnswers.size);
  
  return true;
}

// 1. VÉRIFICATION FRONTEND - Ajoutez ces logs dans votre fonction
// Ajoutez ces logs dans votre fonction calculateTotalScore pour debug

calculateTotalScore(savedAnswers: Answer[]): number {
  let totalScore = 0;
  
  console.log('\n🏆 =================== CALCUL SCORE FRONTEND ===================');
  console.log('Nombre de réponses à traiter:', savedAnswers.length);
  
  // 🔍 DEBUG COMPLET : Voir EXACTEMENT ce que renvoie le backend
  console.log('\n🔍 STRUCTURE COMPLÈTE DES RÉPONSES:');
  savedAnswers.forEach((answer, index) => {
    console.log(`\n=== Answer ${index} ===`);
    console.log('Objet complet:', answer);
    console.log('Type:', typeof answer);
    console.log('Keys disponibles:', Object.keys(answer));
    console.log('JSON stringify:', JSON.stringify(answer, null, 2));
    
    // Tester toutes les propriétés possibles
    console.log('Tests de propriétés:');
    console.log('  - answer.questionId:', answer.questionId);
    console.log('  - answer.question:', answer.question);
    console.log('  - answer.question?.id:', answer.question?.id);
    console.log('  - answer["questionId"]:', answer["questionId"]);
    
    console.log('  - answer.id:', answer.id);
    console.log('  - answer.text:', answer.text);
    console.log('  - answer.isCorrect:', answer.isCorrect);
  });
  
  // Grouper par questionId avec toutes les approches possibles
  const groupedAnswers = new Map<number, Answer[]>();
  
  savedAnswers.forEach((answer, index) => {
    let questionId: number | null = null;
    
    // Essayer TOUTES les approches possibles
    if (answer.questionId) {
      questionId = Number(answer.questionId);
      console.log(`✅ Méthode 1 (answer.questionId): ${questionId}`);
    } else if (answer.question?.id) {
      questionId = Number(answer.question.id);
      console.log(`✅ Méthode 2 (answer.question.id): ${questionId}`);
    } else if (answer['questionId']) {
      questionId = Number(answer['questionId']);
      console.log(`✅ Méthode 3 (answer['questionId']): ${questionId}`);
    
    } else {
      // Dernière tentative : chercher dans toutes les propriétés
      console.log(`🔍 Recherche dans toutes les propriétés pour answer ${index}:`);
      for (const [key, value] of Object.entries(answer)) {
        console.log(`  ${key}: ${value} (type: ${typeof value})`);
        if (key.toLowerCase().includes('question') && typeof value === 'number') {
          questionId = value;
          console.log(`✅ Trouvé via ${key}: ${questionId}`);
          break;
        }
        if (typeof value === 'object' && value !== null) {
          console.log(`    Objet ${key}:`, value);
          if ('id' in value) {
            questionId = Number(value.id);
            console.log(`✅ Trouvé via ${key}.id: ${questionId}`);
            break;
          }
        }
      }
    }
    
    console.log(`Answer ${index} -> questionId final: ${questionId}`);
    
    if (questionId && !isNaN(questionId)) {
      if (!groupedAnswers.has(questionId)) {
        groupedAnswers.set(questionId, []);
      }
      groupedAnswers.get(questionId)!.push(answer);
    } else {
      console.error(`❌ IMPOSSIBLE de trouver questionId pour answer ${index}`);
      console.error('   Structure complète:', JSON.stringify(answer, null, 2));
    }
  });
  
  console.log('\n📊 GROUPES CRÉÉS:');
  console.log('Nombre de groupes:', groupedAnswers.size);
  groupedAnswers.forEach((answers, questionId) => {
    console.log(`Question ${questionId}: ${answers.length} réponses`);
  });
  
  // Si aucun groupe n'est créé, on ne peut pas calculer le score
  if (groupedAnswers.size === 0) {
    console.error('❌ AUCUN GROUPE CRÉÉ - IMPOSSIBLE DE CALCULER LE SCORE');
    console.error('🔧 Le backend ne renvoie pas les questionId correctement');
    return 0;
  }
  
  // Calculer le score pour chaque question
  groupedAnswers.forEach((answers, questionId) => {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) {
      console.log(`❌ Question ${questionId} non trouvée dans this.questions`);
      return;
    }

    const grade = question.grade || 0;
    console.log(`\n📋 Question ${questionId} (${grade} pts max) - Type: ${question.type}`);

    if (question.type === 'directe') {
      const answer = answers[0];
      if (answer.isCorrect === true) {
        totalScore += grade;
        console.log(`✅ +${grade} pts (directe correcte)`);
      } else if (answer.isCorrect === null) {
        console.log(`⏳ 0 pt (directe à corriger manuellement)`);
      } else {
        console.log(`❌ 0 pt (directe incorrecte)`);
      }
    } else if (question.type === 'QCM') {
      const selectedAnswers = answers.map(a => a.text.trim());
      console.log(`  Options sélectionnées: [${selectedAnswers.join(', ')}]`);
      
      const questionScore = this.calculateQCMScore(question, selectedAnswers);
      totalScore += questionScore;
      console.log(`🎯 Score pour cette question: +${questionScore} pts`);
    }
    
    console.log(`📊 Score total actuel: ${totalScore} pts`);
  });

  console.log('\n🎯 SCORE FINAL:', totalScore);
  return totalScore;
}

async submitExam() {
  console.log('\n🚀 =================== DÉBUT SUBMIT EXAM ===================');

  // DIAGNOSTIC COMPLET
  if (!this.preSubmitCheck()) {
    alert('Erreur de validation pré-soumission - voir console');
    return;
  }

  this.fullDiagnostic();

  if (!this.participantId) {
    alert('Participant non identifié');
    return;
  }

  const answersToSend: Answer[] = [];

  // ... votre code existant pour préparer answersToSend ...
  console.log('=== DÉBUT SOUMISSION EXAMEN ===');
  console.log('Réponses participant:', Array.from(this.participantAnswers.entries()));

  this.participantAnswers.forEach((answerData, questionId) => {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) {
      console.log(`Question ${questionId} non trouvée`);
      return;
    }

    console.log(`\n--- Question ${questionId} (${question.type}) ---`);

    // === TRAITEMENT QCM ===
    if (answerData.type === 'QCM' && answerData.selectedOptions && answerData.selectedOptions.length > 0) {
      console.log('Options sélectionnées:', answerData.selectedOptions);

      answerData.selectedOptions.forEach((optionText: string) => {
        const isCorrect = this.isQcmOptionCorrect(question, optionText);

        const answer = {
          text: optionText,
          isCorrect: isCorrect,
          questionId: questionId,
          toleranceRate: question.toleranceRate || 0
        };

        console.log(`Option "${optionText}" -> ${isCorrect ? 'CORRECTE' : 'INCORRECTE'}`);
        answersToSend.push(answer);
      });
    } 
    // === TRAITEMENT QUESTION DIRECTE ===
    else if (answerData.type === 'directe' && answerData.answerText && answerData.answerText.trim() !== '') {
      const participantAnswer = answerData.answerText.trim();
      const correctAnswer = question.response;
      const toleranceRate = question.toleranceRate || 0;

      let isCorrect: boolean | null = null;

      if (correctAnswer) {
        isCorrect = this.checkDirectAnswer(participantAnswer, correctAnswer, toleranceRate);
        console.log(`Réponse directe: "${participantAnswer}" -> ${isCorrect ? 'CORRECTE' : 'INCORRECTE'}`);
      } else {
        console.log('Réponse directe nécessite correction manuelle');
        isCorrect = null;
      }

      const answer = {
        text: participantAnswer,
        isCorrect: isCorrect,
        questionId: questionId,
        toleranceRate: toleranceRate
      };

      answersToSend.push(answer);
    }
  });

  console.log('\nRéponses à envoyer:', answersToSend.length);

  if (answersToSend.length === 0) {
    alert('Aucune réponse à enregistrer');
    return;
  }

  try {
    // VALIDATION DES DONNÉES avant envoi
    const validAnswers = answersToSend.filter(answer => 
      answer.text && 
      answer.questionId && 
      answer.isCorrect !== undefined
    );

    if (validAnswers.length !== answersToSend.length) {
      console.warn('Certaines réponses ont été filtrées car invalides');
      console.log('Réponses valides:', validAnswers.length, '/', answersToSend.length);
    }

    console.log('Données à envoyer au serveur:', {
      participantId: this.participantId,
      answers: validAnswers
    });

    // 🆕 SAUVEGARDER LES RÉPONSES (sans calcul de score backend)
    const savedAnswers = await lastValueFrom(
      this.answerService.addAnswersForParticipant(this.participantId, validAnswers)
    );

    console.log('Réponses sauvegardées:', savedAnswers);

    // 🎯 CALCULER LE SCORE CÔTÉ FRONTEND avec votre logique existante
    console.log('\n🏆 =================== CALCUL SCORE FRONTEND ===================');
    const frontendScore = this.calculateTotalScore(savedAnswers);
    
    // 🆕 METTRE À JOUR LE SCORE DANS LE BACKEND
    await lastValueFrom(
      this.participantService.updateParticipantScore(this.participantId, frontendScore)
    );

    console.log(`Score total (frontend): ${frontendScore}`);

    // 🎯 AFFICHER LE SCORE CORRECT
this.showScoreModal(frontendScore);
    // Arrêter le timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

  } catch (error) {
    console.error('Erreur soumission complète:', error);
    
  }
}
showScoreModal(score: number) {
  this.finalScore = score;
  
  const modalElement = document.getElementById('scoreResultModal');
  if (modalElement) {
    modalElement.classList.add('show');
    modalElement.style.display = 'block';
    modalElement.setAttribute('aria-hidden', 'false');
    
    // Ajouter backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show';
    backdrop.id = 'scoreModalBackdrop';
    document.body.appendChild(backdrop);
    
    document.body.classList.add('modal-open');
  }
}

closeScoreModal() {
  const modalElement = document.getElementById('scoreResultModal');
  const backdrop = document.getElementById('scoreModalBackdrop');
  
  if (modalElement) {
    modalElement.classList.remove('show');
    modalElement.style.display = 'none';
    modalElement.setAttribute('aria-hidden', 'true');
  }
  
  if (backdrop) {
    backdrop.remove();
  }
  
  document.body.classList.remove('modal-open');
}

  // Vérification des réponses directes avec tolérance
  private checkDirectAnswer(participantAnswer: string, correctAnswer: string, toleranceRate: number = 0): boolean {
    if (!correctAnswer || !participantAnswer) return false;
    
    const participant = participantAnswer.trim().toLowerCase();
    const correct = correctAnswer.trim().toLowerCase();
    
    // Comparaison exacte
    if (participant === correct) return true;
    
    // Avec tolérance si définie
    if (toleranceRate > 0) {
      const similarity = this.calculateSimilarity(participant, correct);
      return similarity >= (100 - toleranceRate);
    }
    
    return false;
  }

  // Calcul de similarité (algorithme de Levenshtein)
  private calculateSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    
    if (len1 === 0) return len2 === 0 ? 100 : 0;
    if (len2 === 0) return 0;
    
    const matrix = [];
    
    for (let i = 0; i <= len1; i++) matrix[i] = [i];
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i-1] === str2[j-1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i-1][j] + 1,
          matrix[i][j-1] + 1,
          matrix[i-1][j-1] + cost
        );
      }
    }
    
    const distance = matrix[len1][len2];
    const maxLength = Math.max(len1, len2);
    return Math.max(0, 100 - (distance * 100 / maxLength));
  }

  /* Retourne à la page précédente */
  goBack() {
    this.router.navigate(['/participant']);
  }

  // Méthodes de debug (à utiliser manuellement si nécessaire)
  debugAnswers() {
    console.log('=== RÉPONSES STOCKÉES ===');
    Array.from(this.participantAnswers.entries()).forEach(([questionId, answer]) => {
      console.log(`Question ${questionId}:`, answer);
    });
  }

  debugQuestions() {
    console.log('=== QUESTIONS DÉTAILLÉES ===');
    this.questions.forEach((question, index) => {
      console.log(`\nQuestion ${index + 1} (ID: ${question.id}):`);
      console.log('Text:', question.text);
      console.log('Type:', question.type);
      console.log('Grade:', question.grade);
      console.log('Options (raw):', question.options);
      
      if (question.type === 'QCM') {
        const parsedOptions = this.getOriginalOptions(question);
        console.log('Options parsées:', parsedOptions);
        
        const correctOptions = parsedOptions.filter(opt => opt.isCorrect === true);
        console.log('Options correctes:', correctOptions);
      }
    });
  }




  // Remplacez vos méthodes par ces versions corrigées :

/**
 * NOUVELLE MÉTHODE : Obtenir les bonnes réponses depuis question.response
 */
private getCorrectAnswersFromResponse(question: Question): string[] {
  if (!question.response) {
    return [];
  }

  try {
    // Si c'est un simple string
    if (typeof question.response === 'string' && !question.response.startsWith('[')) {
      return [question.response.trim()];
    }
    
    // Si c'est un JSON array
    const parsed = JSON.parse(question.response);
    if (Array.isArray(parsed)) {
      return parsed.map(item => item.trim());
    }
    
    return [question.response.trim()];
  } catch (error) {
    console.error('Erreur parsing response pour question', question.id, ':', error);
    return [question.response.trim()];
  }
}

/**
 * MÉTHODE CORRIGÉE : Vérifier si une option QCM est correcte
 * Utilise question.response au lieu de question.options
 */
private isQcmOptionCorrect(question: Question, optionText: string): boolean {
  if (!question.response || question.type !== 'QCM') {
    return false;
  }
  
  const correctAnswers = this.getCorrectAnswersFromResponse(question);
  const normalizedOptionText = optionText.trim().toLowerCase();
  
  const isCorrect = correctAnswers.some(correctAnswer => 
    correctAnswer.toLowerCase() === normalizedOptionText
  );
  
  console.log(`Vérification option "${optionText}":`, {
    correctAnswers: correctAnswers,
    isCorrect: isCorrect
  });
  
  return isCorrect;
}


/**
 * Méthode utilitaire pour comparer deux tableaux
 */
private arraysEqual(arr1: string[], arr2: string[]): boolean {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((item, index) => item === arr2[index]);
}

/**
 * MÉTHODE DE DEBUG AMÉLIORÉE
 */
debugQuestionsAndAnswers() {
  console.log('=== DEBUG QUESTIONS ET RÉPONSES ===');
  
  this.questions.forEach((question, index) => {
    console.log(`\n--- Question ${index + 1} (ID: ${question.id}) ---`);
    console.log('Texte:', question.text);
    console.log('Type:', question.type);
    console.log('Grade:', question.grade);
    console.log('Options (raw):', question.options);
    console.log('Response (raw):', question.response);
    
    if (question.type === 'QCM') {
      const correctAnswers = this.getCorrectAnswersFromResponse(question);
      console.log('Bonnes réponses parsées:', correctAnswers);
      
      const displayOptions = this.getQuestionOptions(question);
      console.log('Options pour affichage:', displayOptions);
    }
    
    // Vérifier les réponses du participant pour cette question
    const participantAnswer = this.participantAnswers.get(question.id);
    if (participantAnswer) {
      console.log('Réponse participant:', participantAnswer);
      
      if (question.type === 'QCM' && participantAnswer.selectedOptions) {
        participantAnswer.selectedOptions.forEach((option: string) => {
          const isCorrect = this.isQcmOptionCorrect(question, option);
          console.log(`  "${option}" -> ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);
        });
      }
    } else {
      console.log('Aucune réponse participant');
    }
  });
}

/**
 * MÉTHODE DE TEST RAPIDE (à appeler manuellement)
 */
testSingleQuestion(questionId: number) {
  const question = this.questions.find(q => q.id === questionId);
  if (!question) {
    console.error(`Question ${questionId} non trouvée`);
    return;
  }
  
  console.log(`=== TEST QUESTION ${questionId} ===`);
  console.log('Question:', question);
  console.log('Response DB:', question.response);
  
  if (question.type === 'QCM') {
    const correctAnswers = this.getCorrectAnswersFromResponse(question);
    console.log('Bonnes réponses:', correctAnswers);
    
    const participantAnswer = this.participantAnswers.get(questionId);
    if (participantAnswer && participantAnswer.selectedOptions) {
      console.log('Réponses participant:', participantAnswer.selectedOptions);
      
      participantAnswer.selectedOptions.forEach((option: string) => {
        const isCorrect = this.isQcmOptionCorrect(question, option);
        console.log(`"${option}" -> ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);
      });
    }
  }
}



// Ajoutez aussi cette méthode de debug améliorée pour diagnostiquer le problème :

debugScoreCalculation() {
  console.log('\n🔍 =================== DEBUG CALCUL SCORE ===================');
  
  if (this.participantAnswers.size === 0) {
    console.log('❌ Aucune réponse participant');
    return;
  }
  
  // Simuler la création des Answer objects comme dans submitExam
  const simulatedAnswers: Answer[] = [];
  
  this.participantAnswers.forEach((answerData, questionId) => {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) return;
    
    console.log(`\n📌 Traitement Question ${questionId}:`);
    console.log(`Type: ${question.type}, Grade: ${question.grade}`);
    console.log(`Response DB: ${question.response}`);
    console.log(`Réponse participant:`, answerData);
    
    if (answerData.type === 'QCM' && answerData.selectedOptions?.length > 0) {
      answerData.selectedOptions.forEach((optionText: string) => {
        const isCorrect = this.isQcmOptionCorrect(question, optionText);
        console.log(`  Option "${optionText}" -> ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);
        
        simulatedAnswers.push({
          text: optionText,
          isCorrect: isCorrect,
          questionId: questionId,
          toleranceRate: question.toleranceRate || 0
        } as Answer);
      });
    } else if (answerData.type === 'directe' && answerData.answerText?.trim()) {
      const participantAnswer = answerData.answerText.trim();
      const correctAnswer = question.response;
      
      let isCorrect: boolean | null = null;
      if (correctAnswer) {
        isCorrect = this.checkDirectAnswer(participantAnswer, correctAnswer, question.toleranceRate || 0);
      }
      
      console.log(`  Réponse directe "${participantAnswer}" -> ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);
      
      simulatedAnswers.push({
        text: participantAnswer,
        isCorrect: isCorrect,
        questionId: questionId,
        toleranceRate: question.toleranceRate || 0
      } as Answer);
    }
  });
  
  console.log('\n📊 Simulation complète:');
  console.log('Answers simulées:', simulatedAnswers);
  
  const simulatedScore = this.calculateTotalScore(simulatedAnswers);
  console.log(`🎯 Score simulé: ${simulatedScore}`);
  
  return simulatedScore;
}

// Méthode utilitaire pour tester une question spécifique
testQuestionScoring(questionId: number) {
  console.log(`\n🧪 TEST SCORING Question ${questionId}`);
  
  const question = this.questions.find(q => q.id === questionId);
  if (!question) {
    console.log('❌ Question non trouvée');
    return;
  }
  
  const participantAnswer = this.participantAnswers.get(questionId);
  if (!participantAnswer) {
    console.log('❌ Aucune réponse participant');
    return;
  }
  
  console.log('Question:', {
    id: question.id,
    type: question.type,
    grade: question.grade,
    response: question.response
  });
  
  console.log('Réponse participant:', participantAnswer);
  
  if (question.type === 'QCM') {
    const correctAnswers = this.getCorrectAnswersFromResponse(question);
    console.log('Bonnes réponses:', correctAnswers);
    
    if (participantAnswer.selectedOptions) {
      console.log('Options sélectionnées:', participantAnswer.selectedOptions);
      
      // Vérifier chaque option
      participantAnswer.selectedOptions.forEach((option: string) => {
        const isCorrect = this.isQcmOptionCorrect(question, option);
        console.log(`  "${option}" -> ${isCorrect}`);
      });
      
      // Vérifier si l'ensemble est correct
      const normalizedCorrect = correctAnswers.map(a => a.toLowerCase().trim()).sort();
      const normalizedSelected = participantAnswer.selectedOptions.map((a: string) => a.toLowerCase().trim()).sort();
      
      const isComplete = this.arraysEqual(normalizedCorrect, normalizedSelected);
      console.log('Ensemble complet correct:', isComplete);
      
      if (isComplete) {
        console.log(`✅ Cette question devrait rapporter ${question.grade} points`);
      } else {
        console.log('❌ Cette question ne rapporte aucun point');
      }
    }
  }
}
private calculateQCMScore(question: Question, selectedAnswers: string[]): number {
  const correctAnswers = this.getCorrectAnswersFromResponse(question);
  const grade = question.grade || 0;
  
  if (correctAnswers.length === 0) {
    console.log(`❌ Aucune bonne réponse définie pour Q${question.id}`);
    return 0;
  }
  
  console.log(`\n🧮 Calcul QCM proportionnel pour Q${question.id}:`);
  console.log(`  Grade total: ${grade} points`);
  console.log(`  Bonnes réponses possibles: [${correctAnswers.join(', ')}]`);
  console.log(`  Réponses sélectionnées: [${selectedAnswers.join(', ')}]`);
  
  let correctCount = 0;
  let incorrectCount = 0;
  
  // Analyser chaque réponse sélectionnée
  selectedAnswers.forEach(selected => {
    const normalizedSelected = selected.toLowerCase().trim();
    const isCorrect = correctAnswers.some(correct => 
      correct.toLowerCase().trim() === normalizedSelected
    );
    
    if (isCorrect) {
      correctCount++;
      console.log(`  ✅ "${selected}" -> CORRECT`);
    } else {
      incorrectCount++;
      console.log(`  ❌ "${selected}" -> INCORRECT`);
    }
  });
  
  // Compter les bonnes réponses manquées
  const missedCount = correctAnswers.length - correctCount;
  
  console.log(`\n📊 Statistiques:`);
  console.log(`  Correctes sélectionnées: ${correctCount}/${correctAnswers.length}`);
  console.log(`  Incorrectes sélectionnées: ${incorrectCount}`);
  console.log(`  Bonnes réponses manquées: ${missedCount}`);
  
  // Calcul proportionnel avec pénalité pour les mauvaises réponses
  const totalCorrectPossible = correctAnswers.length;
  
  // Formule: (bonnes réponses - pénalité mauvaises réponses) / total possible
  // Pénalité = 0.5 point par mauvaise réponse (ajustable)
  const penaltyFactor = 0.5;
  const rawScore = (correctCount - (incorrectCount * penaltyFactor)) / totalCorrectPossible;
  
  // S'assurer que le score n'est pas négatif
  const normalizedScore = Math.max(0, rawScore);
  const finalScore = Math.round(grade * normalizedScore);
  
  console.log(`\n🎯 Calcul final:`);
  console.log(`  Score brut: (${correctCount} - ${incorrectCount} × ${penaltyFactor}) / ${totalCorrectPossible} = ${rawScore.toFixed(2)}`);
  console.log(`  Score normalisé: ${normalizedScore.toFixed(2)}`);
  console.log(`  Score final: ${grade} × ${normalizedScore.toFixed(2)} = ${finalScore} points`);
  
  return finalScore;
}


/**
 * MÉTHODE DE DEBUG MISE À JOUR pour le scoring proportionnel
 */
debugProportionalScoring() {
  console.log('\n🔍 =================== DEBUG SCORING PROPORTIONNEL ===================');
  
  if (this.participantAnswers.size === 0) {
    console.log('❌ Aucune réponse participant');
    return;
  }
  
  let simulatedTotalScore = 0;
  
  this.participantAnswers.forEach((answerData, questionId) => {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) return;
    
    console.log(`\n📌 Simulation Question ${questionId}:`);
    console.log(`Type: ${question.type}, Grade: ${question.grade}`);
    
    if (answerData.type === 'QCM' && answerData.selectedOptions?.length > 0) {
      const questionScore = this.calculateQCMScore(question, answerData.selectedOptions);
      simulatedTotalScore += questionScore;
      
    } else if (answerData.type === 'directe' && answerData.answerText?.trim()) {
      const participantAnswer = answerData.answerText.trim();
      const correctAnswer = question.response;
      
      if (correctAnswer) {
        const isCorrect = this.checkDirectAnswer(participantAnswer, correctAnswer, question.toleranceRate || 0);
        if (isCorrect) {
          simulatedTotalScore += question.grade;
          console.log(`✅ Directe correcte: +${question.grade} pts`);
        } else {
          console.log(`❌ Directe incorrecte: 0 pt`);
        }
      } else {
        console.log(`⏳ Directe à corriger manuellement`);
      }
    }
  });
  
  console.log(`\n🎯 SCORE TOTAL SIMULÉ: ${simulatedTotalScore} points`);
  return simulatedTotalScore;
}

/**
 * MÉTHODE DE TEST pour comparer différents scénarios de scoring
 */
testScoringScenarios() {
  console.log('\n🧪 =================== TEST SCÉNARIOS SCORING ===================');
  
  // Exemple de test avec une question fictive
  const testQuestion = {
    id: 999,
    type: 'QCM',
    grade: 10,
    response: '["Paris", "Londres", "Berlin"]' // 3 bonnes réponses
  } as Question;
  
  console.log('Question de test:', testQuestion);
  
  // Scénario 1: Toutes les bonnes réponses
  console.log('\n📝 Scénario 1: Toutes correctes');
  let score1 = this.calculateQCMScore(testQuestion, ['Paris', 'Londres', 'Berlin']);
  
  // Scénario 2: 2 bonnes sur 3
  console.log('\n📝 Scénario 2: 2 bonnes sur 3');
  let score2 = this.calculateQCMScore(testQuestion, ['Paris', 'Londres']);
  
  // Scénario 3: 2 bonnes + 1 mauvaise
  console.log('\n📝 Scénario 3: 2 bonnes + 1 mauvaise');
  let score3 = this.calculateQCMScore(testQuestion, ['Paris', 'Londres', 'Tokyo']);
  
  // Scénario 4: 1 bonne + 2 mauvaises
  console.log('\n📝 Scénario 4: 1 bonne + 2 mauvaises');
  let score4 = this.calculateQCMScore(testQuestion, ['Paris', 'Tokyo', 'Madrid']);
  
  console.log('\n📊 RÉSUMÉ DES SCÉNARIOS:');
  console.log(`Scénario 1 (3/3 correctes): ${score1}/${testQuestion.grade} pts`);
  console.log(`Scénario 2 (2/3 correctes): ${score2}/${testQuestion.grade} pts`);
  console.log(`Scénario 3 (2/3 + 1 fausse): ${score3}/${testQuestion.grade} pts`);
  console.log(`Scénario 4 (1/3 + 2 fausses): ${score4}/${testQuestion.grade} pts`);
}

/**
 * MÉTHODE UTILITAIRE : Ajuster le facteur de pénalité
 */
setPenaltyFactor(factor: number) {
  // Vous pouvez ajouter une propriété de classe pour personnaliser la pénalité
  console.log(`Facteur de pénalité ajusté à: ${factor}`);
  // Implémentation selon vos besoins
}
}


