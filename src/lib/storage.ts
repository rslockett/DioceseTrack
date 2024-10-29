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
    diocese_address?: string;
    bishop?: string;
    contactEmail?: string;
    contactPhone?: string;
    timezone: string;
  };
  notifications: {
    emailNotifications: boolean;
    reminderDefault: number;  // minutes before event
    defaultReminderType: 'alert' | 'reminder';
  };
  display: {
    defaultCalendarView: 'month' | 'week' | 'day';
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
  security: {
    sessionTimeout?: number;
    lastBackup?: Date;
    dataRetentionDays?: number;
  };
}

// Storage management functions
export const storage = {
  // Clergy functions
  getClergyList: (): Clergy[] => {
    const data = localStorage.getItem('clergyData');
    return data ? JSON.parse(data) : [];
  },

  addClergy: (clergy: Omit<Clergy, 'id'>) => {
    const currentList = storage.getClergyList();
    const newClergy = {
      ...clergy,
      id: crypto.randomUUID()
    };
    localStorage.setItem('clergyData', JSON.stringify([...currentList, newClergy]));
    return newClergy;
  },

  // Parish functions
  getParishList: (): Parish[] => {
    const data = localStorage.getItem('parishData');
    return data ? JSON.parse(data) : [];
  },

  addParish: (parish: Omit<Parish, 'id'>) => {
    const currentList = storage.getParishList();
    const newParish = {
      ...parish,
      id: crypto.randomUUID()
    };
    localStorage.setItem('parishData', JSON.stringify([...currentList, newParish]));
    return newParish;
  },

  // Document functions
  getDocumentList: (): Document[] => {
    const data = localStorage.getItem('documentData');
    return data ? JSON.parse(data) : [];
  },

  addDocument: (document: Omit<Document, 'id'>) => {
    const currentList = storage.getDocumentList();
    const newDocument = {
      ...document,
      id: crypto.randomUUID()
    };
    localStorage.setItem('documentData', JSON.stringify([...currentList, newDocument]));
    return newDocument;
  },

  // Calendar functions
  getEvents: (): CalendarEvent[] => {
    const data = localStorage.getItem('calendarEvents');
    return data ? JSON.parse(data) : [];
  },

  addEvent: (event: Omit<CalendarEvent, 'id'>) => {
    const currentEvents = storage.getEvents();
    const newEvent = {
      ...event,
      id: crypto.randomUUID()
    };
    localStorage.setItem('calendarEvents', JSON.stringify([...currentEvents, newEvent]));
    return newEvent;
  },

  updateEvent: (id: string, updates: Partial<CalendarEvent>) => {
    const currentEvents = storage.getEvents();
    const updatedEvents = currentEvents.map(event => 
      event.id === id ? { ...event, ...updates } : event
    );
    localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
  },

  // Settings functions
  getSettings: (): Settings => {
    const data = localStorage.getItem('settings');
    if (!data) {
      // Return default settings
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
      localStorage.setItem('settings', JSON.stringify(defaultSettings));
      return defaultSettings;
    }
    return JSON.parse(data);
  },

  updateSettings: (updates: Partial<Settings>) => {
    const currentSettings = storage.getSettings();
    const newSettings = { ...currentSettings, ...updates };
    localStorage.setItem('settings', JSON.stringify(newSettings));
    return newSettings;
  }
}; 