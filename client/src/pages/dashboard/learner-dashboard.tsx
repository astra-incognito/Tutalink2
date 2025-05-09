import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { TutorCard } from "@/components/cards/tutor-card";
import { BookingCard } from "@/components/cards/booking-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Calendar, Star, Users, BadgeHelp, Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { localStorageKeys, getLocalStorageItem, setLocalStorageItem } from "@/lib/local-storage";

interface BookingData {
  id: number;
  tutorId: number;
  learnerId: number;
  courseId: number;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: string;
  notes?: string;
  tutor: {
    id: number;
    fullName: string;
    profilePicture?: string;
  };
  course: {
    id: number;
    name: string;
    code: string;
  };
}

interface TutorData {
  id: number;
  fullName: string;
  profilePicture?: string;
  bio?: string;
  courses: {
    id: number;
    name: string;
    department: string;
    code: string;
    description?: string;
  }[];
  reviewCount: number;
  averageRating: number;
}

export default function LearnerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Get learner's bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery<BookingData[]>({
    queryKey: ["bookings", "learner", user?.id],
    queryFn: async () => {
      // Try to get bookings from localStorage first
      const storedBookings = getLocalStorageItem<BookingData[]>(localStorageKeys.BOOKINGS);
      if (storedBookings) {
        return storedBookings.filter(booking => booking.learnerId === user?.id);
      }
      
      // If no stored bookings, fetch from API
      try {
        const res = await apiRequest("GET", `/api/bookings/learner/${user?.id}`);
        const data = await res.json();
        // Store in localStorage
        setLocalStorageItem(localStorageKeys.BOOKINGS, data);
        return data;
      } catch (error) {
        console.error("Failed to fetch bookings", error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Get recommended tutors
  const { data: tutors, isLoading: tutorsLoading } = useQuery<TutorData[]>({
    queryKey: ["tutors"],
    queryFn: async () => {
      // Try to get tutors from localStorage first
      const storedTutors = getLocalStorageItem<TutorData[]>(localStorageKeys.TUTORS);
      if (storedTutors) {
        // Return a subset for recommendations
        return storedTutors.slice(0, 3);
      }
      
      // If no stored tutors, fetch from API
      try {
        const res = await apiRequest("GET", "/api/tutors");
        const data = await res.json();
        // Store in localStorage
        setLocalStorageItem(localStorageKeys.TUTORS, data);
        // Return a subset for recommendations
        return data.slice(0, 3);
      } catch (error) {
        console.error("Failed to fetch tutors", error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Filter upcoming and past bookings
  const upcomingBookings = bookings?.filter(booking => 
    booking.status === "accepted" && new Date(booking.date) >= new Date()
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const pendingBookings = bookings?.filter(booking => booking.status === "pending");
  
  const completedBookings = bookings?.filter(booking => 
    booking.status === "completed" || (booking.status === "accepted" && new Date(booking.date) < new Date())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarNav />
      
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Learner Dashboard</h1>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bookings">My Bookings</TabsTrigger>
              <TabsTrigger value="tutors">Find Tutors</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants}>
                  <Card className="mb-6">
                    <CardHeader className="pb-4">
                      <CardTitle>Welcome back, {user.fullName}!</CardTitle>
                      <CardDescription>
                        Here's an overview of your recent activity and upcoming sessions.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="p-2 bg-primary-50 rounded-md">
                            <Calendar className="h-6 w-6 text-primary-500" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Upcoming Sessions</p>
                            <p className="text-3xl font-semibold text-gray-900">
                              {upcomingBookings?.length || 0}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="p-2 bg-green-50 rounded-md">
                            <BadgeHelp className="h-6 w-6 text-green-500" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                            <p className="text-3xl font-semibold text-gray-900">
                              {pendingBookings?.length || 0}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-50 rounded-md">
                            <Star className="h-6 w-6 text-blue-500" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Completed Sessions</p>
                            <p className="text-3xl font-semibold text-gray-900">
                              {completedBookings?.length || 0}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="p-2 bg-purple-50 rounded-md">
                            <Users className="h-6 w-6 text-purple-500" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Available Tutors</p>
                            <p className="text-3xl font-semibold text-gray-900">
                              {tutors?.length || 0}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
                
                {/* Upcoming Sessions */}
                <motion.div variants={itemVariants}>
                  <Card className="mb-6">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle>Upcoming Sessions</CardTitle>
                        <Link href="/bookings">
                          <Button variant="ghost" size="sm">View all</Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {bookingsLoading ? (
                        <div className="flex justify-center p-6">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : upcomingBookings && upcomingBookings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {upcomingBookings.slice(0, 2).map((booking) => (
                            <BookingCard
                              key={booking.id}
                              id={booking.id}
                              tutor={booking.tutor}
                              learner={{ id: user.id, fullName: user.fullName, profilePicture: user.profilePicture }}
                              course={booking.course}
                              date={booking.date}
                              startTime={booking.startTime}
                              endTime={booking.endTime}
                              location={booking.location}
                              status={booking.status as any}
                              notes={booking.notes}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-6">
                          <p className="text-gray-500">You have no upcoming sessions.</p>
                          <Link href="/tutors">
                            <Button className="mt-4">Find a tutor</Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
                
                {/* Recommended Tutors */}
                <motion.div variants={itemVariants}>
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle>Recommended Tutors</CardTitle>
                        <Link href="/tutors">
                          <Button variant="ghost" size="sm">View all</Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {tutorsLoading ? (
                        <div className="flex justify-center p-6">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : tutors && tutors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {tutors.map((tutor) => (
                            <TutorCard
                              key={tutor.id}
                              id={tutor.id}
                              fullName={tutor.fullName}
                              profilePicture={tutor.profilePicture}
                              bio={tutor.bio}
                              courses={tutor.courses}
                              averageRating={tutor.averageRating}
                              reviewCount={tutor.reviewCount}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-6">
                          <p className="text-gray-500">No tutors available at the moment.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>
            
            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants}>
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>My Bookings</CardTitle>
                      <CardDescription>
                        Manage your tutorial sessions and booking requests
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="upcoming">
                        <TabsList className="mb-4">
                          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                          <TabsTrigger value="pending">Pending</TabsTrigger>
                          <TabsTrigger value="completed">Completed</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="upcoming">
                          {bookingsLoading ? (
                            <div className="flex justify-center p-6">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                          ) : upcomingBookings && upcomingBookings.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {upcomingBookings.map((booking) => (
                                <BookingCard
                                  key={booking.id}
                                  id={booking.id}
                                  tutor={booking.tutor}
                                  learner={{ id: user.id, fullName: user.fullName, profilePicture: user.profilePicture }}
                                  course={booking.course}
                                  date={booking.date}
                                  startTime={booking.startTime}
                                  endTime={booking.endTime}
                                  location={booking.location}
                                  status={booking.status as any}
                                  notes={booking.notes}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="text-center p-6">
                              <p className="text-gray-500">You have no upcoming sessions.</p>
                              <Link href="/tutors">
                                <Button className="mt-4">Find a tutor</Button>
                              </Link>
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="pending">
                          {bookingsLoading ? (
                            <div className="flex justify-center p-6">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                          ) : pendingBookings && pendingBookings.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {pendingBookings.map((booking) => (
                                <BookingCard
                                  key={booking.id}
                                  id={booking.id}
                                  tutor={booking.tutor}
                                  learner={{ id: user.id, fullName: user.fullName, profilePicture: user.profilePicture }}
                                  course={booking.course}
                                  date={booking.date}
                                  startTime={booking.startTime}
                                  endTime={booking.endTime}
                                  location={booking.location}
                                  status={booking.status as any}
                                  notes={booking.notes}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="text-center p-6">
                              <p className="text-gray-500">You have no pending booking requests.</p>
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="completed">
                          {bookingsLoading ? (
                            <div className="flex justify-center p-6">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                          ) : completedBookings && completedBookings.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {completedBookings.map((booking) => (
                                <BookingCard
                                  key={booking.id}
                                  id={booking.id}
                                  tutor={booking.tutor}
                                  learner={{ id: user.id, fullName: user.fullName, profilePicture: user.profilePicture }}
                                  course={booking.course}
                                  date={booking.date}
                                  startTime={booking.startTime}
                                  endTime={booking.endTime}
                                  location={booking.location}
                                  status="completed"
                                  notes={booking.notes}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="text-center p-6">
                              <p className="text-gray-500">You have no completed sessions yet.</p>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>
            
            {/* Find Tutors Tab */}
            <TabsContent value="tutors">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants}>
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Find Tutors</CardTitle>
                      <CardDescription>
                        Discover tutors who can help you master your courses
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search by name, course, or topic..."
                            className="w-full pl-10 pr-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        <Link href="/tutors">
                          <Button className="whitespace-nowrap">
                            See All Filters
                          </Button>
                        </Link>
                      </div>
                      
                      {tutorsLoading ? (
                        <div className="flex justify-center p-6">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : tutors && tutors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {tutors.map((tutor) => (
                            <TutorCard
                              key={tutor.id}
                              id={tutor.id}
                              fullName={tutor.fullName}
                              profilePicture={tutor.profilePicture}
                              bio={tutor.bio}
                              courses={tutor.courses}
                              averageRating={tutor.averageRating}
                              reviewCount={tutor.reviewCount}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-6">
                          <p className="text-gray-500">No tutors match your search criteria.</p>
                        </div>
                      )}
                      
                      <div className="mt-6 text-center">
                        <Link href="/tutors">
                          <Button variant="outline">View All Tutors</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
