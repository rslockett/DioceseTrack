import { db } from './index';

export async function migrateData() {
  try {
    // Migrate localStorage data to database if needed
    const tables = [
      'clergy',
      'parishes',
      'deaneries',
      'userAuth',
      'loginCredentials',
      'clergyRoles',
      'settings',
      'calendarEvents'
    ];

    for (const table of tables) {
      const dbData = await db.get(table);
      
      // Only migrate if no data exists in database
      if (!dbData && typeof window !== 'undefined') {
        const localData = localStorage.getItem(table);
        if (localData) {
          await db.set(table, JSON.parse(localData));
          console.log(`Migrated ${table} data to database`);
        }
      }
    }
  } catch (error) {
    console.error('Error during data migration:', error);
  }
} 