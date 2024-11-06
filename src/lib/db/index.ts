import { BaseDB } from './types';
import { LocalStorage } from './localStorage';

// Simple factory function to get the appropriate database implementation
export function getDatabase(): BaseDB {
  // Always use localStorage in browser
  return new LocalStorage();
}

export const db = getDatabase();