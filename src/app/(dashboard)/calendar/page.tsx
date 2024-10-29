'use client'
import { useState, useEffect } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const locales = {
  'en-US': require('date-fns/locale/en-US')
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface Event {
  id?: string
  title?: string
  start: Date
  end: Date
  description?: string
  isAllDay?: boolean
  reminderType?: 'alert' | 'reminder'
  reminderTime?: string
  reminders?: Array<{
    id: string
    type: 'alert' | 'reminder'
    time: Date
    status: 'pending' | 'sent' | 'dismissed'
  }>
}

interface EventFormProps {
  event?: Partial<Event>
  onSubmit: (event: Partial<Event>) => void
  onClose: () => void
  onDelete?: (event: Event) => void  // Add this
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Partial<Event> | undefined>()
  const [formData, setFormData] = useState<Partial<Event>>({
    start: new Date(),
    end: new Date(),
    isAllDay: false
  })
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Load events from localStorage when component mounts
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendarEvents')
    console.log('Loading events:', savedEvents) // Debug log
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents).map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
          reminders: event.reminders?.map((reminder: any) => ({
            ...reminder,
            time: new Date(reminder.time)
          }))
        }))
        console.log('Parsed events:', parsedEvents) // Debug log
        setEvents(parsedEvents)
      } catch (error) {
        console.error('Error parsing events:', error)
      }
    }
  }, [])

  // Save events to localStorage whenever they change
  useEffect(() => {
    console.log('Saving events:', events) // Debug log
    localStorage.setItem('calendarEvents', JSON.stringify(events))
  }, [events])

  const handleSelectSlot = ({ start }: { start: Date; end: Date }) => {
    const selectedDate = new Date(start.toLocaleDateString() + ' 09:00:00')
    const endDate = new Date(start.toLocaleDateString() + ' 10:00:00')

    setSelectedEvent(undefined)
    setFormData({
      start: selectedDate,
      end: endDate,
      isAllDay: false
    })
    setIsDialogOpen(true)
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setFormData(event)
    setIsDialogOpen(true)
  }

  const checkEventOverlap = (newEvent: Partial<Event>) => {
    return events.some(existingEvent => {
      if (existingEvent.id === newEvent.id) return false // Skip the event being edited
      
      const newStart = new Date(newEvent.start!).getTime()
      const newEnd = new Date(newEvent.end!).getTime()
      const existingStart = new Date(existingEvent.start).getTime()
      const existingEnd = new Date(existingEvent.end).getTime()

      return (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      )
    })
  }

  const handleEventSubmit = (eventData: Partial<Event>) => {
    // Add overlap check
    if (!eventData.isAllDay && checkEventOverlap(eventData)) {
      alert("This event overlaps with an existing event")
      return
    }

    // Validate dates
    const now = new Date()
    const startDate = new Date(eventData.start!)
    const endDate = new Date(eventData.end!)

    if (startDate < now) {
      alert("Cannot create events in the past")
      return
    }

    if (endDate < startDate) {
      alert("End time cannot be before start time")
      return
    }

    const newEvents = selectedEvent?.id
      ? events.map(event => 
          event.id === selectedEvent.id ? { ...event, ...eventData } : event
        )
      : [...events, { ...eventData, id: crypto.randomUUID() } as Event]
    
    console.log('Submitting event, new events:', newEvents) // Debug log
    setEvents(newEvents)
    setIsDialogOpen(false)
  }

  const eventStyleGetter = (event: Event, start: Date, end: Date, isSelected: boolean) => {
    if (event.isAllDay) {
      return {
        style: {
          backgroundColor: '#4F46E5', // Indigo color for all-day events
          border: 'none',
          borderRadius: '6px',
          color: 'white',
          padding: '4px 8px',
          fontWeight: '500',
          width: '100%', // Make sure it spans full width
          height: '100%', // Fill the entire height of the slot
          display: 'flex',
          alignItems: 'center'
        }
      }
    }
    return {
      style: {
        backgroundColor: '#3B82F6', // Blue color for regular events
        border: 'none',
        borderRadius: '6px',
        color: 'white',
        padding: '4px 8px',
        height: '100%',
        minHeight: '24px'
      }
    }
  }

  const handleDeleteEvent = (event: Event) => {
    if (event.id) {  // Make sure event has an ID
      setEventToDelete(event)
      setShowDeleteDialog(true)
    }
  }

  const confirmDelete = () => {
    if (eventToDelete) {
      setEvents(events.filter(e => e.id !== eventToDelete.id))
      setEventToDelete(null)
      setIsDialogOpen(false)
    }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={handleEventClick}
        onSelectSlot={handleSelectSlot}
        selectable
        eventPropGetter={eventStyleGetter}
        components={{
          toolbar: CustomToolbar
        }}
        {...calendarStyles}
        views={['month', 'week', 'day']}
        defaultView="month"
        popup
        className="rounded-lg"
      />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent?.id ? 'Edit Event' : 'Create Event'}
            </DialogTitle>
          </DialogHeader>
          <EventForm
            event={selectedEvent || formData}
            onSubmit={handleEventSubmit}
            onClose={() => setIsDialogOpen(false)}
            onDelete={handleDeleteEvent}  // Pass the delete handler
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!eventToDelete} onOpenChange={() => setEventToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{eventToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

const calendarStyles = {
  className: "p-4",
  dayPropGetter: (date: Date) => ({
    className: 'hover:bg-blue-50 cursor-pointer transition-colors',
    style: {
      padding: '8px',
      border: '1px solid #e5e7eb',
      backgroundColor: '#fff',
    },
  }),
  style: {
    height: 'calc(100vh - 200px)', // Adjust height as needed
  },
  dayHeaderStyle: {
    backgroundColor: '#f3f4f6',
    padding: '8px',
    borderBottom: '1px solid #e5e7eb',
  },
  monthHeaderStyle: {
    padding: '12px',
    borderBottom: '1px solid #e5e7eb',
  }
}

const EventForm = ({ event, onSubmit, onClose, onDelete }: EventFormProps) => {
  const [formData, setFormData] = useState<Partial<Event>>(
    event || {
      start: new Date(),
      end: new Date(),
      isAllDay: false
    }
  )

  const [isAllDay, setIsAllDay] = useState(event?.isAllDay || false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleAllDayToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    setIsAllDay(isChecked)
    if (isChecked) {
      const startDate = new Date(formData.start!)
      startDate.setHours(0, 0, 0, 0)
      setFormData({
        ...formData,
        start: startDate,
        end: startDate,
        isAllDay: true
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input
        type="text"
        value={formData.title || ''}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="w-full text-xl font-semibold border-0 border-b-2 border-gray-200 focus:border-blue-500 focus:ring-0 px-0 py-2"
        placeholder="Add title"
        autoFocus
        required
      />

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="allDay"
          checked={isAllDay}
          onChange={handleAllDayToggle}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="allDay" className="text-sm font-medium text-gray-700">
          All day
        </label>
      </div>

      <div className="space-y-4">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isAllDay ? "Date" : "Starts"}
          </label>
          <div className="flex gap-2 w-full">
            <div className="flex-1">
              <input
                type="date"
                value={formData.start ? new Date(formData.start).toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const newDate = new Date(e.target.value)
                  const currentDate = new Date(formData.start!)
                  newDate.setHours(currentDate.getHours(), currentDate.getMinutes())
                  setFormData({ 
                    ...formData, 
                    start: newDate,
                    end: isAllDay ? newDate : formData.end
                  })
                }}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            {!isAllDay && (
              <div className="w-[140px]">
                <input
                  type="time"
                  value={formData.start ? new Date(formData.start).toTimeString().slice(0, 5) : ''}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':')
                    const newStartDate = new Date(formData.start!)
                    newStartDate.setHours(parseInt(hours), parseInt(minutes))
                    
                    // Create end date one hour later
                    const newEndDate = new Date(newStartDate)
                    newEndDate.setHours(newStartDate.getHours() + 1)
                    
                    setFormData({ 
                      ...formData, 
                      start: newStartDate,
                      end: newEndDate
                    })
                  }}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {!isAllDay && (
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Ends</label>
            <div className="flex gap-2 w-full">
              <div className="flex-1">
                <input
                  type="date"
                  value={formData.end ? new Date(formData.end).toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value)
                    const currentDate = new Date(formData.end!)
                    newDate.setHours(currentDate.getHours(), currentDate.getMinutes())
                    setFormData({ ...formData, end: newDate })
                  }}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="w-[140px]">
                <input
                  type="time"
                  value={formData.end ? new Date(formData.end).toTimeString().slice(0, 5) : ''}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':')
                    const newDate = new Date(formData.end!)
                    newDate.setHours(parseInt(hours), parseInt(minutes))
                    setFormData({ ...formData, end: newDate })
                  }}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Alert/Reminder Section */}
      <details className="mt-4">
        <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-700">
          Add alert
        </summary>
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-4">
            <select
              value={formData.reminderType || 'alert'}
              onChange={(e) => setFormData({
                ...formData,
                reminderType: e.target.value as 'alert' | 'reminder'
              })}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="alert">Alert</option>
              <option value="reminder">Reminder</option>
            </select>

            <select
              value={formData.reminderTime || '15'}
              onChange={(e) => setFormData({
                ...formData,
                reminderTime: e.target.value
              })}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="5">5 minutes before</option>
              <option value="15">15 minutes before</option>
              <option value="30">30 minutes before</option>
              <option value="60">1 hour before</option>
              <option value="1440">1 day before</option>
            </select>

            <button
              type="button"
              onClick={() => {
                const minutes = parseInt(formData.reminderTime || '15')
                setFormData({
                  ...formData,
                  reminders: [
                    ...(formData.reminders || []),
                    {
                      id: crypto.randomUUID(),
                      type: formData.reminderType || 'alert',
                      time: new Date(formData.start!.getTime() - (minutes * 60000)),
                      status: 'pending'
                    }
                  ]
                })
              }}
              className="px-3 py-1 text-sm rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
            >
              Add
            </button>
          </div>

          {/* Show added reminders */}
          {formData.reminders && formData.reminders.length > 0 && (
            <div className="space-y-2">
              {formData.reminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                  <span className="text-sm">
                    {reminder.type === 'alert' ? '🔔' : '📝'} {
                      `${reminder.type.charAt(0).toUpperCase() + reminder.type.slice(1)} ${
                        formatDistanceToNow(reminder.time, { addSuffix: true })
                      }`
                    }
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        reminders: formData.reminders?.filter(r => r.id !== reminder.id)
                      })
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </details>

      <div className="flex justify-between pt-4">
        {event?.id && onDelete && (  // Check if event has ID and onDelete exists
          <button
            type="button"
            onClick={() => onDelete(event as Event)}  // Only call if event exists
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-transparent rounded-full hover:bg-red-100"
          >
            Delete Event
          </button>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-full hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  )
}

const CustomToolbar = (toolbar: any) => {
  const goToBack = () => {
    toolbar.onNavigate('PREV');
  };

  const goToNext = () => {
    toolbar.onNavigate('NEXT');
  };

  const goToCurrent = () => {
    toolbar.onNavigate('TODAY');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all events? This cannot be undone.')) {
      setEvents([])
      localStorage.removeItem('calendarEvents')
    }
  }

  return (
    <div className="rbc-toolbar">
      <div className="rbc-btn-group">
        <button type="button" onClick={goToCurrent}>
          Today
        </button>
        <button type="button" onClick={goToBack}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button type="button" onClick={goToNext}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <span className="rbc-toolbar-label">{toolbar.label}</span>
      <div className="rbc-btn-group">
        {toolbar.views.map((view: string) => (
          <button
            key={view}
            type="button"
            onClick={() => toolbar.onView(view)}
            className={view === toolbar.view ? 'rbc-active' : ''}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
        <button
          type="button"
          onClick={handleClearAll}
          className="text-red-600 hover:text-red-700"
        >
          Clear All
        </button>
      </div>
    </div>
  );
};
