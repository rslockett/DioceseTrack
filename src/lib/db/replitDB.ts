import { BaseDB } from './types';

export class ReplitDB implements BaseDB {
  private client: any = null;

  constructor() {
    // Only initialize in server-side code
    if (typeof window === 'undefined') {
      this.initializeClient();
    }
  }

  private async initializeClient() {
    if (!this.client) {
      try {
        const Database = require('@replit/database');
        this.client = new Database(process.env.REPLIT_DB_URL);
        console.log('ReplitDB client initialized');
      } catch (error) {
        console.error('Failed to initialize Replit DB client:', error);
      }
    }
  }

  async get(key: string) {
    if (typeof window !== 'undefined') {
      // In browser, fall back to localStorage
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    }

    await this.initializeClient();
    if (!this.client) return null;
    
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('ReplitDB get error:', error);
      return null;
    }
  }

  async set(key: string, value: any) {
    if (typeof window !== 'undefined') {
      // In browser, fall back to localStorage
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error('localStorage set error:', error);
        return false;
      }
    }

    await this.initializeClient();
    if (!this.client) return false;
    
    try {
      await this.client.set(key, value);
      return true;
    } catch (error) {
      console.error('ReplitDB set error:', error);
      return false;
    }
  }

  async delete(key: string) {
    if (typeof window !== 'undefined') {
      // In browser, fall back to localStorage
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error('localStorage delete error:', error);
        return false;
      }
    }

    await this.initializeClient();
    if (!this.client) return false;
    
    try {
      await this.client.delete(key);
      return true;
    } catch (error) {
      console.error('ReplitDB delete error:', error);
      return false;
    }
  }
} 