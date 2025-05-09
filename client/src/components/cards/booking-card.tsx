import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  CheckCircle,
  XCircle,
  Star,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Person {
  id: number;
  fullName: string;
  profilePicture?: string;
}

interface Course {
  id: number;
  name: string;
  code: string;
}

interface BookingCardProps {
  id: number;
  tutor: Person;
  learner: Person;
  course: Course;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  notes?: string;
  isTutor?: boolean;
  onAccept?: (id: number) => void;
  onReject?: (id: number, reason: string) => void;
  onCancel?: (id: number, reason: string) => void;
  onComplete?: (id: number) => void;
}

export function BookingCard({
  id,
  tutor,
  learner,
  course,
  date,
  startTime,
  endTime,
  location,
  status,
  notes,
  isTutor = false,
  onAccept,
  onReject,
  onCancel,
  onComplete
}: BookingCardProps) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  
  // Format date with proper date formatting
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Helper function to get status badge color
  const getStatusBadge = () => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertCircle className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "accepted":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            Confirmed
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            <Star className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      default:
        return null;
    }
  };
  
  const handleReject = () => {
    if (onReject && rejectReason.trim()) {
      onReject(id, rejectReason);
      setRejectDialogOpen(false);
      setRejectReason("");
    }
  };
  
  const handleCancel = () => {
    if (onCancel && cancelReason.trim()) {
      onCancel(id, cancelReason);
      setCancelDialogOpen(false);
      setCancelReason("");
    }
  };
  
  // Function to determine if a session is happening today
  const isToday = () => {
    const today = new Date();
    const bookingDate = new Date(date);
    
    return (
      today.getFullYear() === bookingDate.getFullYear() &&
      today.getMonth() === bookingDate.getMonth() &&
      today.getDate() === bookingDate.getDate()
    );
  };
  
  // Function to determine if a session is upcoming (in the future)
  const isUpcoming = () => {
    const today = new Date();
    const bookingDate = new Date(date);
    
    return bookingDate > today;
  };
  
  // Determine card highlight style based on status and date
  const getCardHighlightStyle = () => {
    if (status === "pending") return "border-l-4 border-l-yellow-400";
    if (status === "rejected") return "border-l-4 border-l-red-400";
    if (status === "completed") return "border-l-4 border-l-blue-400";
    
    // For accepted bookings, highlight based on date
    if (isToday()) return "border-l-4 border-l-primary-500";
    if (isUpcoming()) return "border-l-4 border-l-green-400";
    
    return "";
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className={cn("h-full overflow-hidden", getCardHighlightStyle())}>
        <CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={isTutor ? learner.profilePicture : tutor.profilePicture} 
                  alt={isTutor ? learner.fullName : tutor.fullName} 
                />
                <AvatarFallback>
                  {isTutor 
                    ? learner.fullName.split(" ").map(n => n[0]).join("")
                    : tutor.fullName.split(" ").map(n => n[0]).join("")
                  }
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <h3 className="font-medium text-gray-900 text-base">
                  {isTutor ? `Session with ${learner.fullName}` : `Session with ${tutor.fullName}`}
                </h3>
                <p className="text-sm text-gray-500">
                  {course.name} ({course.code})
                </p>
              </div>
            </div>
            {getStatusBadge()}
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="mr-2 h-4 w-4 text-gray-400" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="mr-2 h-4 w-4 text-gray-400" />
              <span>{startTime} - {endTime}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="mr-2 h-4 w-4 text-gray-400" />
              <span>{location}</span>
            </div>
          </div>
          
          {notes && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-sm text-gray-600">
                <MessageSquare className="mr-2 h-4 w-4 text-gray-400" />
                <span className="font-medium">Notes</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{notes}</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-4 bg-gray-50 border-t flex-wrap gap-2">
          {/* Tutor Actions */}
          {isTutor && status === "pending" && (
            <div className="flex space-x-2 w-full">
              <Button
                className="flex-1"
                onClick={() => onAccept && onAccept(id)}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Accept
              </Button>
              
              <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reject Booking</DialogTitle>
                    <DialogDescription>
                      Please provide a reason for rejecting this booking request.
                    </DialogDescription>
                  </DialogHeader>
                  <Textarea
                    placeholder="I'm not available at this time..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleReject}
                      disabled={!rejectReason.trim()}
                    >
                      Reject Booking
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
          
          {/* Tutor Actions for accepted bookings */}
          {isTutor && status === "accepted" && (
            <div className="flex space-x-2 w-full">
              <Button
                className="flex-1"
                onClick={() => onComplete && onComplete(id)}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Completed
              </Button>
            </div>
          )}
          
          {/* Learner Actions */}
          {!isTutor && status === "pending" && (
            <div className="flex space-x-2 w-full">
              <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Request
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Booking Request</DialogTitle>
                    <DialogDescription>
                      Please provide a reason for canceling this booking request.
                    </DialogDescription>
                  </DialogHeader>
                  <Textarea
                    placeholder="I no longer need tutoring for this subject..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                      Back
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleCancel}
                      disabled={!cancelReason.trim()}
                    >
                      Cancel Booking
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
          
          {/* Learner Actions for completed bookings */}
          {!isTutor && status === "completed" && (
            <div className="flex space-x-2 w-full">
              <Link href={`/review/${id}`}>
                <Button className="flex-1">
                  <Star className="mr-2 h-4 w-4" />
                  Leave a Review
                </Button>
              </Link>
            </div>
          )}
          
          {/* Common action - view details */}
          {status !== "pending" && !(status === "completed" && !isTutor) && (
            <div className="flex w-full">
              <Link href={`/bookings/${id}`}>
                <Button variant="secondary" className="w-full">
                  View Details
                </Button>
              </Link>
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
