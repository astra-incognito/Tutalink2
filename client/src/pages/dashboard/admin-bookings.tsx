import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Calendar } from "lucide-react";
import { BookingCard } from "@/components/cards/booking-card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

// Add types for booking and mutation variables
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
interface BookingData {
  id: number;
  tutor: Person;
  learner: Person;
  course: Course;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: string;
  notes?: string;
  fee?: number;
}

export default function AdminBookings() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [tutorFilter, setTutorFilter] = useState("");
  const [learnerFilter, setLearnerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch all bookings
  const { data: allBookings, isLoading } = useQuery<BookingData[]>({
    queryKey: ["admin", "all-bookings"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/bookings");
      return await res.json();
    },
  });

  // Unique tutors and learners for dropdowns
  const tutorOptions = allBookings ? Array.from(new Set(allBookings.map((b: BookingData) => b.tutor.fullName))) : [];
  const learnerOptions = allBookings ? Array.from(new Set(allBookings.map((b: BookingData) => b.learner.fullName))) : [];

  console.log('tutorOptions', tutorOptions, 'learnerOptions', learnerOptions);

  // Admin booking actions
  const approveBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const res = await apiRequest("PATCH", `/api/admin/bookings/${bookingId}/status`, { status: "accepted" });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "all-bookings"] });
      toast({ title: "Booking approved" });
    },
  });
  const disapproveBookingMutation = useMutation({
    mutationFn: async (vars: { bookingId: number; reason: string }) => {
      const { bookingId, reason } = vars;
      const res = await apiRequest("PATCH", `/api/admin/bookings/${bookingId}/status`, { status: "rejected", notes: reason });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "all-bookings"] });
      toast({ title: "Booking disapproved" });
    },
  });
  const cancelBookingMutation = useMutation({
    mutationFn: async (vars: { bookingId: number; reason: string }) => {
      const { bookingId, reason } = vars;
      const res = await apiRequest("PATCH", `/api/admin/bookings/${bookingId}/status`, { status: "cancelled", notes: reason });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "all-bookings"] });
      toast({ title: "Booking cancelled" });
    },
  });
  const rescheduleBookingMutation = useMutation({
    mutationFn: async (vars: { bookingId: number; newDate: string; newStart: string; newEnd: string }) => {
      const { bookingId, newDate, newStart, newEnd } = vars;
      const res = await apiRequest("PATCH", `/api/admin/bookings/${bookingId}/reschedule`, { date: newDate, startTime: newStart, endTime: newEnd });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "all-bookings"] });
      toast({ title: "Booking rescheduled" });
    },
  });

  // Filter bookings
  const filteredBookings = allBookings?.filter((booking: BookingData) => {
    const matchesQuery =
      searchQuery === "" ||
      booking.tutor.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.learner.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;
    const matchesDate =
      !dateFilter || format(new Date(booking.date), "yyyy-MM-dd") === dateFilter;
    const matchesTutor =
      !tutorFilter || booking.tutor.fullName === tutorFilter;
    const matchesLearner =
      !learnerFilter || booking.learner.fullName === learnerFilter;
    return matchesQuery && matchesStatus && matchesDate && matchesTutor && matchesLearner;
  }) || [];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SidebarNav />
      <main className="flex-1 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="mb-8 shadow-lg border-indigo-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700 text-2xl">
                <Calendar className="h-6 w-6 text-indigo-500" />
                📅 All Bookings
              </CardTitle>
              <CardDescription>Review and manage all tutorial sessions on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search by tutor, learner, or course..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <input
                  type="date"
                  className="border rounded p-2 w-[160px]"
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                  placeholder="Date"
                />
                <Select value={tutorFilter} onValueChange={setTutorFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by tutor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Tutors</SelectItem>
                    {tutorOptions
                      .filter(
                        t => typeof t === 'string' && t.trim() !== '' && t !== null && t !== undefined
                      )
                      .map((t: string) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={learnerFilter} onValueChange={setLearnerFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by learner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Learners</SelectItem>
                    {learnerOptions
                      .filter(
                        l => typeof l === 'string' && l.trim() !== '' && l !== null && l !== undefined
                      )
                      .map((l: string) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {isLoading ? (
                <div className="flex justify-center p-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredBookings.map((booking: BookingData) => (
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
                      status={booking.status as "pending" | "accepted" | "rejected" | "completed"}
                      notes={booking.notes || ""}
                      fee={booking.fee}
                      isAdmin={true}
                      onApprove={id => approveBookingMutation.mutate(id)}
                      onDisapprove={(id, reason) => disapproveBookingMutation.mutate({ bookingId: id, reason })}
                      onCancel={(id, reason) => cancelBookingMutation.mutate({ bookingId: id, reason })}
                      onReschedule={(id, newDate, newStart, newEnd) => rescheduleBookingMutation.mutate({ bookingId: id, newDate, newStart, newEnd })}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center p-6">
                  <p className="text-gray-500">No bookings available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
} 