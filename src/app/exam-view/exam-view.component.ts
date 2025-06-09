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

  // Formater les options pour les questions QCM
formatOptions(question: Question): string {
  if (question.options && question.options.length > 0) {
    return question.options
      .map((option, index) => 
        `${String.fromCharCode(65 + index)}. ${option.text} ${option.isCorrect ? '✓' : ''}`
      )
      .join('\n');
  }
  return '';
}

// Formater la réponse correcte
formatCorrectAnswer(question: Question): string {
  if (question.type === 'directe') {
    return question.response || 'Aucune réponse définie';
  } else if (question.type === 'QCM') {
    if (question.options) {
      const correctOptions = question.options
        .filter(option => option.isCorrect)
        .map(option => option.text);
      return correctOptions.join(', ') || 'Aucune réponse correcte définie';
    }
  }
  return 'N/A';
}
}