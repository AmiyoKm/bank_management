import { User } from '../models/user.js';

declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
}

export {};