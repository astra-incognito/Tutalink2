import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { BookingCard } from "@/components/cards/booking-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { Loader2, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { localStorageKeys, getLocalStorageItem } from "@/lib/local-storage";

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

export default function BookingsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Get bookings based on user role
  const { data: bookings, isLoading } = useQuery<BookingData[]>({
    queryKey: ["bookings", user?.role, user?.id],
    queryFn: async () => {
      // Try to get bookings from localStorage first
      const storedBookings = getLocalStorageItem<BookingData[]>(localStorageKeys.BOOKINGS);
      if (storedBookings) {
        // Filter based on user role
        if (user?.role === "tutor") {
          return storedBookings.filter(booking => booking.tutorId === user?.id);
        } else if (user?.role === "learner") {
          return storedBookings.filter(booking => booking.learnerId === user?.id);
        } else if (user?.role === "admin") {
          return storedBookings;
        }
      }
      
      // If no stored bookings or user is not logged in, fetch from API
      try {
        let endpoint = "/api/bookings";
        if (user?.role === "tutor") {
          endpoint = `/api/bookings/tutor/${user.id}`;
        } else if (user?.role === "learner") {
          endpoint = `/api/bookings/learner/${user.id}`;
        }
        
        const res = await apiRequest("GET", endpoint);
        return await res.json();
      } catch (error) {
        console.error("Failed to fetch bookings", error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Filter bookings based on search query and status filter
  const filteredBookings = bookings?.filter(booking => {
    const matchesQuery = 
      searchQuery === "" ||
      booking.tutor.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.learner.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "pending" && booking.status === "pending") ||
      (statusFilter === "accepted" && booking.status === "accepted") ||
      (statusFilter === "completed" && booking.status === "completed") ||
      (statusFilter === "rejected" && booking.status === "rejected") ||
      (statusFilter === "upcoming" && booking.status === "accepted" && new Date(booking.date) >= new Date()) ||
      (statusFilter === "past" && booking.status === "completed");
    
    return matchesQuery && matchesStatus;
  }) || [];

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
            <h1 className="text-2xl font-semibold text-gray-900">My Bookings</h1>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <CardTitle>Manage Bookings</CardTitle>
                      <CardDescription>
                        View and manage all your tutoring sessions
                      </CardDescription>
                    </div>
                    
                    {user.role === "learner" && (
                      <Link href="/tutors">
                        <Button>
                          Book New Session
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="search"
                        placeholder="Search bookings..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-400" />
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Bookings</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="past">Past Sessions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Tabs defaultValue="grid" className="w-full">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <Badge variant="outline" className="mr-2">
                          {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
                        </Badge>
                        {statusFilter !== "all" && (
                          <Badge variant="secondary">
                            {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                          </Badge>
                        )}
                      </div>
                      <TabsList>
                        <TabsTrigger value="grid">Grid</TabsTrigger>
                        <TabsTrigger value="list">List</TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <TabsContent value="grid">
                      {isLoading ? (
                        <div className="flex justify-center p-6">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : filteredBookings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredBookings.map((booking) => (
                            <BookingCard
                              key={booking.id}
                              id={booking.id}
                              tutor={booking.tutor}
                              learner={booking.learner}
                              course={booking.course}
                              date={booking.date}
                              startTime={booking.startTime}
                              endTime={booking.endTime}
                              location={booking.location}
                              status={booking.status as any}
                              notes={booking.notes}
                              isTutor={user.role === "tutor"}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-6">
                          <p className="text-gray-500">No bookings found matching your criteria.</p>
                          {user.role === "learner" && (
                            <Link href="/tutors">
                              <Button className="mt-4">Book a Session</Button>
                            </Link>
                          )}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="list">
                      {isLoading ? (
                        <div className="flex justify-center p-6">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : filteredBookings.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b text-left text-xs text-gray-500 uppercase tracking-wider">
                                <th className="px-4 py-2">Date</th>
                                <th className="px-4 py-2">Time</th>
                                <th className="px-4 py-2">{user.role === "tutor" ? "Learner" : "Tutor"}</th>
                                <th className="px-4 py-2">Course</th>
                                <th className="px-4 py-2">Location</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredBookings.map((booking) => (
                                <tr key={booking.id} className="border-b hover:bg-gray-50">
                                  <td className="px-4 py-3">{new Date(booking.date).toLocaleDateString()}</td>
                                  <td className="px-4 py-3">{booking.startTime} - {booking.endTime}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center">
                                      <Avatar className="h-6 w-6 mr-2">
                                        <AvatarImage 
                                          src={user.role === "tutor" ? booking.learner.profilePicture : booking.tutor.profilePicture} 
                                          alt={user.role === "tutor" ? booking.learner.fullName : booking.tutor.fullName} 
                                        />
                                        <AvatarFallback>
                                          {(user.role === "tutor" ? booking.learner.fullName : booking.tutor.fullName)
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                        </AvatarFallback>
                                      </Avatar>
                                      {user.role === "tutor" ? booking.learner.fullName : booking.tutor.fullName}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">{booking.course.code}</td>
                                  <td className="px-4 py-3">{booking.location}</td>
                                  <td className="px-4 py-3">
                                    <Badge 
                                      variant={
                                        booking.status === "completed" ? "default" :
                                        booking.status === "accepted" ? "secondary" :
                                        booking.status === "pending" ? "outline" :
                                        "destructive"
                                      }
                                    >
                                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-3">
                                    <Button variant="ghost" size="sm">
                                      Details
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center p-6">
                          <p className="text-gray-500">No bookings found matching your criteria.</p>
                          {user.role === "learner" && (
                            <Link href="/tutors">
                              <Button className="mt-4">Book a Session</Button>
                            </Link>
                          )}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}