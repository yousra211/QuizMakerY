import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../exam/exam.service';
import { Exam} from '../exam/exam.model';
import { Question, QuestionOption } from '../question/question.model';

@Component({
  selector: 'app-exam-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-view.component.html',
  styleUrl: './exam-view.component.css'
})

export class ExamViewComponent implements OnInit {
  exam = signal<Exam | null>(null);
  loading = signal<boolean>(true);
  error = signal<string>('');
  
  // Exposer String.fromCharCode pour le template
  String = String;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private examService = inject(ExamService);

  // Getter pour les questions (évite les erreurs undefined)
  get questions(): Question[] {
    return this.exam()?.questions || [];
  }

  // Getter pour compter les questions
  get questionsCount(): number {
    return this.questions.length;
  }
  
  ngOnInit(): void {
    const examId = this.route.snapshot.params['id'];
    if (examId) {
      this.loadExamDetails(+examId);
    } else {
      this.error.set('ID d\'examen manquant');
      this.loading.set(false);
    }
  }

  loadExamDetails(examId: number): void {
    this.examService.getExamWithQuestions(examId).subscribe({
      next: (exam: Exam) => {
        this.exam.set(exam);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'examen:', err);
        this.error.set('Erreur lors du chargement de l\'examen');
        this.loading.set(false);
      }
    });
  }

  // Modifier l'examen
  editExam(): void {
    const currentExam = this.exam();
    if (currentExam && currentExam.id) {
      localStorage.setItem('examToUpdateId', currentExam.id.toString());
      this.router.navigate(['/update-exam', currentExam.id]);
    }
  }

  // Retourner à la liste des examens
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  // NOUVELLE MÉTHODE : Parser les options depuis le JSON string
  getQuestionOptions(question: Question): QuestionOption[] {
    if (!question.options || question.type === 'directe') {
      return [];
    }

    try {
      // Si c'est un simple string (1 seule option), on le convertit en QuestionOption
      if (typeof question.options === 'string' && !question.options.startsWith('[')) {
        return [{ text: question.options, isCorrect: true }];
      }
      
      // Si c'est un JSON array, on le parse
      const parsed = JSON.parse(question.options);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Erreur lors du parsing des options:', error);
      return [];
    }
  }

  // NOUVELLE MÉTHODE : Obtenir les réponses correctes parsées
  getCorrectAnswers(question: Question): string[] {
    if (question.type === 'directe') {
      return question.response ? [question.response] : [];
    }

    if (!question.response) {
      return [];
    }

    try {
      // Si c'est un simple string
      if (!question.response.startsWith('[')) {
        return [question.response];
      }
      
      // Si c'est un JSON array
      const parsed = JSON.parse(question.response);
      return Array.isArray(parsed) ? parsed : [question.response];
    } catch (error) {
      return [question.response];
    }
  }

  // Formater les options pour les questions QCM (version simplifiée)
 formatOptions(question: Question): string {
  const options = this.getQuestionOptions(question);
  if (options.length > 0) {
    return options
      .map((option, index) => {
        const letter = String.fromCharCode(65 + index);
        const checkMark = option.isCorrect ? '✓' : '';
        return letter + '. ' + option.text + ' ' + checkMark;
      })
      .join('\n');
  }
  return '';
}

  // Formater la réponse correcte
  formatCorrectAnswer(question: Question): string {
    const correctAnswers = this.getCorrectAnswers(question);
    return correctAnswers.length > 0 ? correctAnswers.join(', ') : 'Aucune réponse définie';
  }
}