import { Database } from "@replit/database"

class StorageService {
  private db: Database | null = null
  private isReplit: boolean

  constructor() {
    this.isReplit = typeof window === 'undefined' || !!process.env.REPL_ID
    if (this.isReplit) {
      this.db = new Database()
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      if (this.isReplit) {
        const value = await this.db!.get(key)
        return value ? String(value) : null
      } else {
        return localStorage.getItem(key)
      }
    } catch (error) {
      console.error('Storage error:', error)
      return null
    }
  }

  async setItem(key: string, value: string): Promise<boolean> {
    try {
      if (this.isReplit) {
        await this.db!.set(key, value)
      } else {
        localStorage.setItem(key, value)
      }
      return true
    } catch (error) {
      console.error('Storage error:', error)
      return false
    }
  }

  // Helper methods for common operations
  async getJSON<T>(key: string): Promise<T | null> {
    const data = await this.getItem(key)
    return data ? JSON.parse(data) : null
  }

  async setJSON<T>(key: string, value: T): Promise<boolean> {
    return await this.setItem(key, JSON.stringify(value))
  }
}

export const storage = new StorageService() 