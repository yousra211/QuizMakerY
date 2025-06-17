import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../exam/exam.service';
import { AnswerService } from '../answer/answer.service';
import { Exam } from '../exam/exam.model';
import { Answer } from '../answer/answer.model';
import { Question, QuestionOption } from '../question/question.model';

@Component({
  selector: 'app-exam-participant',
  standalone: true,
  imports: [],
  templateUrl: './exam-participant.component.html',
  styleUrl: './exam-participant.component.css'
})
export class ExamParticipantComponent implements OnInit {
  
  // Signals pour l'état du composant
  loading = signal(false);
  error = signal<string | null>(null);
  exam = signal<any>(null);
  questions: any[] = [];
  questionsCount = 0;

   timeLeft = signal<string>('00:00');
  remainingSeconds = 0;
  private timerInterval: any;
  private examDuration = 0; 
  
  // Stockage des réponses du participant
  private participantAnswers: Map<number, any> = new Map();
  private participantId: number | null = null;
String: any;


 private readonly EXAM_ID = 25;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService,
      private answerService: AnswerService
  ) {}

 ngOnInit() {
    // Récupération de l'ID du participant
    const storedId = localStorage.getItem('currentParticipantId');
    if (storedId) {
      this.participantId = parseInt(storedId, 10);
    } else {
      console.error('Aucun ID participant trouvé dans le localStorage');
      this.router.navigate(['/participant']); // Redirigez vers la page de connexion si nécessaire
    }
    
    this.loadExam();
  }

  private loadExam() {
  this.loading.set(true);
  this.error.set(null);
  
  const examId = this.EXAM_ID;

  this.examService.getExamWithQuestions(examId).subscribe({
    next: (exam: Exam) => {
      console.log('Exam reçu:', exam);
      this.exam.set(exam);
      this.questions = exam.questions || [];
      
      // Initialisation du timer
      this.examDuration = exam.duration * 60; // Convertir les minutes en secondes
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
      this.submitExam(); // Soumission automatique quand le temps est écoulé
    }
  }, 1000);
}

private updateTimeDisplay() {
  const minutes = Math.floor(this.remainingSeconds / 60);
  const seconds = this.remainingSeconds % 60;
  this.timeLeft.set(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
}

// N'oubliez pas de nettoyer l'intervalle quand le composant est détruit
ngOnDestroy() {
  if (this.timerInterval) {
    clearInterval(this.timerInterval);
  }
}

getQuestionOptions(question: Question): QuestionOption[] {
  console.log('Question options raw:', question.options);
  console.log('Question type:', question.type);
  
  if (!question.options || question.type === 'directe') {
    return [];
  }

  try {
    if (typeof question.options === 'string' && !question.options.startsWith('[')) {
      const result = [{ text: question.options, isCorrect: false }];
      console.log('Single option result:', result);
      return result;
    }
    
    const parsed = JSON.parse(question.options);
    console.log('Parsed options:', parsed);
    
    if (Array.isArray(parsed)) {
      const result = parsed.map(option => ({ 
        text: option.text, 
        isCorrect: false 
      }));
      console.log('Array options result:', result);
      return result;
    }
    
    return [];
  } catch (error) {
    console.error('Erreur lors du parsing des options:', error);
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
      // Ajouter l'option sélectionnée
      if (!questionAnswer.selectedOptions.includes(optionText)) {
        questionAnswer.selectedOptions.push(optionText);
      }
    } else {
      // Retirer l'option désélectionnée
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

  /**
   * Soumet l'examen avec toutes les réponses du participant
   */


submitExam() {
  if (!this.participantId) {
    alert('Participant non identifié');
    return;
  }

  if (this.participantAnswers.size > 0) {
    const answersData: Answer[] = [];
    
    this.participantAnswers.forEach((answerData, questionId) => {
      if (answerData.type === 'QCM') {
        answerData.selectedOptions.forEach((optionText: string) => {
          answersData.push({
            text: optionText,
            isCorrect: this.isOptionCorrect(questionId, optionText),
            questionId: questionId // participantId est retiré du payload
          });
        });
      } else if (answerData.type === 'directe') {
        answersData.push({
          text: answerData.answerText,
          isCorrect: null,
          questionId: questionId
        });
      }
    });

    // Appel avec les deux arguments attendus
    this.answerService.addAnswersForParticipant(this.participantId, answersData).subscribe({
      next: (response) => {
        this.router.navigate(['/participant']); // hadi khsa tbedel
      },
      error: (err) => {
        console.error('Erreur:', err);
        alert("Erreur lors de la soumission");
      }
    });
  } else {
    alert("Aucune réponse à soumettre !");
  }
}

private isOptionCorrect(questionId: number, optionText: string): boolean {
  const question = this.exam()?.questions?.find((q: Question) => q.id === questionId);
  if (!question) return false;

  const realOptions = this.getOriginalOptions(question); // Nouvelle méthode
  const foundOption = realOptions.find(opt => 
    opt.text.trim().toLowerCase() === optionText.trim().toLowerCase()
  );
  return foundOption ? foundOption.isCorrect : false;
}

// Nouvelle méthode pour obtenir les options originales avec isCorrect
private getOriginalOptions(question: Question): QuestionOption[] {
  if (!question.options || question.type === 'directe') return [];

  try {
    if (typeof question.options === 'string' && !question.options.startsWith('[')) {
      return [{ text: question.options, isCorrect: true }];
    }
    
    const parsed = JSON.parse(question.options);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}
  /**
   * Vérifie si une option sélectionnée est correcte
   */
 private checkIfOptionIsCorrect(question: { options?: QuestionOption[] }, selectedOptionText: string): boolean {
  const options = question.options || [];
  return options.some((opt: QuestionOption) => 
    opt.text === selectedOptionText && opt.isCorrect
  );
}

  /**
   * Retourne à la page précédente
   */
  goBack() {
    this.router.navigate(['/participant']);
  }

  /**
   * Vérifie si toutes les questions ont été répondues (optionnel)
   */
  private areAllQuestionsAnswered(): boolean {
    return this.questions.every(question => 
      this.participantAnswers.has(question.id)
    );
  }

  /**
   * Obtient le pourcentage de progression (optionnel)
   */
  getProgressPercentage(): number {
    if (this.questions.length === 0) return 0;
    return Math.round((this.participantAnswers.size / this.questions.length) * 100);
  }
}
