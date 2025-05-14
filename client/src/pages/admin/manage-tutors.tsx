import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import { Tutor, TutorApplication } from "@/lib/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search,
  Filter,
  Loader2,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Mail,
  FileText,
  Download,
  Star,
  Pencil,
  Lock,
} from "lucide-react";

export default function ManageTutors() {
  const [activeTab, setActiveTab] = useState("tutors");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<TutorApplication | null>(null);
  const [isTutorInfoOpen, setIsTutorInfoOpen] = useState(false);
  const [isApplicationDetailOpen, setIsApplicationDetailOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch tutors from API
  const { data: tutors, isLoading: isTutorsLoading } = useQuery<Tutor[]>({
    queryKey: ["/api/admin/tutors"],
    enabled: false, // Disabled for demo
  });

  // Fetch tutor applications from API
  const { data: applications, isLoading: isApplicationsLoading } = useQuery<TutorApplication[]>({
    queryKey: ["/api/admin/tutor-applications"],
    enabled: false, // Disabled for demo
  });

  // Approve application mutation
  const approveApplicationMutation = useMutation({
    mutationFn: async (applicationId: number) => {
      await apiRequest("POST", `/api/admin/tutor-applications/${applicationId}/approve`);
    },
    onSuccess: () => {
      toast({
        title: "Application approved",
        description: "The tutor application has been approved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tutor-applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tutors"] });
      setIsApproveDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to approve application",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reject application mutation
  const rejectApplicationMutation = useMutation({
    mutationFn: async (applicationId: number) => {
      await apiRequest("POST", `/api/admin/tutor-applications/${applicationId}/reject`);
    },
    onSuccess: () => {
      toast({
        title: "Application rejected",
        description: "The tutor application has been rejected",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tutor-applications"] });
      setIsRejectDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to reject application",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mock data for demo
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
      reviews: [],
      isApproved: true,
      cwa: 3.7
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
      reviews: [],
      isApproved: true,
      cwa: 3.8
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
      reviews: [],
      isApproved: true,
      cwa: 3.6
    },
    {
      id: 4,
      username: "abenaappiah",
      email: "abena@example.com",
      fullName: "Abena Appiah",
      role: "tutor",
      department: "Chemistry",
      yearOfStudy: 4,
      rating: 4.7,
      subjects: ["Organic Chemistry", "Inorganic Chemistry", "Biochemistry"],
      price: 60,
      availability: [],
      reviews: [],
      isApproved: false,
      cwa: 3.9
    }
  ];

  const mockApplications: TutorApplication[] = [
    {
      userId: 5,
      fullName: "Abena Appiah",
      department: "Chemistry",
      yearOfStudy: 4,
      cwa: 3.9,
      subjects: ["Organic Chemistry", "Inorganic Chemistry", "Biochemistry"],
      transcriptPath: "/uploads/transcripts/abena-transcript.pdf",
      status: "pending"
    },
    {
      userId: 6,
      fullName: "Kofi Mensah",
      department: "Economics",
      yearOfStudy: 3,
      cwa: 3.5,
      subjects: ["Microeconomics", "Macroeconomics", "Econometrics"],
      transcriptPath: "/uploads/transcripts/kofi-transcript.pdf",
      status: "pending"
    },
    {
      userId: 7,
      fullName: "Ama Serwaa",
      department: "Medicine",
      yearOfStudy: 5,
      cwa: 3.8,
      subjects: ["Anatomy", "Physiology", "Biochemistry"],
      transcriptPath: "/uploads/transcripts/ama-transcript.pdf",
      status: "pending"
    }
  ];

  // Filter and search tutors
  const filteredTutors = (tutors || mockTutors).filter(tutor => {
    // Search filter
    const matchesSearch = 
      tutor.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tutor.fullName && tutor.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Status filter
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "approved" && tutor.isApproved) || 
      (statusFilter === "pending" && !tutor.isApproved);
    
    return matchesSearch && matchesStatus;
  });

  // Filter and search applications
  const filteredApplications = (applications || mockApplications).filter(app => {
    // Search filter
    const matchesSearch = 
      app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "approved" && app.status === "approved") || 
      (statusFilter === "pending" && app.status === "pending") ||
      (statusFilter === "rejected" && app.status === "rejected");
    
    return matchesSearch && matchesStatus;
  });

  const handleViewTutor = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setIsTutorInfoOpen(true);
  };

  const handleViewApplication = (application: TutorApplication) => {
    setSelectedApplication(application);
    setIsApplicationDetailOpen(true);
  };

  const handleApproveApplication = (application: TutorApplication) => {
    setSelectedApplication(application);
    setIsApproveDialogOpen(true);
  };

  const confirmApproveApplication = () => {
    if (selectedApplication) {
      approveApplicationMutation.mutate(selectedApplication.userId);
    }
  };

  const handleRejectApplication = (application: TutorApplication) => {
    setSelectedApplication(application);
    setIsRejectDialogOpen(true);
  };

  const confirmRejectApplication = () => {
    if (selectedApplication) {
      rejectApplicationMutation.mutate(selectedApplication.userId);
    }
  };

  const handleDownloadTranscript = (application: TutorApplication) => {
    toast({
      title: "Download Transcript",
      description: "Transcript download feature will be implemented soon.",
    });
  };

  const handleSendEmail = (email: string) => {
    toast({
      title: "Send Email",
      description: `Send email feature for ${email} will be implemented soon.`,
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Tutors</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                View and manage tutors and tutor applications
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tutors">Tutors</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Filters and Search */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={`Search ${activeTab === "tutors" ? "tutors" : "applications"}...`}
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-48">
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  {activeTab === "applications" && <option value="rejected">Rejected</option>}
                </select>
              </div>
            </div>

            <TabsContent value="tutors" className="mt-0">
              {/* Tutors Table */}
              {isTutorsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredTutors.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Subjects</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>CWA</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTutors.map((tutor) => (
                        <TableRow key={tutor.id}>
                          <TableCell className="font-medium">{tutor.fullName || tutor.username}</TableCell>
                          <TableCell>{tutor.department || "-"}</TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">
                              {tutor.subjects.join(", ")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                              {tutor.rating}
                            </div>
                          </TableCell>
                          <TableCell>{tutor.cwa}</TableCell>
                          <TableCell>
                            {tutor.isApproved ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                Pending
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewTutor(tutor)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  <span>View Details</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSendEmail(tutor.email)}>
                                  <Mail className="mr-2 h-4 w-4" />
                                  <span>Send Email</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  <span>Edit Details</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Lock className="mr-2 h-4 w-4" />
                                  <span>Suspend Tutor</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg p-8 text-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">No tutors found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="applications" className="mt-0">
              {/* Applications Table */}
              {isApplicationsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredApplications.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>CWA</TableHead>
                        <TableHead>Subjects</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((application) => (
                        <TableRow key={application.userId}>
                          <TableCell className="font-medium">{application.fullName}</TableCell>
                          <TableCell>{application.department}</TableCell>
                          <TableCell>{application.yearOfStudy}</TableCell>
                          <TableCell>{application.cwa}</TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">
                              {application.subjects.join(", ")}
                            </div>
                          </TableCell>
                          <TableCell>
                            {application.status === "approved" ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                Approved
                              </span>
                            ) : application.status === "rejected" ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                                Rejected
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                Pending
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewApplication(application)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDownloadTranscript(application)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              {application.status === "pending" && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-green-600 dark:text-green-400"
                                    onClick={() => handleApproveApplication(application)}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-red-600 dark:text-red-400"
                                    onClick={() => handleRejectApplication(application)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg p-8 text-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">No applications found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </TabsContent>
          </main>
        </div>
      </div>
      
      <Footer />

      {/* Tutor Details Dialog */}
      <Dialog open={isTutorInfoOpen} onOpenChange={setIsTutorInfoOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Tutor Details</DialogTitle>
            <DialogDescription>
              Information about the selected tutor
            </DialogDescription>
          </DialogHeader>
          {selectedTutor && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center">
                      <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                        <span className="text-primary-800 font-bold text-2xl">
                          {selectedTutor.fullName 
                            ? selectedTutor.fullName.split(" ").map(n => n[0]).join("").toUpperCase() 
                            : selectedTutor.username.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-center">{selectedTutor.fullName || selectedTutor.username}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{selectedTutor.email}</p>
                      <div className="mt-2 flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                        <span>{selectedTutor.rating} Rating</span>
                      </div>
                      <p className="mt-1 text-sm">
                        CWA: <span className="font-medium">{selectedTutor.cwa}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</dt>
                        <dd className="mt-1 text-sm">{selectedTutor.department || "Not specified"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Year of Study</dt>
                        <dd className="mt-1 text-sm">{selectedTutor.yearOfStudy || "Not specified"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Session Price</dt>
                        <dd className="mt-1 text-sm">GHS {selectedTutor.price} per hour</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                        <dd className="mt-1 text-sm">
                          {selectedTutor.isApproved ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                              Pending
                            </span>
                          )}
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Subjects</dt>
                        <dd className="mt-1 text-sm">
                          <div className="flex flex-wrap gap-1">
                            {selectedTutor.subjects.map((subject, index) => (
                              <span 
                                key={index} 
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                              >
                                {subject}
                              </span>
                            ))}
                          </div>
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
                
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={() => handleSendEmail(selectedTutor.email)}>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </Button>
                      <Button>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                      {!selectedTutor.isApproved ? (
                        <Button variant="default" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve Tutor
                        </Button>
                      ) : (
                        <Button variant="destructive">
                          <Lock className="mr-2 h-4 w-4" />
                          Suspend Tutor
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Application Detail Dialog */}
      <Dialog open={isApplicationDetailOpen} onOpenChange={setIsApplicationDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Review the tutor application
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Applicant Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-1 gap-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</dt>
                        <dd className="mt-1 text-sm">{selectedApplication.fullName}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</dt>
                        <dd className="mt-1 text-sm">{selectedApplication.department}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Year of Study</dt>
                        <dd className="mt-1 text-sm">{selectedApplication.yearOfStudy}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">CWA</dt>
                        <dd className="mt-1 text-sm">{selectedApplication.cwa}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Application Status</dt>
                        <dd className="mt-1 text-sm">
                          {selectedApplication.status === "approved" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              Approved
                            </span>
                          ) : selectedApplication.status === "rejected" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                              Rejected
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                              Pending
                            </span>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle>Teaching Subjects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {selectedApplication.subjects.map((subject, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle>Academic Transcript</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-gray-500" />
                        <span className="text-sm">{selectedApplication.transcriptPath.split('/').pop()}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadTranscript(selectedApplication)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {selectedApplication.status === "pending" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex space-x-2">
                        <Button 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproveApplication(selectedApplication)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button 
                          variant="destructive" 
                          className="flex-1"
                          onClick={() => handleRejectApplication(selectedApplication)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Application Dialog */}
      <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve {selectedApplication?.fullName}'s application to become a tutor?
              This will give them access to create courses and be visible to learners.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmApproveApplication}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Application Dialog */}
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject {selectedApplication?.fullName}'s application to become a tutor?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRejectApplication}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
