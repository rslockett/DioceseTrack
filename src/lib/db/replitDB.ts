import { BaseDB } from './types';

export class ReplitDB implements BaseDB {
  private client: any = null;

  constructor() {
    // Initialize if we're in Replit environment or have the DB URL
    if (process.env.REPLIT_DB_URL) {
      this.initializeClient();
    }
  }

  private async initializeClient() {
    if (!this.client && process.env.REPLIT_DB_URL) {
      try {
        const Database = require('@replit/database');
        this.client = new Database();
      } catch (error) {
        console.error('Failed to initialize Replit DB client:', error);
      }
    }
  }

  async get(key: string) {
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