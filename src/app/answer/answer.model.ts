export interface Answer {
  id?: number;
  text: string;
  isCorrect: boolean | null;
  questionId: number; // Nouveau champ important
  toleranceRate?: number;
  question?: {         // Ajouter pour gérer l'objet Question complet du backend
    id: number;
    // autres propriétés si nécessaire
  }; 
}

export interface Participant {
  id : number;
	email: string ;
	fullName :string ;
	CIN : string  ;
  answers?: Answer[]; // Relation avec les réponses
totalScore?: number;
}

export function getQuestionId(answer: Answer): number | null {
  if (answer.questionId) {
    return answer.questionId;
  }
  if (answer.question && answer.question.id) {
    return answer.question.id;
  }
  return null;
}