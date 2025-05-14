import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import { SessionItem } from "@/components/dashboard/session-item";
import { Session } from "@/lib/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function SessionsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [cancelSessionId, setCancelSessionId] = useState<number | null>(null);
  const [rescheduleSession, setRescheduleSession] = useState<Session | null>(null);
  const { toast } = useToast();

  // Fetch sessions from API
  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
    enabled: false, // Disabled for demo
  });

  // Cancel session mutation
  const cancelMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      await apiRequest("POST", `/api/sessions/${sessionId}/cancel`);
    },
    onSuccess: () => {
      toast({
        title: "Session cancelled",
        description: "Your session has been cancelled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      setCancelSessionId(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to cancel session",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mock session data for demo
  const mockSessions: Session[] = [
    {
      id: 1,
      learnerId: 1,
      tutorId: 2,
      tutorName: "John Doe",
      courseName: "Programming Fundamentals",
      date: "2023-07-25",
      startTime: "3:00 PM",
      endTime: "5:00 PM",
      location: "Library, 2nd Floor",
      status: "confirmed",
      paymentStatus: "paid",
      amount: 100,
    },
    {
      id: 2,
      learnerId: 1,
      tutorId: 3,
      tutorName: "Sarah Amoah",
      courseName: "Calculus I Review",
      date: "2023-07-28",
      startTime: "10:00 AM",
      endTime: "12:00 PM",
      location: "Mathematics Department, Room 103",
      status: "pending",
      paymentStatus: "pending",
      amount: 90,
    },
    {
      id: 3,
      learnerId: 1,
      tutorId: 5,
      tutorName: "Kwame Owusu",
      courseName: "Physics Mechanics",
      date: "2023-07-15",
      startTime: "2:00 PM",
      endTime: "4:00 PM",
      location: "Physics Lab",
      status: "completed",
      paymentStatus: "paid",
      amount: 110,
    },
    {
      id: 4,
      learnerId: 1,
      tutorId: 4,
      tutorName: "Ama Osei",
      courseName: "Chemistry Fundamentals",
      date: "2023-07-10",
      startTime: "1:00 PM",
      endTime: "3:00 PM",
      location: "Chemistry Building Room 201",
      status: "cancelled",
      paymentStatus: "refunded",
      amount: 85,
    },
  ];

  const handleCancelSession = (session: Session) => {
    setCancelSessionId(session.id);
  };

  const confirmCancel = () => {
    if (cancelSessionId) {
      cancelMutation.mutate(cancelSessionId);
    }
  };

  const handleRescheduleSession = (session: Session) => {
    setRescheduleSession(session);
    toast({
      title: "Reschedule Session",
      description: "This feature will be available soon.",
    });
  };

  // Filter sessions based on active tab
  const filterSessions = (sessions: Session[]) => {
    switch (activeTab) {
      case "upcoming":
        return sessions.filter((session) => session.status === "confirmed" || session.status === "pending");
      case "completed":
        return sessions.filter((session) => session.status === "completed");
      case "cancelled":
        return sessions.filter((session) => session.status === "cancelled");
      default:
        return sessions;
    }
  };

  const displaySessions = sessions || mockSessions;
  const filteredSessions = filterSessions(displaySessions);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="pt-16 flex flex-1">
        <Sidebar />
        
        <div className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <main className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Sessions</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Manage your tutoring sessions
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
            </Tabs>

            {isLoading ? (
              <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:p-6">
                  <div className="animate-pulse flex space-x-4">
                    <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12"></div>
                    <div className="flex-1 space-y-4 py-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : filteredSessions.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredSessions.map((session) => (
                    <li key={session.id}>
                      <SessionItem
                        session={session}
                        onReschedule={handleRescheduleSession}
                        onCancel={handleCancelSession}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No sessions found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {activeTab === "upcoming" 
                    ? "You don't have any upcoming sessions. Book a tutor to get started."
                    : activeTab === "completed"
                    ? "You haven't completed any sessions yet."
                    : "No cancelled sessions."}
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
      
      <Footer />

      {/* Cancel Session Dialog */}
      <AlertDialog open={cancelSessionId !== null} onOpenChange={() => setCancelSessionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this session? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
