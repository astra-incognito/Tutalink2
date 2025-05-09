import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { StarRating } from "@/components/ui/star-rating";
import { ReviewCard } from "@/components/cards/review-card";
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  MapPin, 
  Calendar as CalendarIcon, 
  Clock, 
  BookOpen, 
  GraduationCap, 
  Star, 
  Loader2,
  ArrowLeft
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { insertBookingSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  localStorageKeys, 
  getLocalStorageItem, 
  setLocalStorageItem, 
  appendToLocalStorageArray 
} from "@/lib/local-storage";

interface TutorProfileProps {
  id: number;
}

interface TutorData {
  id: number;
  fullName: string;
  profilePicture?: string;
  bio?: string;
  email: string;
  username: string;
  courses: {
    id: number;
    name: string;
    department: string;
    code: string;
    description?: string;
  }[];
  reviews: {
    id: number;
    rating: number;
    comment: string;
    createdAt: string;
    learner: {
      id: number;
      fullName: string;
      profilePicture?: string;
    };
  }[];
  availability: {
    id: number;
    tutorId: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
  reviewCount: number;
  averageRating: number;
}

// Schema for booking form
const bookingFormSchema = z.object({
  date: z.date(),
  sessionTime: z.string(),
  location: z.string().min(1, "Location is required"),
  courseId: z.string().min(1, "Course is required"),
  notes: z.string().optional(),
}).required();

type BookingFormValues = z.infer<typeof bookingFormSchema>;

// Location options
const campusLocations = [
  "Main Library, Study Room 3",
  "Science Building, Room 201",
  "Student Center, Meeting Room A",
  "Engineering Building, Tutoring Lab",
  "Arts & Humanities Building, Lounge"
];

// Time slot options
const timeSlots = [
  "9:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 1:00 PM",
  "1:00 PM - 2:00 PM",
  "2:00 PM - 3:00 PM",
  "3:00 PM - 4:00 PM",
  "4:00 PM - 5:00 PM",
  "5:00 PM - 6:00 PM",
  "6:00 PM - 7:00 PM",
  "7:00 PM - 8:00 PM"
];

export default function TutorProfilePage({ id }: TutorProfileProps) {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  
  // Form setup
  const bookingForm = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      date: new Date(),
      sessionTime: "",
      location: "",
      courseId: "",
      notes: ""
    }
  });
  
  // Get tutor details
  const { data: tutor, isLoading } = useQuery<TutorData>({
    queryKey: ["tutors", id],
    queryFn: async () => {
      // Try to get from localStorage first
      const storedTutors = getLocalStorageItem<TutorData[]>(localStorageKeys.TUTORS);
      const storedTutor = storedTutors?.find(t => t.id === id);
      
      if (storedTutor && storedTutor.reviews && storedTutor.availability) {
        return storedTutor;
      }
      
      try {
        const res = await apiRequest("GET", `/api/tutors/${id}`);
        return await res.json();
      } catch (error) {
        console.error("Failed to fetch tutor", error);
        throw error;
      }
    },
  });
  
  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/bookings", data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      
      // Update localStorage
      appendToLocalStorageArray(localStorageKeys.BOOKINGS, data);
      
      toast({
        title: "Booking created",
        description: "Your booking request has been sent to the tutor."
      });
      
      // Close dialog and reset form
      setBookingDialogOpen(false);
      setBookingStep(1);
      bookingForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error creating booking",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Handle booking form submission
  const handleBookingSubmit = (values: BookingFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to book a session",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    
    // Extract time range
    const [startTime, endTime] = values.sessionTime.split(" - ");
    
    const bookingData = {
      learnerId: user.id,
      tutorId: id,
      courseId: parseInt(values.courseId),
      date: format(values.date, "yyyy-MM-dd"),
      startTime,
      endTime,
      location: values.location,
      notes: values.notes
    };
    
    createBookingMutation.mutate(bookingData);
  };
  
  // Go to next step in booking form
  const goToNextStep = () => {
    if (bookingStep === 1) {
      const { date, courseId } = bookingForm.getValues();
      if (!date || !courseId) {
        bookingForm.trigger(["date", "courseId"]);
        return;
      }
    } else if (bookingStep === 2) {
      const { sessionTime, location } = bookingForm.getValues();
      if (!sessionTime || !location) {
        bookingForm.trigger(["sessionTime", "location"]);
        return;
      }
    }
    
    setBookingStep(prev => prev + 1);
  };
  
  // Go to previous step in booking form
  const goToPreviousStep = () => {
    setBookingStep(prev => prev - 1);
  };
  
  // Reset booking form
  const resetBookingForm = () => {
    bookingForm.reset();
    setBookingStep(1);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!tutor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <AlertTriangle className="h-12 w-12 text-yellow-500" />
                <h1 className="text-2xl font-bold">Tutor Not Found</h1>
                <p className="text-center text-gray-600">
                  The tutor you're looking for doesn't exist or has been removed.
                </p>
                <Button onClick={() => navigate("/tutors")}>
                  Browse Tutors
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Get day name from day of week number
  const getDayName = (dayOfWeek: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[dayOfWeek];
  };
  
  // Format time string
  const formatTime = (time: string) => {
    return time;
  };
  
  // Group availability by day of week
  const availabilityByDay = tutor.availability?.reduce((acc, slot) => {
    const day = getDayName(slot.dayOfWeek);
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(`${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`);
    return acc;
  }, {} as Record<string, string[]>);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8 py-8">
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => navigate("/tutors")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tutors
          </Button>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Profile */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={tutor.profilePicture || ""} alt={tutor.fullName} />
                        <AvatarFallback className="text-lg">
                          {tutor.fullName.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      
                      <h1 className="text-2xl font-bold text-gray-900 mb-1">{tutor.fullName}</h1>
                      
                      <div className="flex items-center mb-4">
                        <StarRating rating={tutor.averageRating} />
                        <span className="ml-2 text-gray-600">
                          {tutor.averageRating.toFixed(1)} ({tutor.reviewCount} reviews)
                        </span>
                      </div>
                      
                      <div className="space-y-2 w-full">
                        <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
                          <DialogTrigger asChild>
                            <Button className="w-full">
                              Book a Session
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Book a Session with {tutor.fullName}</DialogTitle>
                              <DialogDescription>
                                {bookingStep === 1 && "Select a date and course for your tutoring session."}
                                {bookingStep === 2 && "Choose a time slot and location for your session."}
                                {bookingStep === 3 && "Review your booking details and add any notes."}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <form onSubmit={bookingForm.handleSubmit(handleBookingSubmit)}>
                              {/* Step 1: Date and Course */}
                              <AnimatePresence mode="wait">
                                {bookingStep === 1 && (
                                  <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-4 py-4"
                                  >
                                    <div className="space-y-2">
                                      <Label htmlFor="date">Select Date</Label>
                                      <Controller
                                        control={bookingForm.control}
                                        name="date"
                                        render={({ field }) => (
                                          <Popover>
                                            <PopoverTrigger asChild>
                                              <Button
                                                variant={"outline"}
                                                className={cn(
                                                  "w-full justify-start text-left font-normal",
                                                  !field.value && "text-muted-foreground"
                                                )}
                                              >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? (
                                                  format(field.value, "PPP")
                                                ) : (
                                                  <span>Pick a date</span>
                                                )}
                                              </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                              <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => 
                                                  // Disable dates in the past
                                                  date < new Date(new Date().setHours(0, 0, 0, 0))
                                                }
                                                initialFocus
                                              />
                                            </PopoverContent>
                                          </Popover>
                                        )}
                                      />
                                      {bookingForm.formState.errors.date && (
                                        <p className="text-sm text-red-500">
                                          {bookingForm.formState.errors.date.message}
                                        </p>
                                      )}
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label htmlFor="courseId">Select Course</Label>
                                      <Controller
                                        control={bookingForm.control}
                                        name="courseId"
                                        render={({ field }) => (
                                          <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="space-y-2"
                                          >
                                            {tutor.courses.map((course) => (
                                              <div key={course.id} className="flex items-center space-x-2">
                                                <RadioGroupItem 
                                                  value={course.id.toString()} 
                                                  id={`course-${course.id}`} 
                                                />
                                                <Label 
                                                  htmlFor={`course-${course.id}`}
                                                  className="flex flex-col"
                                                >
                                                  <span>{course.name}</span>
                                                  <span className="text-xs text-gray-500">
                                                    {course.code} - {course.department}
                                                  </span>
                                                </Label>
                                              </div>
                                            ))}
                                          </RadioGroup>
                                        )}
                                      />
                                      {bookingForm.formState.errors.courseId && (
                                        <p className="text-sm text-red-500">
                                          {bookingForm.formState.errors.courseId.message}
                                        </p>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                                
                                {/* Step 2: Time and Location */}
                                {bookingStep === 2 && (
                                  <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-4 py-4"
                                  >
                                    <div className="space-y-2">
                                      <Label htmlFor="sessionTime">Select Time Slot</Label>
                                      <Controller
                                        control={bookingForm.control}
                                        name="sessionTime"
                                        render={({ field }) => (
                                          <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="grid grid-cols-2 gap-2"
                                          >
                                            {timeSlots.map((slot) => (
                                              <div key={slot} className="flex items-center space-x-2">
                                                <RadioGroupItem 
                                                  value={slot} 
                                                  id={`time-${slot}`} 
                                                />
                                                <Label htmlFor={`time-${slot}`}>
                                                  {slot}
                                                </Label>
                                              </div>
                                            ))}
                                          </RadioGroup>
                                        )}
                                      />
                                      {bookingForm.formState.errors.sessionTime && (
                                        <p className="text-sm text-red-500">
                                          {bookingForm.formState.errors.sessionTime.message}
                                        </p>
                                      )}
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label htmlFor="location">Select Location</Label>
                                      <Controller
                                        control={bookingForm.control}
                                        name="location"
                                        render={({ field }) => (
                                          <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="space-y-2"
                                          >
                                            {campusLocations.map((location) => (
                                              <div key={location} className="flex items-center space-x-2">
                                                <RadioGroupItem 
                                                  value={location} 
                                                  id={`location-${location}`} 
                                                />
                                                <Label htmlFor={`location-${location}`}>
                                                  {location}
                                                </Label>
                                              </div>
                                            ))}
                                          </RadioGroup>
                                        )}
                                      />
                                      {bookingForm.formState.errors.location && (
                                        <p className="text-sm text-red-500">
                                          {bookingForm.formState.errors.location.message}
                                        </p>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                                
                                {/* Step 3: Review and Notes */}
                                {bookingStep === 3 && (
                                  <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-4 py-4"
                                  >
                                    <div className="space-y-4">
                                      <div className="bg-gray-50 p-4 rounded-md">
                                        <h3 className="font-medium mb-2">Booking Summary</h3>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex justify-between">
                                            <span className="text-gray-500">Tutor:</span>
                                            <span>{tutor.fullName}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-500">Course:</span>
                                            <span>
                                              {tutor.courses.find(c => c.id.toString() === bookingForm.getValues().courseId)?.name}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-500">Date:</span>
                                            <span>
                                              {format(bookingForm.getValues().date, "EEEE, MMMM d, yyyy")}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-500">Time:</span>
                                            <span>{bookingForm.getValues().sessionTime}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-500">Location:</span>
                                            <span>{bookingForm.getValues().location}</span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label htmlFor="notes">Additional Notes (Optional)</Label>
                                        <Textarea
                                          id="notes"
                                          placeholder="Add any specific topics you want to cover or questions you have."
                                          {...bookingForm.register("notes")}
                                          className="min-h-[100px]"
                                        />
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                              
                              <DialogFooter className="mt-4">
                                {bookingStep > 1 && (
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={goToPreviousStep}
                                  >
                                    Back
                                  </Button>
                                )}
                                
                                {bookingStep < 3 ? (
                                  <Button 
                                    type="button" 
                                    onClick={goToNextStep}
                                  >
                                    Next
                                  </Button>
                                ) : (
                                  <Button 
                                    type="submit"
                                    disabled={createBookingMutation.isPending}
                                  >
                                    {createBookingMutation.isPending ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                      </>
                                    ) : (
                                      "Book Session"
                                    )}
                                  </Button>
                                )}
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                        
                        {user && user.id === tutor.id && (
                          <Button variant="outline" className="w-full">
                            Edit Profile
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    {/* Expertise */}
                    <div>
                      <h2 className="text-lg font-semibold mb-3 flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-primary-500" />
                        Areas of Expertise
                      </h2>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {tutor.courses.map((course) => (
                          <Badge 
                            key={course.id}
                            variant="secondary"
                            className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                          >
                            {course.name} ({course.code})
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Availability */}
                      <h2 className="text-lg font-semibold mb-3 flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-primary-500" />
                        Availability
                      </h2>
                      <div className="space-y-2">
                        {Object.entries(availabilityByDay || {}).map(([day, times]) => (
                          <div key={day} className="flex flex-col">
                            <span className="font-medium">{day}</span>
                            <span className="text-sm text-gray-600">
                              {times.join(", ")}
                            </span>
                          </div>
                        ))}
                        
                        {Object.keys(availabilityByDay || {}).length === 0 && (
                          <p className="text-gray-500 text-sm">
                            No availability information provided
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            
            {/* Right column: Bio, Reviews, etc. */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="about">
                <TabsList className="mb-6">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="reviews">
                    Reviews ({tutor.reviewCount})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="about">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>About {tutor.fullName}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none">
                          {tutor.bio ? (
                            <p>{tutor.bio}</p>
                          ) : (
                            <p className="text-gray-500 italic">
                              No bio information provided
                            </p>
                          )}
                        </div>
                        
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-lg mb-2 flex items-center">
                              <GraduationCap className="h-5 w-5 mr-2 text-primary-500" />
                              Academic Background
                            </h3>
                            <p className="text-gray-600">
                              Expertise in {tutor.courses.map(c => c.department).filter((v, i, a) => a.indexOf(v) === i).join(", ")}
                            </p>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-lg mb-2 flex items-center">
                              <Star className="h-5 w-5 mr-2 text-primary-500" />
                              Tutoring Experience
                            </h3>
                            <div className="flex items-center">
                              <StarRating rating={tutor.averageRating} />
                              <span className="ml-2 text-gray-600">
                                {tutor.reviewCount} sessions reviewed
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle>Teaching Approach</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg">
                            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                              <BookOpen className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="font-medium mb-2">Subject Mastery</h3>
                            <p className="text-sm text-gray-600">
                              Deep understanding of core concepts and advanced topics
                            </p>
                          </div>
                          
                          <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg">
                            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                              <Users className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="font-medium mb-2">Personalized Approach</h3>
                            <p className="text-sm text-gray-600">
                              Tailored sessions to match your learning style and pace
                            </p>
                          </div>
                          
                          <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg">
                            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                              <Lightbulb className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="font-medium mb-2">Problem Solving</h3>
                            <p className="text-sm text-gray-600">
                              Focus on practical application and critical thinking skills
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
                
                <TabsContent value="reviews">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Student Reviews</CardTitle>
                        <CardDescription>
                          See what other students are saying about {tutor.fullName}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* Reviews summary */}
                        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center mb-4 md:mb-0">
                              <div className="flex-shrink-0">
                                <StarRating rating={tutor.averageRating} size="lg" />
                              </div>
                              <div className="ml-4">
                                <div className="text-3xl font-bold">{tutor.averageRating.toFixed(1)}</div>
                                <div className="text-sm text-gray-500">
                                  {tutor.reviewCount} {tutor.reviewCount === 1 ? 'review' : 'reviews'}
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              {[5, 4, 3, 2, 1].map((rating) => {
                                const count = tutor.reviews?.filter(r => Math.round(r.rating) === rating).length || 0;
                                const percentage = tutor.reviewCount ? (count / tutor.reviewCount) * 100 : 0;
                                
                                return (
                                  <div key={rating} className="flex items-center">
                                    <span className="text-sm font-medium w-6">{rating}</span>
                                    <div className="w-40 h-2 mx-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-yellow-400 rounded-full"
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm text-gray-500">{count}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        
                        {/* Reviews list */}
                        <div className="space-y-4">
                          {tutor.reviews && tutor.reviews.length > 0 ? (
                            tutor.reviews.map((review) => (
                              <ReviewCard
                                key={review.id}
                                reviewerName={review.learner.fullName}
                                reviewerImage={review.learner.profilePicture}
                                reviewerRole="Student"
                                rating={review.rating}
                                comment={review.comment}
                                date={new Date(review.createdAt)}
                              />
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                                <MessageSquare className="h-6 w-6 text-gray-400" />
                              </div>
                              <h3 className="text-lg font-medium text-gray-900">No Reviews Yet</h3>
                              <p className="mt-2 text-sm text-gray-500">
                                This tutor hasn't received any reviews yet.
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

function Lightbulb(props: any) {
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
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

function MessageSquare(props: any) {
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
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
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
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  );
}

function Users(props: any) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
