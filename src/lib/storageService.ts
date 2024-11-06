class StorageService {
  private isReplit: boolean

  constructor() {
    this.isReplit = typeof window === 'undefined' || !!process.env.REPL_ID
  }

  async getItem(key: string): Promise<string | null> {
    try {
      if (this.isReplit) {
        const response = await fetch(`/api/storage/get?key=${key}`)
        const data = await response.json()
        return data.value
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
        const response = await fetch('/api/storage/set', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ key, value }),
        })
        return response.ok
      } else {
        localStorage.setItem(key, value)
        return true
      }
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