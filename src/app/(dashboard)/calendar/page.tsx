'use client'
import { useState, useEffect } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import "react-big-calendar/lib/css/react-big-calendar.css"
import "react-big-calendar/lib/addons/dragAndDrop/styles.css"
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
import { saveCalendarEvent, getCalendarEvents, deleteCalendarEvent } from '@/lib/calendarStorage'

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

interface CustomToolbarProps {
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  date: Date;
  view: string;
  onNavigate: (date: Date) => void;
  onView: (view: string) => void;
  label: string;
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
  const [view, setView] = useState('month')
  const [date, setDate] = useState(new Date())

  // Load events when component mounts
  useEffect(() => {
    const savedEvents = getCalendarEvents()
    console.log('Loading saved events:', savedEvents)
    setEvents(savedEvents)
  }, [])

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

    // Create new event with proper date objects
    const newEvent = {
      ...eventData,
      id: selectedEvent?.id || crypto.randomUUID(),
      start: new Date(eventData.start!),
      end: new Date(eventData.end!),
      reminders: eventData.reminders?.map(reminder => ({
        ...reminder,
        time: new Date(reminder.time)
      }))
    } as Event

    // Save event
    const saved = saveCalendarEvent(newEvent)
    if (saved) {
      // Update local state
      const updatedEvents = selectedEvent?.id
        ? events.map(event => event.id === selectedEvent.id ? newEvent : event)
        : [...events, newEvent]
      
      setEvents(updatedEvents)
      setIsDialogOpen(false)
    } else {
      alert('Error saving event')
    }
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

  const confirmDelete = () => {
    if (eventToDelete?.id) {
      const deleted = deleteCalendarEvent(eventToDelete.id)
      if (deleted) {
        setEvents(events.filter(e => e.id !== eventToDelete.id))
        setEventToDelete(null)
        setShowDeleteDialog(false)
        setIsDialogOpen(false)
      } else {
        alert('Error deleting event')
      }
    }
  }

  const handleDeleteEvent = (event: Event) => {
    if (event.id) {
      setEventToDelete(event)
      setShowDeleteDialog(true)
    }
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all events? This cannot be undone.')) {
      setEvents([]);
      localStorage.removeItem('calendarEvents');
    }
  };

  return (
    <div className="p-6 h-full">
      <div className="max-w-[1400px] mx-auto bg-white rounded-lg shadow-sm border h-full">
        <button
          onClick={() => {
            const saved = localStorage.getItem('calendarEvents')
            console.log('Current localStorage events:', saved)
            console.log('Current state events:', events)
          }}
          className="mb-4 px-4 py-2 bg-gray-100 rounded"
        >
          Debug: Check Events
        </button>

        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={handleClearAll}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-transparent rounded-full hover:bg-red-100"
          >
            Clear All Events
          </button>
        </div>
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
            toolbar: (props) => (
              <CustomToolbar
                {...props}
                setEvents={setEvents}
                view={view}
                onView={setView}
                date={date}
                onNavigate={(newDate) => setDate(newDate)}
              />
            )
          }}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
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

        <AlertDialog open={showDeleteDialog} onOpenChange={() => setShowDeleteDialog(false)}>
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
    </div>
  )
}

const calendarStyles = {
  className: "h-full p-4",
  style: {
    minHeight: 'calc(100vh - 200px)',
  },
  dayPropGetter: (date: Date) => ({
    className: 'hover:bg-blue-50 cursor-pointer transition-colors',
    style: {
      margin: 0,
      padding: '8px',
      border: '1px solid #e5e7eb',
      backgroundColor: '#fff',
    },
  }),
  dayHeaderStyle: {
    backgroundColor: '#f3f4f6',
    padding: '8px',
    borderBottom: '1px solid #e5e7eb',
  },
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

const CustomToolbar = ({ 
  setEvents, 
  date, 
  view, 
  onNavigate, 
  onView, 
  label 
}: CustomToolbarProps) => {

  const handleNavigation = (direction: 'PREV' | 'NEXT') => {
    const newDate = new Date(date);
    
    switch(view) {
      case 'day':
        // Add or subtract one day
        newDate.setDate(date.getDate() + (direction === 'NEXT' ? 1 : -1));
        break;
      case 'week':
        // Add or subtract one week
        newDate.setDate(date.getDate() + (direction === 'NEXT' ? 7 : -7));
        break;
      case 'month':
        // Add or subtract one month
        newDate.setMonth(date.getMonth() + (direction === 'NEXT' ? 1 : -1));
        break;
    }
    onNavigate(newDate);
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex gap-2">
        <button
          onClick={() => onNavigate(new Date())}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Today
        </button>
        <button
          onClick={() => handleNavigation('PREV')}
          className="p-2 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleNavigation('NEXT')}
          className="p-2 text-gray-600 hover:text-gray-900"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <span className="text-lg font-semibold text-gray-900">{label}</span>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onView('month')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            view === 'month' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Month
        </button>
        <button
          onClick={() => onView('week')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            view === 'week' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Week
        </button>
        <button
          onClick={() => onView('day')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            view === 'day' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Day
        </button>
      </div>
    </div>
  );
};
