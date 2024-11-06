import { BaseDB } from './types';

export class ReplitDB implements BaseDB {
  private client: any = null;

  constructor() {
    // Only initialize if we're in a Replit environment
    if (typeof window === 'undefined' && process.env.REPLIT_DB_URL) {
      // We'll initialize later when needed
      this.initializeClient();
    }
  }

  private async initializeClient() {
    if (!this.client && process.env.REPLIT_DB_URL) {
      try {
        const { Client } = await import('@replit/database');
        this.client = new Client();
      } catch (error) {
        console.error('Failed to initialize Replit DB client:', error);
      }
    }
  }

  async get(key: string) {
    if (!this.client) return null;
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('ReplitDB get error:', error);
      return null;
    }
  }

  async set(key: string, value: any) {
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