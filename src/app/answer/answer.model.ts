export interface Answer {
  id?: number;
  text: string;
  isCorrect: boolean | null;
  questionId: number; // Nouveau champ important
}

export interface Participant {
  id : number;
	email: string ;
	fullName :string ;
	CIN : string  ;
}