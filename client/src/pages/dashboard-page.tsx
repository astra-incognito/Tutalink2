import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { StatsCard } from "@/components/dashboard/stats-card";
import { TutorCard } from "@/components/dashboard/tutor-card";
import { SessionItem } from "@/components/dashboard/session-item";
import { ReviewItem } from "@/components/dashboard/review-item";
import { SearchTutors } from "@/components/dashboard/search-tutors";
import { Session, Tutor, Review } from "@/lib/types";
import { Calendar, CheckCheck, Star, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useState({
    course: "",
    department: "",
    rating: "",
    searchQuery: "",
  });

  // Fetch user stats
  const { data: stats } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: false, // Disabled for now, will be enabled when API is ready
  });

  // Fetch recommended tutors
  const { data: recommendedTutors } = useQuery<Tutor[]>({
    queryKey: ["/api/tutors/recommended"],
    enabled: false, // Disabled for now, will be enabled when API is ready
  });
  
  // Fetch upcoming sessions
  const { data: upcomingSessions } = useQuery<Session[]>({
    queryKey: ["/api/sessions/upcoming"],
    enabled: false, // Disabled for now, will be enabled when API is ready
  });
  
  // Fetch recent reviews
  const { data: recentReviews } = useQuery<Review[]>({
    queryKey: ["/api/reviews/recent"],
    enabled: false, // Disabled for now, will be enabled when API is ready
  });

  // Mock data for demo
  const mockStats = {
    bookedSessions: 3,
    completedSessions: 12,
    reviewsGiven: 8,
    walletBalance: 120.00,
  };

  const mockTutors: Tutor[] = [
    {
      id: 1,
      username: "johndoe",
      email: "john@example.com",
      fullName: "John Doe",
      role: "tutor",
      department: "Computer Science",
      yearOfStudy: 3,
      rating: 4.5,
      subjects: ["Programming", "Data Structures", "Algorithms"],
      price: 50,
      availability: [],
      reviews: []
    },
    {
      id: 2,
      username: "sarahamoah",
      email: "sarah@example.com",
      fullName: "Sarah Amoah",
      role: "tutor",
      department: "Mathematics",
      yearOfStudy: 4,
      rating: 5.0,
      subjects: ["Calculus", "Linear Algebra", "Statistics"],
      price: 45,
      availability: [],
      reviews: []
    },
    {
      id: 3,
      username: "kwameowusu",
      email: "kwame@example.com",
      fullName: "Kwame Owusu",
      role: "tutor",
      department: "Physics",
      yearOfStudy: 3,
      rating: 4.0,
      subjects: ["Mechanics", "Electricity", "Modern Physics"],
      price: 55,
      availability: [],
      reviews: []
    }
  ];

  const mockSessions: Session[] = [
    {
      id: 1,
      learnerId: 1,
      tutorId: 2,
      tutorName: "John Doe",
      courseName: "Programming Fundamentals",
      date: "2023-05-20",
      startTime: "3:00 PM",
      endTime: "5:00 PM",
      location: "Library, 2nd Floor",
      status: "confirmed",
      paymentStatus: "paid",
      amount: 100
    },
    {
      id: 2,
      learnerId: 1,
      tutorId: 3,
      tutorName: "Sarah Amoah",
      courseName: "Calculus I Review",
      date: "2023-05-22",
      startTime: "10:00 AM",
      endTime: "12:00 PM",
      location: "Mathematics Department, Room 103",
      status: "pending",
      paymentStatus: "pending",
      amount: 90
    }
  ];

  const mockReviews: Review[] = [
    {
      id: 1,
      learnerId: 1,
      tutorId: 5,
      tutorName: "Kwame Owusu",
      rating: 4,
      comment: "Kwame's explanation of Newton's laws was very clear. He used practical examples that made it easy to understand. Highly recommend for Physics.",
      courseName: "Physics Mechanics",
      createdAt: "2023-05-10T12:00:00Z"
    },
    {
      id: 2,
      learnerId: 3,
      tutorId: 2,
      tutorName: "Sarah Amoah",
      rating: 5,
      comment: "Sarah is an amazing tutor! She helped me understand limits and derivatives in a way my professor couldn't. Patient and knowledgeable.",
      courseName: "Calculus I",
      createdAt: "2023-05-05T14:30:00Z"
    }
  ];

  // Mock courses and departments for search filters
  const mockCourses = [
    { value: "math241", label: "MATH 241 - Calculus I" },
    { value: "phys155", label: "PHYS 155 - Mechanics" },
    { value: "cosc387", label: "COSC 387 - Database Systems" },
    { value: "chem233", label: "CHEM 233 - Organic Chemistry" },
    { value: "econ101", label: "ECON 101 - Principles of Economics" }
  ];

  const mockDepartments = [
    { value: "computer-science", label: "Computer Science" },
    { value: "mathematics", label: "Mathematics" },
    { value: "physics", label: "Physics" },
    { value: "chemistry", label: "Chemistry" },
    { value: "economics", label: "Economics" }
  ];

  const handleSearchTutors = (params: any) => {
    setSearchParams(params);
    toast({
      title: "Search Initiated",
      description: "Searching for tutors with your criteria...",
    });
    // This would normally trigger a fetch with the search parameters
  };

  const handleRescheduleSession = (session: Session) => {
    toast({
      title: "Reschedule Requested",
      description: `You've requested to reschedule your session on ${session.date}`,
    });
  };

  const handleCancelSession = (session: Session) => {
    toast({
      title: "Session Cancelled",
      description: `Your session has been cancelled`,
      variant: "destructive",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="pt-16 flex flex-1">
        <Sidebar />
        
        <div className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <main className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.fullName || user?.username}!
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Find the perfect tutor for your academic needs.
              </p>
            </div>

            {/* Quick Stats Section */}
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Booked Sessions"
                value={stats?.bookedSessions || mockStats.bookedSessions}
                icon={<Calendar />}
              />
              <StatsCard
                title="Completed"
                value={stats?.completedSessions || mockStats.completedSessions}
                icon={<CheckCheck />}
                iconBgColor="bg-green-100 dark:bg-green-700"
                iconColor="text-green-600 dark:text-green-100"
              />
              <StatsCard
                title="Reviews Given"
                value={stats?.reviewsGiven || mockStats.reviewsGiven}
                icon={<Star />}
                iconBgColor="bg-yellow-100 dark:bg-yellow-700"
                iconColor="text-yellow-600 dark:text-yellow-100"
              />
              <StatsCard
                title="Wallet Balance"
                value={`GHS ${stats?.walletBalance || mockStats.walletBalance.toFixed(2)}`}
                icon={<Wallet />}
                iconBgColor="bg-purple-100 dark:bg-purple-700"
                iconColor="text-purple-600 dark:text-purple-100"
              />
            </div>

            {/* Search Tutors Section */}
            <div className="mt-8">
              <SearchTutors 
                onSearch={handleSearchTutors} 
                courses={mockCourses}
                departments={mockDepartments}
              />
            </div>

            {/* Recommended Tutors Section */}
            <div className="mt-8">
              <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Recommended Tutors
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {(recommendedTutors || mockTutors).map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} />
                ))}
              </div>
            </div>

            {/* Upcoming Sessions Section */}
            <div className="mt-8">
              <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Upcoming Sessions
              </h2>
              <div className="mt-4 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                  {(upcomingSessions || mockSessions).map((session) => (
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
            </div>

            {/* Recent Reviews Section */}
            <div className="mt-8 mb-12">
              <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Recent Reviews
              </h2>
              <div className="mt-4 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:p-6">
                  {(recentReviews || mockReviews).map((review) => (
                    <ReviewItem key={review.id} review={review} />
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
