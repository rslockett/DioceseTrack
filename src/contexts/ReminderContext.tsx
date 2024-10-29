'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

// Define the Reminder type
interface Reminder {
  id: string
  eventId: string
  eventTitle: string
  type: 'alert' | 'reminder'
  time: Date
  message?: string
  status: 'pending' | 'dismissed'
}

// Define the Context type
interface ReminderContextType {
  reminders: Reminder[]
  addReminder: (reminder: Omit<Reminder, 'id'>) => void
  dismissReminder: (reminderId: string) => void
}

// Create the context
const ReminderContext = createContext<ReminderContextType | undefined>(undefined)

// Create the provider component
export function ReminderProvider({ children }: { children: ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>([])

  const addReminder = (reminderData: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = {
      ...reminderData,
      id: crypto.randomUUID()
    }
    setReminders(prev => [...prev, newReminder])
  }

  const dismissReminder = (reminderId: string) => {
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === reminderId 
          ? { ...reminder, status: 'dismissed' } 
          : reminder
      )
    )
  }

  return (
    <ReminderContext.Provider value={{ reminders, addReminder, dismissReminder }}>
      {children}
    </ReminderContext.Provider>
  )
}

// Create a custom hook to use the context
export function useReminders() {
  const context = useContext(ReminderContext)
  if (context === undefined) {
    throw new Error('useReminders must be used within a ReminderProvider')
  }
  return context
}