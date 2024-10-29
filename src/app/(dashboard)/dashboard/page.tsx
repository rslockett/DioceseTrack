'use client';
import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Church, 
  ChevronRight, 
  FileText, 
  ArrowUp,
  Bell, 
  Calendar, 
  Clock, 
  X, 
  AlertTriangle, 
  CheckCircle,
  Building2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getStoredEvents } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { Button } from "@/components/ui/button";

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

type NotificationStatus = 'upcoming' | 'overdue' | 'cleared';

interface ProcessedNotification {
  id: string;
  type: 'alert' | 'reminder';
  time: Date;
  eventTitle: string;
  eventStart: Date;
  status: NotificationStatus;
}

interface Clergy {
  id: string;
  name: string;
  birthday?: Date;
  patronSaintDay?: {
    date: Date;
    saint: string;
  };
  // ... other clergy properties
}

const StatCard = ({ title, value, subtitle, icon: Icon, trend }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        {trend && (
          <div className="flex items-center text-green-600 text-sm">
            <ArrowUp className="h-4 w-4 mr-1" />
            {trend}
          </div>
        )}
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-1">{value}</h2>
        <p className="text-sm font-medium text-gray-800">{title}</p>
        {subtitle && (
          <p className="text-xs text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [clearedNotifications, setClearedNotifications] = useState<string[]>([]);
  const [stats, setStats] = useState({
    clergyCount: 0,
    parishCount: 0,
    deaneryCount: 0,
    documentCount: 0
  });
  const [showNotifications, setShowNotifications] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [clergyList, setClergyList] = useState<Clergy[]>([]);

  // Load cleared notifications from localStorage on client-side only
  useEffect(() => {
    const saved = localStorage.getItem('clearedNotifications');
    if (saved) {
      setClearedNotifications(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const storedEvents = getStoredEvents();
    setEvents(storedEvents);
  }, []);

  // Get upcoming events (next 7 days)
  const upcomingEvents = events
    .filter(event => {
      const eventDate = new Date(event.start);
      const now = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      return eventDate >= now && eventDate <= sevenDaysFromNow;
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  // Updated alerts and reminders logic
  const alertsAndReminders = events
    .filter(event => event.reminders && event.reminders.length > 0)
    .flatMap(event => 
      event.reminders!.map(reminder => {
        const reminderTime = new Date(reminder.time);
        const eventStart = new Date(event.start);
        const now = new Date();

        // Calculate if the notification is overdue
        let status: NotificationStatus = 'upcoming';
        if (clearedNotifications.includes(reminder.id)) {
          status = 'cleared';
        } else if (reminderTime < now) {
          status = 'overdue';
        }

        return {
          id: reminder.id,
          type: reminder.type,
          time: reminderTime,
          eventTitle: event.title || 'Untitled Event',
          eventStart: eventStart,
          status
        } as ProcessedNotification;
      })
    )
    .filter(notification => notification.status !== 'cleared')
    .sort((a, b) => {
      // Sort overdue items first, then by time
      if (a.status !== b.status) {
        return a.status === 'overdue' ? -1 : 1;
      }
      return a.time.getTime() - b.time.getTime();
    });

  // Function to handle clearing notifications
  const handleClearNotification = (notificationId: string) => {
    const newClearedNotifications = [...clearedNotifications, notificationId];
    setClearedNotifications(newClearedNotifications);
    localStorage.setItem('clearedNotifications', JSON.stringify(newClearedNotifications));
  };

  // Fetch stats when component mounts
  useEffect(() => {
    const fetchStats = () => {
      try {
        // Get clergy data
        const clergyData = localStorage.getItem('clergy') || 
                          localStorage.getItem('clergyData') ||
                          localStorage.getItem('clergyList') || '[]';
        
        // Get parishes data
        const parishData = localStorage.getItem('parishes') || 
                          localStorage.getItem('parishData') ||
                          localStorage.getItem('parishList') || '[]';
        
        // Get documents data
        const documentData = localStorage.getItem('documents') || 
                            localStorage.getItem('documentData') ||
                            localStorage.getItem('documentList') || '[]';

        // Get deaneries data
        const deaneryData = localStorage.getItem('deaneries') || 
                           localStorage.getItem('deaneryData') ||
                           localStorage.getItem('deaneryList') || '[]';

        // Parse the data
        const clergy = JSON.parse(clergyData);
        const parishes = JSON.parse(parishData);
        const documents = JSON.parse(documentData);
        const deaneries = JSON.parse(deaneryData);

        // Update stats
        setStats({
          clergyCount: clergy.length || 0,
          parishCount: parishes.length || 0,
          deaneryCount: deaneries.length || 0,
          documentCount: documents.length || 0
        });

      } catch (error) {
        console.error('Error parsing data:', error);
      }
    };

    fetchStats();
  }, []);

  // Update your stats array to use real data
  const statsCards = [
    {
      title: "Total Clergy",
      value: stats.clergyCount.toString(),
      subtitle: "Active clergy members",
      icon: Users
    },
    {
      title: "Active Parishes",
      value: stats.parishCount.toString(),
      subtitle: "Registered parishes",
      icon: Church
    },
    {
      title: "Active Deaneries",
      value: stats.deaneryCount.toString(),
      subtitle: "Current deaneries",
      icon: Building2
    },
    {
      title: "Documents",
      value: stats.documentCount.toString(),
      subtitle: "Total documents",
      icon: FileText
    }
  ];

  useEffect(() => {
    // Show notifications when dashboard loads
    setShowNotifications(true)
  }, [])

  useEffect(() => {
    // Fetch clergy data
    const savedClergy = localStorage.getItem('clergy');
    if (savedClergy) {
      const parsedClergy = JSON.parse(savedClergy);
      setClergyList(parsedClergy);
    }
  }, []);

  // Function to get upcoming dates
  const getUpcomingDates = (dateList: Date[], daysAhead: number = 30) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);
    
    return dateList
      .filter(date => {
        const thisYear = new Date(date);
        thisYear.setFullYear(today.getFullYear());
        if (thisYear < today) {
          thisYear.setFullYear(today.getFullYear() + 1);
        }
        return thisYear >= today && thisYear <= futureDate;
      })
      .sort((a, b) => a.getTime() - b.getTime());
  };

  // Get upcoming birthdays and patron saint days
  const upcomingBirthdays = clergyList
    .filter(clergy => clergy.birthday)
    .map(clergy => ({
      date: new Date(clergy.birthday!),
      name: clergy.name,
      type: 'birthday'
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const upcomingPatronSaintDays = clergyList
    .filter(clergy => clergy.patronSaintDay)
    .map(clergy => ({
      date: new Date(clergy.patronSaintDay!.date),
      name: clergy.name,
      saint: clergy.patronSaintDay!.saint,
      type: 'patron'
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const NotificationsPopup = ({ notifications, onClose, onClearNotification }) => {
    return (
      <div
        className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 transition-all duration-300 ease-in-out ${
          isMinimized 
            ? 'w-auto' 
            : 'w-96'
        }`}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">
                Alerts & Reminders ({notifications.length})
              </h3>
            </div>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isMinimized ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        
        {!isMinimized && (
          <>
            <div className="max-h-[60vh] overflow-y-auto">
              <div className="p-4 space-y-3">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg transition-colors ${
                      notification.type === 'alert'
                        ? 'bg-amber-50 border border-amber-100'
                        : 'bg-blue-50 border border-blue-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5">
                          {notification.type === 'alert' 
                            ? <AlertTriangle className="h-4 w-4 text-amber-600" />
                            : <Bell className="h-4 w-4 text-blue-600" />
                          }
                        </span>
                        <div>
                          <p className="font-medium text-sm">
                            {notification.eventTitle}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {formatDistanceToNow(notification.time, { addSuffix: true })}
                          </p>
                          <p className="text-xs text-gray-500">
                            Event {formatDistanceToNow(notification.eventStart, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => onClearNotification(notification.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {notifications.length === 0 && (
              <div className="p-4 text-center text-gray-500 text-sm">
                No notifications
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-4">
          {!showNotifications && alertsAndReminders.length > 0 && (
            <button
              onClick={() => setShowNotifications(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
            >
              <Bell className="h-4 w-4" />
              <span className="text-sm">
                {alertsAndReminders.length} notification{alertsAndReminders.length !== 1 ? 's' : ''}
              </span>
            </button>
          )}
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Export Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {statsCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Activity and Events Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events Card - Left Side */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-gray-500">
                        {event.isAllDay 
                          ? new Date(event.start).toLocaleDateString()
                          : new Date(event.start).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-sm text-blue-600">
                      {formatDistanceToNow(new Date(event.start), { addSuffix: true })}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No upcoming events</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Clergy Celebrations Card - Right Side */}
        <Card>
          <CardHeader>
            <CardTitle>Clergy Celebrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Patron Saint Days Section */}
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-3">
                  Upcoming Patron Saint Days
                </h3>
                <div className="space-y-3">
                  {upcomingPatronSaintDays.length > 0 ? (
                    upcomingPatronSaintDays.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.saint}
                          </p>
                        </div>
                        <span className="text-sm text-blue-600">
                          {format(new Date(item.date), 'MMM d')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No upcoming patron saint days</p>
                  )}
                </div>
              </div>

              {/* Birthdays Section */}
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-3">
                  Upcoming Birthdays
                </h3>
                <div className="space-y-3">
                  {upcomingBirthdays.length > 0 ? (
                    upcomingBirthdays.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            Birthday
                          </p>
                        </div>
                        <span className="text-sm text-blue-600">
                          {format(new Date(item.date), 'MMM d')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No upcoming birthdays</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Popup */}
      {showNotifications && alertsAndReminders.length > 0 && (
        <NotificationsPopup
          notifications={alertsAndReminders}
          onClose={() => setShowNotifications(false)}
          onClearNotification={handleClearNotification}
        />
      )}
    </div>
  );
};

export default Dashboard;
