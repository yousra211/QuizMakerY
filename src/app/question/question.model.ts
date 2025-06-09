export interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id?: number;
  text: string;
  type: string; // "directe" ou "QCM"
  grade: number;
  response?: string; // pour stocker la bonne réponse pour une question directe
    options?: QuestionOption[] ; // liste de réponses possibles pour QCM
}
