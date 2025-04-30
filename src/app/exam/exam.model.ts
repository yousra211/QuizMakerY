export interface Exam {
    id?: string;
    title: string;
    description: string;
    targetAudience: string;
    accessLink: string;
    createdBy: string;
    createdAt: Date;
    questions: string[]; // Array of question IDs
    totalScore?: number;
  }