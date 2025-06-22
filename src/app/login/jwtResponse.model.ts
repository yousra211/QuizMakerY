
import { CreatorResponse } from './creatorResponse.model';

export interface JwtResponse {
  token: string;
  type?: string; // généralement "Bearer"
  creator: CreatorResponse;
}