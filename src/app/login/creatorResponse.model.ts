export interface CreatorResponse {
    id: number;
    fullname: string;
    username: string;
    email: string;
    photoUrl?: string;
    roles?: string[];  // Add this line
    active?: boolean; // Add this line
  }