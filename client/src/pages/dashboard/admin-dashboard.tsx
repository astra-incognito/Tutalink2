import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BookingCard } from "@/components/cards/booking-card";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  UserCheck,
  Calendar,
  BookOpen,
  BarChart,
  Search,
  Loader2,
  Star,
  User as UserIcon,
  Edit,
  Trash2,
  Eye,
  KeyRound,
  CheckSquare,
  Square
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { UserRole } from "@shared/schema";
import type { User, Booking, UserRoleType } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface PendingUser extends Omit<User, "password"> {}
interface BookingData extends Booking {
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

// Add user edit schema
const userEditSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["admin", "tutor", "learner"]),
  isActive: z.boolean(),
});

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
  const [page, setPage] = useState(1);
  const usersPerPage = 10;

  // Redirect if not admin
  if (user?.role !== UserRole.ADMIN) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <AlertTriangle className="h-12 w-12 text-yellow-500" />
              <h1 className="text-2xl font-bold">Admin Access Required</h1>
              <p className="text-center text-gray-600">
                You don't have permission to access the admin dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get pending users
  const { data: pendingUsers, isLoading: pendingUsersLoading } = useQuery<PendingUser[]>({
    queryKey: ["admin", "pending-users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/pending-users");
      return await res.json();
    },
  });

  // Get all users
  const { data: allUsers, isLoading: allUsersLoading } = useQuery<PendingUser[]>({
    queryKey: ["admin", "all-users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/users");
      return await res.json();
    },
  });

  // Get all bookings
  const { data: allBookings, isLoading: allBookingsLoading } = useQuery<BookingData[]>({
    queryKey: ["admin", "all-bookings"],
    queryFn: async () => {
      // For demonstration, we'll use the mock data structure
      const res = await apiRequest("GET", "/api/admin/bookings");
      return await res.json();
    },
  });

  // Approve user mutation
  const approveUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("PATCH", `/api/admin/approve-user/${userId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pending-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "all-users"] });
      toast({
        title: "User approved",
        description: "The user has been approved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error approving user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reject user mutation
  const rejectUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/reject-user/${userId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pending-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "all-users"] });
      toast({
        title: "User rejected",
        description: "The user has been rejected successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error rejecting user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter users based on search query
  const filteredUsers = allUsers?.filter((user) => {
    const matchesQuery =
      searchQuery === "" ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive);

    return matchesQuery && matchesStatus;
  });

  // Pagination logic
  const paginatedUsers = filteredUsers?.slice((page - 1) * usersPerPage, page * usersPerPage) || [];
  const totalPages = filteredUsers ? Math.ceil(filteredUsers.length / usersPerPage) : 1;

  // Bulk selection logic
  const allSelected = paginatedUsers.length > 0 && paginatedUsers.every(u => selectedUsers.includes(u.id));
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedUsers(selectedUsers.filter(id => !paginatedUsers.some(u => u.id === id)));
    } else {
      setSelectedUsers([
        ...selectedUsers,
        ...paginatedUsers.filter(u => !selectedUsers.includes(u.id)).map(u => u.id)
      ]);
    }
  };
  const toggleSelectUser = (id: number) => {
    setSelectedUsers(selectedUsers.includes(id)
      ? selectedUsers.filter(uid => uid !== id)
      : [...selectedUsers, id]);
  };

  // User actions
  const handleEditUser = (user: Partial<User>) => {
    setCurrentUser(user);
    setShowEditModal(true);
  };
  const handleViewUser = (user: Partial<User>) => {
    setCurrentUser(user);
    setShowViewModal(true);
  };
  const handleDeleteUser = (user: Partial<User>) => {
    setCurrentUser(user);
    setShowDeleteDialog(true);
  };
  const handleResetPassword = (user: Partial<User>) => {
    setCurrentUser(user);
    setShowResetDialog(true);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };

  // Handle approve/reject actions
  const handleApproveUser = (userId: number) => {
    approveUserMutation.mutate(userId);
  };

  const handleRejectUser = (userId: number) => {
    rejectUserMutation.mutate(userId);
  };

  // Statistics count
  const totalUsers = allUsers?.length || 0;
  const totalTutors = allUsers?.filter(u => u.role === UserRole.TUTOR).length || 0;
  const totalLearners = allUsers?.filter(u => u.role === UserRole.LEARNER).length || 0;
  const totalPendingUsers = pendingUsers?.length || 0;
  const totalBookings = allBookings?.length || 0;
  const completedBookings = allBookings?.filter(b => b.status === "completed").length || 0;
  const pendingBookings = allBookings?.filter(b => b.status === "pending").length || 0;
  const adminEarnings = (totalBookings * 50 * 0.10).toFixed(2);

  // Edit user form
  const editForm = useForm({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      fullName: currentUser?.fullName || "",
      email: currentUser?.email || "",
      role: currentUser?.role || "learner",
      isActive: currentUser?.isActive ?? true,
    },
    values: currentUser ? {
      fullName: currentUser.fullName || "",
      email: currentUser.email || "",
      role: currentUser.role || "learner",
      isActive: currentUser.isActive ?? true,
    } : undefined,
  });

  const editUserMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!currentUser?.id) return;
      const res = await apiRequest("PATCH", `/api/users/${currentUser.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "all-users"] });
      setShowEditModal(false);
      toast({ title: "User updated", description: "User details updated successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error updating user", description: error.message, variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id) return;
      const res = await apiRequest("DELETE", `/api/admin/users/${currentUser.id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "all-users"] });
      setShowDeleteDialog(false);
      toast({ title: "User deleted", description: "User deleted successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error deleting user", description: error.message, variant: "destructive" });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (newPassword: string) => {
      if (!currentUser?.id) return;
      const res = await apiRequest("POST", `/api/users/${currentUser.id}/change-password`, { newPassword });
      return await res.json();
    },
    onSuccess: () => {
      setShowResetDialog(false);
      toast({ title: "Password reset", description: "Password reset successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error resetting password", description: error.message, variant: "destructive" });
    },
  });

  const [resetPassword, setResetPassword] = useState("");

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SidebarNav />

      <div className="flex-1 w-full overflow-x-hidden">
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md w-full"
        >
          <div className="max-w-7xl mx-auto p-5 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h1 className="text-2xl md:text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-indigo-100 mt-1 text-sm">Manage your tutoring platform</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-4 md:mt-0 flex flex-wrap gap-2"
              >
                <Badge className="bg-white/20 text-white hover:bg-white/30 transition-colors">
                  {totalUsers} Users
                </Badge>
                <Badge className="bg-emerald-500/90 text-white hover:bg-emerald-500 transition-colors">
                  {totalTutors} Tutors
                </Badge>
                {totalPendingUsers > 0 && (
                  <Badge className="bg-amber-500/90 text-white hover:bg-amber-500 transition-colors animate-pulse">
                    {totalPendingUsers} Pending
                  </Badge>
                )}
              </motion.div>
            </div>
          </div>
        </motion.header>

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 w-full">
          {/* Analytics/Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-md border-blue-100">
              <CardContent className="flex items-center gap-4 py-6">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{totalUsers}</div>
                  <div className="text-sm text-gray-500">Total Users</div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-md border-purple-100">
              <CardContent className="flex items-center gap-4 py-6">
                <UserCheck className="h-8 w-8 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">{totalTutors}</div>
                  <div className="text-sm text-gray-500">Tutors</div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-md border-green-100">
              <CardContent className="flex items-center gap-4 py-6">
                <UserIcon className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{totalLearners}</div>
                  <div className="text-sm text-gray-500">Learners</div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-md border-amber-100">
              <CardContent className="flex items-center gap-4 py-6">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
                <div>
                  <div className="text-2xl font-bold">{totalPendingUsers}</div>
                  <div className="text-sm text-gray-500">Pending Users</div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-md border-indigo-100">
              <CardContent className="flex items-center gap-4 py-6">
                <Calendar className="h-8 w-8 text-indigo-500" />
                <div>
                  <div className="text-2xl font-bold">{totalBookings}</div>
                  <div className="text-sm text-gray-500">Total Bookings</div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-md border-green-200">
              <CardContent className="flex items-center gap-4 py-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{completedBookings}</div>
                  <div className="text-sm text-gray-500">Completed Bookings</div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-md border-amber-200">
              <CardContent className="flex items-center gap-4 py-6">
                <Loader2 className="h-8 w-8 text-amber-600 animate-spin-slow" />
                <div>
                  <div className="text-2xl font-bold">{pendingBookings}</div>
                  <div className="text-sm text-gray-500">Pending Bookings</div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-md border-emerald-200">
              <CardContent className="flex items-center gap-4 py-6">
                <Star className="h-8 w-8 text-emerald-600" />
                <div>
                  <div className="text-2xl font-bold">${adminEarnings}</div>
                  <div className="text-sm text-gray-500">Revenue</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 p-1 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm w-full md:w-auto">
              <TabsTrigger 
                value="users"
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all duration-200"
              >
                <Users className="w-4 h-4 mr-2" />
                Users
                {totalPendingUsers > 0 && (
                  <Badge className="ml-2 bg-amber-100 text-amber-800 border border-amber-200">
                    {totalPendingUsers}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="bookings"
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all duration-200"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Bookings
              </TabsTrigger>
              <TabsTrigger 
                value="analytics"
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all duration-200"
              >
                <BarChart className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users" className="w-full">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants}>
                  <Card className="mb-6 border-amber-200 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full -mt-12 -mr-12 z-0"></div>
                    <CardHeader className="relative z-10 border-b border-amber-100">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-amber-700">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Pending Approval Requests
                          </CardTitle>
                          <CardDescription>
                            Review and approve/reject new user registrations
                          </CardDescription>
                        </div>
                        {pendingUsers && pendingUsers.length > 0 && (
                          <Badge 
                            className="bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 transition-colors"
                          >
                            {pendingUsers.length} {pendingUsers.length === 1 ? 'request' : 'requests'} pending
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {pendingUsersLoading ? (
                        <div className="flex justify-center p-6">
                          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                        </div>
                      ) : pendingUsers && pendingUsers.length > 0 ? (
                        <div className="overflow-x-auto rounded-md border border-amber-100">
                          <Table>
                            <TableHeader className="bg-amber-50">
                              <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {pendingUsers.map((user, index) => (
                                <motion.tr
                                  key={user.id}
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: index * 0.05 }}
                                  className="group hover:bg-amber-50/70 transition-colors"
                                >
                                  <TableCell>
                                    <div className="flex items-center space-x-3">
                                      <Avatar className="h-9 w-9 border-2 border-amber-100 group-hover:border-amber-200 transition-colors">
                                        <AvatarImage src={user.profilePicture || ""} alt={user.fullName} />
                                        <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-500 text-white">
                                          {user.fullName.split(" ").map((n) => n[0]).join("")}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="font-medium">{user.fullName}</div>
                                        <div className="text-sm text-gray-500">@{user.username}</div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>{user.email}</TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant={user.role === UserRole.TUTOR ? 'secondary' : 'outline'}
                                      className={user.role === UserRole.TUTOR ? 
                                        'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200' : 
                                        'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200'
                                      }
                                    >
                                      {user.role}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {new Date(user.createdAt).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                                          onClick={() => handleApproveUser(user.id)}
                                        >
                                          <CheckCircle className="mr-1 h-4 w-4" />
                                          Approve
                                        </Button>
                                      </motion.div>
                                      <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                          onClick={() => handleRejectUser(user.id)}
                                        >
                                          <XCircle className="mr-1 h-4 w-4" />
                                          Reject
                                        </Button>
                                      </motion.div>
                                    </div>
                                  </TableCell>
                                </motion.tr>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center p-8 rounded-lg border border-dashed border-amber-200 bg-amber-50/50">
                          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3 opacity-80" />
                          <h3 className="text-base font-medium text-gray-700 mb-1">All caught up!</h3>
                          <p className="text-gray-500">There are no pending approval requests right now.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="w-full">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle>All Bookings</CardTitle>
                      <CardDescription>
                        Manage and review all tutorial sessions on the platform
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            placeholder="Search by tutor, learner, or course..."
                            className="pl-10"
                          />
                        </div>
                        <Select defaultValue="all">
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Bookings</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {allBookingsLoading ? (
                        <div className="flex justify-center p-6">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : allBookings && allBookings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {allBookings.map((booking) => (
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
                              notes={booking.notes || ""}
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
              </motion.div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="w-full">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants}>
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Platform Overview</CardTitle>
                      <CardDescription>
                        Key metrics and statistics for the TutaLink platform
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Main Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Total Users</p>
                              <p className="text-2xl font-semibold">{totalUsers}</p>
                              <p className="text-xs text-green-600">+12% this month</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-full">
                              <UserCheck className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Tutors</p>
                              <p className="text-2xl font-semibold">{totalTutors}</p>
                              <p className="text-xs text-green-600">+8% this month</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-full">
                              <Users className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Learners</p>
                              <p className="text-2xl font-semibold">{totalLearners}</p>
                              <p className="text-xs text-green-600">+15% this month</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded-full">
                              <Calendar className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Bookings</p>
                              <p className="text-2xl font-semibold">{totalBookings}</p>
                              <p className="text-xs text-green-600">+20% this month</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-6" />

                      {/* Detailed Analytics Grid */}
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* User Growth & Demographics */}
                        <div className="space-y-6">
                          <div>
                            <h3 className="font-medium text-lg mb-4">User Growth</h3>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span>New Users (30 days)</span>
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">+{Math.floor(totalUsers * 0.12)}</span>
                                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "12%" }}></div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Active Users</span>
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">{Math.floor(totalUsers * 0.85)}</span>
                                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 rounded-full" style={{ width: "85%" }}></div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>User Retention</span>
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">92%</span>
                                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 rounded-full" style={{ width: "92%" }}></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-medium text-lg mb-4">User Demographics</h3>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span>Age 18-24</span>
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">45%</span>
                                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: "45%" }}></div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Age 25-34</span>
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">35%</span>
                                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: "35%" }}></div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Age 35+</span>
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">20%</span>
                                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: "20%" }}></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Booking & Revenue Metrics */}
                        <div className="space-y-6">
                          <div>
                            <h3 className="font-medium text-lg mb-4">Booking Statistics</h3>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span>Completed Sessions</span>
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">{completedBookings}</span>
                                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${(completedBookings / totalBookings) * 100}%` }}></div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Pending Requests</span>
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">{pendingBookings}</span>
                                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${(pendingBookings / totalBookings) * 100}%` }}></div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Average Session Duration</span>
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">1.5 hrs</span>
                                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "75%" }}></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-medium text-lg mb-4">Revenue Metrics</h3>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span>Monthly Revenue</span>
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">${(totalBookings * 50).toLocaleString()}</span>
                                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "85%" }}></div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Average Session Price</span>
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">$50</span>
                                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "70%" }}></div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Platform Fee</span>
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">10%</span>
                                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "10%" }}></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recent Activity Section */}
                      <div className="mt-8">
                        <h3 className="font-medium text-lg mb-4">Recent Activity</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="flex p-3 border border-gray-200 rounded-lg">
                            <div className="mr-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <UserCheck className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium">New tutor registered</p>
                              <p className="text-xs text-gray-500">2 hours ago</p>
                            </div>
                          </div>
                          <div className="flex p-3 border border-gray-200 rounded-lg">
                            <div className="mr-3">
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-green-600" />
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium">New booking created</p>
                              <p className="text-xs text-gray-500">5 hours ago</p>
                            </div>
                          </div>
                          <div className="flex p-3 border border-gray-200 rounded-lg">
                            <div className="mr-3">
                              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <Star className="h-5 w-5 text-purple-600" />
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium">New review submitted</p>
                              <p className="text-xs text-gray-500">1 day ago</p>
                            </div>
                          </div>
                        </div>
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
