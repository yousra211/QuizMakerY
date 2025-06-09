import { Question } from "../question/question.model";

export interface Exam {
  id?: number;
  title: string;
  duration: number;
  description: string;
  uniqueLink: string;
  password?: string;
  creatorId?: number;
  questions?: Question[];
}

