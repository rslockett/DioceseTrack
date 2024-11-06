import { BaseDB } from './types';

export class LocalStorage implements BaseDB {
  async get(key: string) {
    try {
      if (typeof window === 'undefined') return null;
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('LocalStorage get error:', error);
      return null;
    }
  }

  async set(key: string, value: any) {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('LocalStorage set error:', error);
      return false;
    }
  }

  async delete(key: string) {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('LocalStorage delete error:', error);
      return false;
    }
  }
} 