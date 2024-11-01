interface CalendarEvent {
  id: string;
  title?: string;
  start: Date;
  end: Date;
  description?: string;
  isAllDay?: boolean;
  reminderType?: 'alert' | 'reminder';
  reminderTime?: string;
  reminders?: Array<{
    id: string;
    type: 'alert' | 'reminder';
    time: Date;
    status: 'pending' | 'sent' | 'dismissed';
  }>;
}

export const saveCalendarEvent = (event: CalendarEvent) => {
  try {
    // Get existing events
    const existingEvents = localStorage.getItem('calendarEvents');
    let events = existingEvents ? JSON.parse(existingEvents) : [];
    
    // Add or update event
    const eventIndex = events.findIndex((e: CalendarEvent) => e.id === event.id);
    if (eventIndex >= 0) {
      events[eventIndex] = event;
    } else {
      events.push(event);
    }
    
    // Save back to localStorage
    localStorage.setItem('calendarEvents', JSON.stringify(events));
    return true;
  } catch (error) {
    console.error('Error saving calendar event:', error);
    return false;
  }
};

export const getCalendarEvents = () => {
  try {
    const events = localStorage.getItem('calendarEvents');
    if (!events) return [];
    
    return JSON.parse(events).map((event: any) => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
      reminders: event.reminders?.map((reminder: any) => ({
        ...reminder,
        time: new Date(reminder.time)
      }))
    }));
  } catch (error) {
    console.error('Error getting calendar events:', error);
    return [];
  }
};

export const deleteCalendarEvent = (eventId: string) => {
  try {
    const events = getCalendarEvents();
    const filteredEvents = events.filter(event => event.id !== eventId);
    localStorage.setItem('calendarEvents', JSON.stringify(filteredEvents));
    return true;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return false;
  }
}; 