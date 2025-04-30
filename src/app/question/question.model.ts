import { Answer } from "../answer/answer.model";

export interface Question {
  id?: number;
  text: string;
  type: string; // "directe" ou "QCM"
  grade: number;
  duration: number;
  response?: string; // pour stocker la bonne réponse pour une question directe
  answers?: Answer[]; // liste de réponses possibles pour QCM
}
