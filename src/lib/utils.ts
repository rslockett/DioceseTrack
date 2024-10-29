import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Add this function if it's not already there
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add these functions to your utils file
export function getStoredEvents() {
  if (typeof window === 'undefined') return []
  
  const savedEvents = localStorage.getItem('calendarEvents')
  if (!savedEvents) return []

  try {
    return JSON.parse(savedEvents).map((event: any) => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
      reminders: event.reminders?.map((reminder: any) => ({
        ...reminder,
        time: new Date(reminder.time)
      }))
    }))
  } catch (error) {
    console.error('Error parsing events:', error)
    return []
  }
}
