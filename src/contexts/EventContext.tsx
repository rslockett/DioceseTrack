'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

interface Event {
  id: string
  title: string
  start: Date
  end: Date
  description?: string
  location?: string
  isAllDay?: boolean
}

interface EventContextType {
  events: Event[]
  addEvent: (event: Omit<Event, 'id'>) => string // returns the new event ID
  updateEvent: (event: Event) => void
  deleteEvent: (eventId: string) => void
}

const EventContext = createContext<EventContextType | undefined>(undefined)

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([])

  const addEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent = {
      ...eventData,
      id: crypto.randomUUID()
    }
    setEvents(prev => [...prev, newEvent])
    return newEvent.id
  }

  const updateEvent = (updatedEvent: Event) => {
    setEvents(prev => prev.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ))
  }

  const deleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId))
  }

  return (
    <EventContext.Provider value={{ events, addEvent, updateEvent, deleteEvent }}>
      {children}
    </EventContext.Provider>
  )
}

export function useEvents() {
  const context = useContext(EventContext)
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider')
  }
  return context
}
