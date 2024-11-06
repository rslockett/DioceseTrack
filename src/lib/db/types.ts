// Define the interface that both localStorage and ReplitDB must implement
export interface BaseDB {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<boolean>;
  delete(key: string): Promise<boolean>;
} 