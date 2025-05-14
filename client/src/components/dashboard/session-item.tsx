import { Button } from "@/components/ui/button";
import { Session } from "@/lib/types";
import { formatDistance } from "date-fns";
import { Calendar, Clock, MapPin } from "lucide-react";

type SessionItemProps = {
  session: Session;
  onReschedule?: (session: Session) => void;
  onCancel?: (session: Session) => void;
};

export function SessionItem({ session, onReschedule, onCancel }: SessionItemProps) {
  const { 
    id, 
    tutorName, 
    learnerName,
    courseName, 
    date, 
    startTime, 
    endTime, 
    location, 
    status 
  } = session;

  // Format date for display
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Set the background color based on status
  const statusColors = {
    confirmed: "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100",
    pending: "bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100",
    completed: "bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100",
    cancelled: "bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100"
  };

  const statusColor = statusColors[status] || statusColors.pending;

  return (
    <div className="px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-800 font-medium">
                {tutorName ? getInitials(tutorName) : "??"}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-primary-600 dark:text-primary-400">{courseName || "Untitled Session"}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">with {tutorName}</div>
          </div>
        </div>
        <div className="ml-2 flex-shrink-0 flex">
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>
      <div className="mt-2 sm:flex sm:justify-between">
        <div className="sm:flex">
          <div className="mr-6 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <p>{formattedDate}</p>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
            <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <p>{startTime} - {endTime}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
          <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
          <p>{location}</p>
        </div>
      </div>
      {(status === "confirmed" || status === "pending") && (
        <div className="mt-2 flex justify-end space-x-2">
          {status === "confirmed" && onReschedule && (
            <Button 
              variant="default" 
              size="sm"
              onClick={() => onReschedule(session)}
            >
              Reschedule
            </Button>
          )}
          {onCancel && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onCancel(session)}
              className="text-red-700 dark:text-red-400"
            >
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
