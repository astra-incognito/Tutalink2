import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { BookingCard } from "@/components/cards/booking-card";
import { ReviewCard } from "@/components/cards/review-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Star, Users, Hourglass, CheckCircle, Clock } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { localStorageKeys, getLocalStorageItem, setLocalStorageItem, updateLocalStorageArrayItem } from "@/lib/local-storage";

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
  learner: {
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

interface ReviewData {
  id: number;
  bookingId: number;
  learnerId: number;
  tutorId: number;
  rating: number;
  comment: string;
  createdAt: string;
  learner: {
    id: number;
    fullName: string;
    profilePicture?: string;
  };
}

interface StatsData {
  totalBookings: number;
  pendingBookings: number;
  acceptedBookings: number;
  completedBookings: number;
  totalReviews: number;
  averageRating: number;
}

export default function TutorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Get tutor's bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery<BookingData[]>({
    queryKey: ["bookings", "tutor", user?.id],
    queryFn: async () => {
      try {
        // Try to get bookings from localStorage first
        const storedBookings = getLocalStorageItem<BookingData[]>(localStorageKeys.BOOKINGS);
        if (storedBookings) {
          return storedBookings.filter(booking => booking.tutorId === user?.id);
        }
        
        const res = await apiRequest("GET", `/api/bookings/tutor/${user?.id}`);
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

  // Get tutor's reviews
  const { data: reviews, isLoading: reviewsLoading } = useQuery<ReviewData[]>({
    queryKey: ["reviews", "tutor", user?.id],
    queryFn: async () => {
      try {
        // Try to get reviews from localStorage first
        const storedReviews = getLocalStorageItem<ReviewData[]>(localStorageKeys.REVIEWS);
        if (storedReviews) {
          return storedReviews.filter(review => review.tutorId === user?.id);
        }
        
        const res = await apiRequest("GET", `/api/reviews/tutor/${user?.id}`);
        const data = await res.json();
        // Store in localStorage
        setLocalStorageItem(localStorageKeys.REVIEWS, data);
        return data;
      } catch (error) {
        console.error("Failed to fetch reviews", error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Calculate stats
  const stats: StatsData = {
    totalBookings: bookings?.length || 0,
    pendingBookings: bookings?.filter(b => b.status === "pending").length || 0,
    acceptedBookings: bookings?.filter(b => b.status === "accepted" && new Date(b.date) >= new Date()).length || 0,
    completedBookings: bookings?.filter(b => b.status === "completed" || (b.status === "accepted" && new Date(b.date) < new Date())).length || 0,
    totalReviews: reviews?.length || 0,
    averageRating: reviews?.length 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0,
  };

  // Accept booking mutation
  const acceptBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const res = await apiRequest("PATCH", `/api/bookings/${bookingId}/status`, { status: "accepted" });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "tutor", user?.id] });
      // Update localStorage
      const storedBookings = getLocalStorageItem<BookingData[]>(localStorageKeys.BOOKINGS);
      if (storedBookings) {
        updateLocalStorageArrayItem(localStorageKeys.BOOKINGS, data.id, { status: "accepted" });
      }
      toast({
        title: "Booking accepted",
        description: "You have successfully accepted the booking request.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error accepting booking",
        description: "There was an error accepting the booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Reject booking mutation
  const rejectBookingMutation = useMutation({
    mutationFn: async ({ bookingId, reason }: { bookingId: number; reason: string }) => {
      const res = await apiRequest("PATCH", `/api/bookings/${bookingId}/status`, { 
        status: "rejected",
        notes: reason 
      });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "tutor", user?.id] });
      // Update localStorage
      const storedBookings = getLocalStorageItem<BookingData[]>(localStorageKeys.BOOKINGS);
      if (storedBookings) {
        updateLocalStorageArrayItem(localStorageKeys.BOOKINGS, data.id, { status: "rejected" });
      }
      toast({
        title: "Booking rejected",
        description: "You have successfully rejected the booking request.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error rejecting booking",
        description: "There was an error rejecting the booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Complete booking mutation
  const completeBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const res = await apiRequest("PATCH", `/api/bookings/${bookingId}/status`, { status: "completed" });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "tutor", user?.id] });
      // Update localStorage
      const storedBookings = getLocalStorageItem<BookingData[]>(localStorageKeys.BOOKINGS);
      if (storedBookings) {
        updateLocalStorageArrayItem(localStorageKeys.BOOKINGS, data.id, { status: "completed" });
      }
      toast({
        title: "Session completed",
        description: "You have successfully marked this session as completed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error completing session",
        description: "There was an error marking this session as completed. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter bookings by status
  const pendingBookings = bookings?.filter(b => b.status === "pending");
  const upcomingBookings = bookings?.filter(b => 
    b.status === "accepted" && new Date(b.date) >= new Date()
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const completedBookings = bookings?.filter(b => 
    b.status === "completed" || (b.status === "accepted" && new Date(b.date) < new Date())
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

  // Handle booking actions
  const handleAcceptBooking = (id: number) => {
    acceptBookingMutation.mutate(id);
  };

  const handleRejectBooking = (id: number, reason: string) => {
    rejectBookingMutation.mutate({ bookingId: id, reason });
  };

  const handleCompleteBooking = (id: number) => {
    completeBookingMutation.mutate(id);
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarNav />
      
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Tutor Dashboard</h1>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bookings">Manage Sessions</TabsTrigger>
              <TabsTrigger value="reviews">My Reviews</TabsTrigger>
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
                        Here's an overview of your tutoring activity and upcoming sessions.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="p-2 bg-yellow-50 rounded-md">
                            <Hourglass className="h-6 w-6 text-yellow-500" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                            <p className="text-3xl font-semibold text-gray-900">
                              {stats.pendingBookings}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="p-2 bg-primary-50 rounded-md">
                            <Calendar className="h-6 w-6 text-primary-500" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Upcoming Sessions</p>
                            <p className="text-3xl font-semibold text-gray-900">
                              {stats.acceptedBookings}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="p-2 bg-green-50 rounded-md">
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Completed Sessions</p>
                            <p className="text-3xl font-semibold text-gray-900">
                              {stats.completedBookings}
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
                            <p className="text-sm font-medium text-gray-500">Average Rating</p>
                            <p className="text-3xl font-semibold text-gray-900">
                              {stats.averageRating.toFixed(1)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
                
                {/* Pending Requests */}
                {pendingBookings && pendingBookings.length > 0 && (
                  <motion.div variants={itemVariants}>
                    <Card className="mb-6">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle>Pending Requests</CardTitle>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            {pendingBookings.length} request{pendingBookings.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {pendingBookings.map((booking) => (
                            <BookingCard
                              key={booking.id}
                              id={booking.id}
                              tutor={{ id: user.id, fullName: user.fullName, profilePicture: user.profilePicture }}
                              learner={booking.learner}
                              course={booking.course}
                              date={booking.date}
                              startTime={booking.startTime}
                              endTime={booking.endTime}
                              location={booking.location}
                              status="pending"
                              notes={booking.notes}
                              isTutor={true}
                              onAccept={handleAcceptBooking}
                              onReject={handleRejectBooking}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
                
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
                          <Clock className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : upcomingBookings && upcomingBookings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {upcomingBookings.slice(0, 2).map((booking) => (
                            <BookingCard
                              key={booking.id}
                              id={booking.id}
                              tutor={{ id: user.id, fullName: user.fullName, profilePicture: user.profilePicture }}
                              learner={booking.learner}
                              course={booking.course}
                              date={booking.date}
                              startTime={booking.startTime}
                              endTime={booking.endTime}
                              location={booking.location}
                              status="accepted"
                              notes={booking.notes}
                              isTutor={true}
                              onComplete={handleCompleteBooking}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-6">
                          <p className="text-gray-500">You have no upcoming sessions.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
                
                {/* Recent Reviews */}
                <motion.div variants={itemVariants}>
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle>Recent Reviews</CardTitle>
                        <Link href="/reviews">
                          <Button variant="ghost" size="sm">View all</Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {reviewsLoading ? (
                        <div className="flex justify-center p-6">
                          <Clock className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : reviews && reviews.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {reviews.slice(0, 2).map((review) => (
                            <ReviewCard
                              key={review.id}
                              reviewerName={review.learner.fullName}
                              reviewerImage={review.learner.profilePicture}
                              reviewerRole="Learner"
                              rating={review.rating}
                              comment={review.comment}
                              date={new Date(review.createdAt)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-6">
                          <p className="text-gray-500">You have no reviews yet.</p>
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
                      <CardTitle>Manage Sessions</CardTitle>
                      <CardDescription>
                        View and manage all your tutorial sessions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="pending">
                        <TabsList className="mb-4">
                          <TabsTrigger value="pending">
                            Pending Requests
                            {pendingBookings && pendingBookings.length > 0 && (
                              <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                                {pendingBookings.length}
                              </Badge>
                            )}
                          </TabsTrigger>
                          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                          <TabsTrigger value="completed">Completed</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="pending">
                          {bookingsLoading ? (
                            <div className="flex justify-center p-6">
                              <Clock className="h-8 w-8 animate-spin text-primary" />
                            </div>
                          ) : pendingBookings && pendingBookings.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {pendingBookings.map((booking) => (
                                <BookingCard
                                  key={booking.id}
                                  id={booking.id}
                                  tutor={{ id: user.id, fullName: user.fullName, profilePicture: user.profilePicture }}
                                  learner={booking.learner}
                                  course={booking.course}
                                  date={booking.date}
                                  startTime={booking.startTime}
                                  endTime={booking.endTime}
                                  location={booking.location}
                                  status="pending"
                                  notes={booking.notes}
                                  isTutor={true}
                                  onAccept={handleAcceptBooking}
                                  onReject={handleRejectBooking}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="text-center p-6">
                              <p className="text-gray-500">You have no pending booking requests.</p>
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="upcoming">
                          {bookingsLoading ? (
                            <div className="flex justify-center p-6">
                              <Clock className="h-8 w-8 animate-spin text-primary" />
                            </div>
                          ) : upcomingBookings && upcomingBookings.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {upcomingBookings.map((booking) => (
                                <BookingCard
                                  key={booking.id}
                                  id={booking.id}
                                  tutor={{ id: user.id, fullName: user.fullName, profilePicture: user.profilePicture }}
                                  learner={booking.learner}
                                  course={booking.course}
                                  date={booking.date}
                                  startTime={booking.startTime}
                                  endTime={booking.endTime}
                                  location={booking.location}
                                  status="accepted"
                                  notes={booking.notes}
                                  isTutor={true}
                                  onComplete={handleCompleteBooking}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="text-center p-6">
                              <p className="text-gray-500">You have no upcoming sessions.</p>
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="completed">
                          {bookingsLoading ? (
                            <div className="flex justify-center p-6">
                              <Clock className="h-8 w-8 animate-spin text-primary" />
                            </div>
                          ) : completedBookings && completedBookings.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {completedBookings.map((booking) => (
                                <BookingCard
                                  key={booking.id}
                                  id={booking.id}
                                  tutor={{ id: user.id, fullName: user.fullName, profilePicture: user.profilePicture }}
                                  learner={booking.learner}
                                  course={booking.course}
                                  date={booking.date}
                                  startTime={booking.startTime}
                                  endTime={booking.endTime}
                                  location={booking.location}
                                  status="completed"
                                  notes={booking.notes}
                                  isTutor={true}
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
            
            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle>My Reviews</CardTitle>
                      <CardDescription>
                        See what students are saying about your tutoring
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">Overall Rating</h3>
                            <div className="flex items-center mt-1">
                              <div className="flex items-center">
                                <Star className="h-5 w-5 text-yellow-400" />
                                <span className="ml-1 text-xl font-semibold text-gray-900">
                                  {stats.averageRating.toFixed(1)}
                                </span>
                              </div>
                              <span className="ml-2 text-sm text-gray-500">
                                based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">Total Sessions</div>
                            <div className="text-2xl font-semibold text-gray-900">{stats.totalBookings}</div>
                          </div>
                        </div>
                      </div>
                      
                      {reviewsLoading ? (
                        <div className="flex justify-center p-6">
                          <Clock className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : reviews && reviews.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                          {reviews.map((review) => (
                            <ReviewCard
                              key={review.id}
                              reviewerName={review.learner.fullName}
                              reviewerImage={review.learner.profilePicture}
                              reviewerRole="Learner"
                              rating={review.rating}
                              comment={review.comment}
                              date={new Date(review.createdAt)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-6">
                          <p className="text-gray-500">You have no reviews yet. Complete more sessions to receive reviews.</p>
                        </div>
                      )}
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
