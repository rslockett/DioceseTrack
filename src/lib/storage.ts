// Define our data types
export interface Clergy {
  id: string;
  name: string;
  title: string;
  status: 'active' | 'inactive';
  parish?: string;
  dateAssigned?: Date;
  contact: {
    email: string;
    phone: string;
  };
}

export interface Parish {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  assignedClergy?: string[];  // IDs of assigned clergy
  status: 'active' | 'inactive';
}

export interface Document {
  id: string;
  title: string;
  type: 'letter' | 'report' | 'certificate' | 'other';
  dateUploaded: Date;
  uploadedBy: string;
  fileUrl: string;
}

// Calendar interfaces
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  isAllDay: boolean;
  type: 'meeting' | 'liturgical' | 'appointment' | 'other';
  location?: string;
  attendees?: string[];  // IDs of clergy or staff
  relatedParish?: string;  // ID of related parish
  relatedDeanery?: string;  // ID of related deanery
  reminders?: EventReminder[];
  status: 'scheduled' | 'cancelled' | 'completed';
}

export interface EventReminder {
  id: string;
  type: 'alert' | 'reminder';
  time: Date;
  status: 'pending' | 'sent' | 'dismissed';
}

// Settings interface
export interface Settings {
  general: {
    dioceseName: string;
    timezone: string;
  };
  notifications: {
    emailNotifications: boolean;
    reminderDefault: number;
    defaultReminderType: string;
  };
  display: {
    defaultCalendarView: string;
    theme: string;
    language: string;
  };
  security: {
    sessionTimeout: number;
    dataRetentionDays: number;
  };
}

// Storage management functions
import { getDatabase } from './db';
const db = getDatabase();

export const storage = {
  // Clergy functions
  getClergyList: async (): Promise<Clergy[]> => {
    const data = await db.get('clergyData');
    return data || [];
  },

  addClergy: async (clergy: Omit<Clergy, 'id'>) => {
    const currentList = await storage.getClergyList();
    const newClergy = {
      ...clergy,
      id: crypto.randomUUID()
    };
    await db.set('clergyData', [...currentList, newClergy]);
    return newClergy;
  },

  // Parish functions
  getParishList: async (): Promise<Parish[]> => {
    const data = await db.get('parishData');
    return data || [];
  },

  addParish: async (parish: Omit<Parish, 'id'>) => {
    const currentList = await storage.getParishList();
    const newParish = {
      ...parish,
      id: crypto.randomUUID()
    };
    await db.set('parishData', [...currentList, newParish]);
    return newParish;
  },

  // Document functions
  getDocumentList: async (): Promise<Document[]> => {
    const data = await db.get('documentData');
    return data || [];
  },

  addDocument: async (document: Omit<Document, 'id'>) => {
    const currentList = await storage.getDocumentList();
    const newDocument = {
      ...document,
      id: crypto.randomUUID()
    };
    await db.set('documentData', [...currentList, newDocument]);
    return newDocument;
  },

  // Calendar functions
  getEvents: async (): Promise<CalendarEvent[]> => {
    const data = await db.get('calendarEvents');
    return data || [];
  },

  addEvent: async (event: Omit<CalendarEvent, 'id'>) => {
    const currentEvents = await storage.getEvents();
    const newEvent = {
      ...event,
      id: crypto.randomUUID()
    };
    await db.set('calendarEvents', [...currentEvents, newEvent]);
    return newEvent;
  },

  updateEvent: async (id: string, updates: Partial<CalendarEvent>) => {
    const currentEvents = await storage.getEvents();
    const updatedEvents = currentEvents.map(event => 
      event.id === id ? { ...event, ...updates } : event
    );
    await db.set('calendarEvents', updatedEvents);
  },

  // Settings functions
  getSettings: async (): Promise<Settings> => {
    const data = await db.get('settings');
    if (!data) {
      const defaultSettings: Settings = {
        general: {
          dioceseName: '',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        notifications: {
          emailNotifications: true,
          reminderDefault: 60,
          defaultReminderType: 'reminder'
        },
        display: {
          defaultCalendarView: 'month',
          theme: 'system',
          language: 'en'
        },
        security: {
          sessionTimeout: 30,
          dataRetentionDays: 365
        }
      };
      await db.set('settings', defaultSettings);
      return defaultSettings;
    }
    return data;
  },

  updateSettings: async (updates: Partial<Settings>) => {
    const currentSettings = await storage.getSettings();
    const newSettings = { ...currentSettings, ...updates };
    await db.set('settings', newSettings);
    return newSettings;
  }
}; 