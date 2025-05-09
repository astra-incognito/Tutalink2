import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Star, CheckCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { localStorageKeys, getLocalStorageItem, appendToLocalStorageArray } from "@/lib/local-storage";

interface ReviewPageProps {
  bookingId: number;
}

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

// Review form schema
const reviewFormSchema = z.object({
  rating: z.number().min(1, {
    message: "Please select a rating.",
  }).max(5),
  comment: z.string().min(10, {
    message: "Comment must be at least 10 characters.",
  }),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export default function ReviewPage({ bookingId }: ReviewPageProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [selectedRating, setSelectedRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Get booking details
  const { data: booking, isLoading: bookingLoading } = useQuery<BookingData>({
    queryKey: ["bookings", bookingId],
    queryFn: async () => {
      // Try to get from localStorage first
      const storedBookings = getLocalStorageItem<BookingData[]>(localStorageKeys.BOOKINGS);
      const storedBooking = storedBookings?.find(b => b.id === bookingId);
      
      if (storedBooking) {
        return storedBooking;
      }
      
      try {
        const res = await apiRequest("GET", `/api/bookings/${bookingId}`);
        return await res.json();
      } catch (error) {
        console.error("Failed to fetch booking", error);
        throw error;
      }
    },
  });

  // Form setup
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  // Update form when rating changes
  useEffect(() => {
    form.setValue("rating", selectedRating);
  }, [selectedRating, form]);

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      const reviewData = {
        bookingId,
        tutorId: booking?.tutorId,
        learnerId: booking?.learnerId,
        rating: data.rating,
        comment: data.comment,
      };
      
      const res = await apiRequest("POST", "/api/reviews", reviewData);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      
      // Update localStorage
      appendToLocalStorageArray(localStorageKeys.REVIEWS, data);
      
      toast({
        title: "Review submitted",
        description: "Your review has been submitted successfully.",
      });
      
      setIsSubmitted(true);
      
      // Redirect back to bookings after a short delay
      setTimeout(() => {
        navigate("/bookings");
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Error submitting review",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: ReviewFormValues) => {
    createReviewMutation.mutate(values);
  };

  // Check if user is authorized to review
  const canReview = 
    booking && 
    user && 
    user.id === booking.learnerId && 
    (booking.status === "completed" || 
    (booking.status === "accepted" && new Date(booking.date) < new Date()));

  if (bookingLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <SidebarNav />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex h-screen bg-gray-100">
        <SidebarNav />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <AlertTriangle className="h-12 w-12 text-yellow-500" />
                <h1 className="text-2xl font-bold">Booking Not Found</h1>
                <p className="text-center text-gray-600">
                  The booking you're looking for doesn't exist or has been removed.
                </p>
                <Button onClick={() => navigate("/bookings")}>
                  View My Bookings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!canReview) {
    return (
      <div className="flex h-screen bg-gray-100">
        <SidebarNav />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <AlertTriangle className="h-12 w-12 text-yellow-500" />
                <h1 className="text-2xl font-bold">Cannot Review</h1>
                <p className="text-center text-gray-600">
                  You can only review completed sessions that you've attended as a learner.
                </p>
                <Button onClick={() => navigate("/bookings")}>
                  View My Bookings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarNav />
      
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Leave a Review</h1>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {isSubmitted ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center py-8 text-center">
                    <CheckCircle className="h-16 w-16 text-primary mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Thank You for Your Review!</h2>
                    <p className="text-gray-600 mb-6">
                      Your feedback helps improve the tutoring experience for everyone.
                    </p>
                    <Button onClick={() => navigate("/bookings")}>
                      Return to Bookings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Review your session with {booking.tutor.fullName}</CardTitle>
                  <CardDescription>
                    Share your experience and provide feedback about your tutoring session
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                      <div>
                        <h3 className="font-medium">Course</h3>
                        <p className="text-gray-600">{booking.course.name} ({booking.course.code})</p>
                      </div>
                      <div>
                        <h3 className="font-medium">Date</h3>
                        <p className="text-gray-600">{new Date(booking.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <h3 className="font-medium">Time</h3>
                        <p className="text-gray-600">{booking.startTime} - {booking.endTime}</p>
                      </div>
                      <div>
                        <h3 className="font-medium">Location</h3>
                        <p className="text-gray-600">{booking.location}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rating</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-1">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                  <button
                                    key={rating}
                                    type="button"
                                    className="focus:outline-none"
                                    onClick={() => setSelectedRating(rating)}
                                  >
                                    <Star
                                      className={`h-8 w-8 ${
                                        rating <= selectedRating
                                          ? "text-yellow-400 fill-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </FormControl>
                            <FormDescription>
                              Click on a star to rate your experience
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="comment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Review</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="What did you like or dislike about this tutoring session? Was the tutor knowledgeable and helpful?"
                                className="resize-none h-32"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Your review will be public and help other students find the right tutors
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate("/bookings")}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createReviewMutation.isPending}
                        >
                          {createReviewMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : "Submit Review"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function AlertTriangle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}