import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from 'date-fns'

interface AlertsRemindersCardProps {
  reminders: Reminder[]
  onDismiss: (reminderId: string) => void
}

export function AlertsRemindersCard({ reminders, onDismiss }: AlertsRemindersCardProps) {
  console.log('All reminders:', reminders) // Log all reminders
  
  const pendingReminders = reminders
    .filter(r => r.status === 'pending')
    .sort((a, b) => a.time.getTime() - b.time.getTime())
    
  console.log('Pending reminders:', pendingReminders) // Log filtered reminders

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Alerts & Reminders ({pendingReminders.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingReminders.length === 0 ? (
          <p className="text-sm text-gray-500">No upcoming alerts or reminders</p>
        ) : (
          <div className="space-y-4">
            {pendingReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {reminder.type === 'alert' ? '🔔' : '📝'}
                  </span>
                  <div>
                    <p className="font-medium text-sm">{reminder.eventTitle}</p>
                    <p className="text-sm text-gray-500">
                      Due {formatDistanceToNow(new Date(reminder.time), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onDismiss(reminder.id)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
