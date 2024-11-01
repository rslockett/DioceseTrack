import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add this interface for Event type
interface Event {
  id?: string;
  title?: string;
  start: Date;
  end: Date;
  description?: string;
  isAllDay?: boolean;
  reminders?: Array<{
    id: string;
    type: 'alert' | 'reminder';
    time: Date;
    status: 'pending' | 'sent' | 'dismissed';
  }>;
}

// Add the getStoredEvents function
export const getStoredEvents = (): Event[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const events = localStorage.getItem('events');
    return events ? JSON.parse(events) : [];
  } catch (error) {
    console.error('Error loading events:', error);
    return [];
  }
};
