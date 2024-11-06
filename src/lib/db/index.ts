import { BaseDB } from './types';
import { LocalStorage } from './localStorage';

// Simple factory function to get the appropriate database implementation
export function getDatabase(): BaseDB {
  // Always use localStorage for now, we'll add Replit DB support when deployed
  return new LocalStorage();
}

export const db = getDatabase();