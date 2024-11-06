import { BaseDB } from './types';
import { LocalStorage } from './localStorage';
import { ReplitDB } from './replitDB';

// Simple factory function to get the appropriate database implementation
export function getDatabase(): BaseDB {
  // Check if we're in Replit environment
  const isReplit = typeof window !== 'undefined' && window.location.hostname.includes('replit');
  
  if (isReplit) {
    return new ReplitDB();
  }
  return new LocalStorage();
}

export const db = getDatabase();