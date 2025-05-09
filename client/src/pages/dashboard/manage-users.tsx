import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  Edit,
  Trash2,
  Eye,
  KeyRound,
  CheckSquare,
  Square,
  Search,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { UserRole } from "@shared/schema";
import type { User } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const userEditSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["admin", "tutor", "learner"]),
  isActive: z.boolean(),
});

export default function ManageUsersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
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
  const [resetPassword, setResetPassword] = useState("");

  // Get pending users
  const { data: pendingUsers, isLoading: pendingUsersLoading } = useQuery<User[]>({
    queryKey: ["admin", "pending-users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/pending-users");
      return await res.json();
    },
  });

  // Get all users
  const { data: allUsers, isLoading: allUsersLoading } = useQuery<User[]>({
    queryKey: ["admin", "all-users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/users");
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
    onError: (error: any) => {
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
    onError: (error: any) => {
      toast({
        title: "Error rejecting user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Edit user form
  const editForm = useForm({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      fullName: currentUser?.fullName || "",
      email: currentUser?.email || "",
      role: currentUser?.role || "learner",
      isActive: currentUser?.isActive ?? true,
    },
    values: currentUser
      ? {
          fullName: currentUser.fullName || "",
          email: currentUser.email || "",
          role: currentUser.role || "learner",
          isActive: currentUser.isActive ?? true,
        }
      : undefined,
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
  const handleApproveUser = (userId: number) => {
    approveUserMutation.mutate(userId);
  };
  const handleRejectUser = (userId: number) => {
    rejectUserMutation.mutate(userId);
  };

  if (user?.role !== UserRole.ADMIN) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <AlertTriangle className="h-12 w-12 text-yellow-500" />
              <h1 className="text-2xl font-bold">Admin Access Required</h1>
              <p className="text-center text-gray-600">
                You don't have permission to access the admin user management page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <h1 className="text-2xl md:text-3xl font-bold text-white">Manage Users</h1>
                <p className="text-indigo-100 mt-1 text-sm">Admin user management</p>
              </motion.div>
            </div>
          </div>
        </motion.header>
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 w-full">
          {/* Pending Users Section */}
          <motion.div initial="hidden" animate="visible">
            <motion.div>
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
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                        <CheckCircle className="h-8 w-8 animate-spin text-amber-500" />
                      </motion.div>
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

            {/* All Users Section */}
            <motion.div>
              <Card className="border-indigo-200 overflow-hidden relative">
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full -mb-16 -ml-16 z-0"></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mt-8 -mr-8 z-0"></div>
                <CardHeader className="relative z-10 border-b border-indigo-100">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-indigo-700">
                        <Users className="h-5 w-5 text-indigo-500" />
                        All Users
                      </CardTitle>
                      <CardDescription>
                        Manage all users on the platform
                      </CardDescription>
                    </div>
                    <Badge className="bg-indigo-100 text-indigo-800 border border-indigo-200">
                      {allUsers?.length || 0} total users
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 relative z-10">
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400" />
                      <Input
                        type="text"
                        placeholder="Search by name, email, or username..."
                        className="pl-10 border-indigo-200 focus:border-indigo-300 ring-indigo-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px] border-indigo-200">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {allUsersLoading ? (
                    <div className="flex justify-center p-6">
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                        <Users className="h-8 w-8 animate-spin text-indigo-500" />
                      </motion.div>
                    </div>
                  ) : filteredUsers && filteredUsers.length > 0 ? (
                    <div className="overflow-x-auto rounded-md border border-indigo-100">
                      <Table>
                        <TableHeader className="bg-indigo-50">
                          <TableRow>
                            <TableHead>
                              <button onClick={toggleSelectAll} className="focus:outline-none">
                                {allSelected ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5 text-gray-400" />}
                              </button>
                            </TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedUsers.map((user, index) => (
                            <motion.tr
                              key={user.id}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.03 }}
                              className="group hover:bg-indigo-50/70 transition-colors"
                            >
                              <TableCell>
                                <button onClick={() => toggleSelectUser(user.id)} className="focus:outline-none">
                                  {selectedUsers.includes(user.id) ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5 text-gray-400" />}
                                </button>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-9 w-9 border-2 border-indigo-100 group-hover:border-indigo-200 transition-colors">
                                    <AvatarImage src={user.profilePicture || ""} alt={user.fullName} />
                                    <AvatarFallback className={
                                      user.role === UserRole.ADMIN 
                                        ? "bg-gradient-to-br from-indigo-400 to-indigo-600 text-white" 
                                        : user.role === UserRole.TUTOR 
                                          ? "bg-gradient-to-br from-purple-400 to-purple-600 text-white"
                                          : "bg-gradient-to-br from-blue-400 to-blue-600 text-white"
                                    }>
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
                                  variant={user.role === UserRole.TUTOR ? 'secondary' : (user.role === UserRole.ADMIN ? 'default' : 'outline')}
                                  className={
                                    user.role === UserRole.ADMIN 
                                      ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-indigo-200' 
                                      : user.role === UserRole.TUTOR 
                                        ? 'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200'
                                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200'
                                  }
                                >
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className={user.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200'}
                                  variant="outline"
                                >
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button size="icon" variant="ghost" onClick={() => handleViewUser(user)} title="View Details">
                                    <Eye className="w-4 h-4 text-blue-500" />
                                  </Button>
                                  <Button size="icon" variant="ghost" onClick={() => handleEditUser(user)} title="Edit User">
                                    <Edit className="w-4 h-4 text-indigo-500" />
                                  </Button>
                                  <Button size="icon" variant="ghost" onClick={() => handleResetPassword(user)} title="Reset Password">
                                    <KeyRound className="w-4 h-4 text-amber-500" />
                                  </Button>
                                  <Button size="icon" variant="ghost" onClick={() => handleDeleteUser(user)} title="Delete User">
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center p-8 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/50">
                      <Search className="mx-auto h-12 w-12 text-indigo-400 mb-3 opacity-80" />
                      <h3 className="text-base font-medium text-gray-700 mb-1">No results found</h3>
                      <p className="text-gray-500">Try adjusting your search or filter parameters.</p>
                    </div>
                  )}
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <div className="inline-flex rounded-md shadow-sm" role="group">
                        {[...Array(totalPages)].map((_, i) => (
                          <Button
                            key={i}
                            size="sm"
                            variant={page === i + 1 ? "default" : "outline"}
                            className={
                              page === i + 1
                                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                : "bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                            }
                            onClick={() => setPage(i + 1)}
                          >
                            {i + 1}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Modals and Dialogs for user actions */}
          {/* Edit User Modal */}
          <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>Update user details below.</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={editForm.handleSubmit((data) => editUserMutation.mutate(data))}
                className="space-y-4"
              >
                <Input
                  label="Full Name"
                  {...editForm.register("fullName")}
                  defaultValue={currentUser?.fullName}
                />
                <Input
                  label="Email"
                  type="email"
                  {...editForm.register("email")}
                  defaultValue={currentUser?.email}
                />
                <Select
                  value={editForm.watch("role")}
                  onValueChange={(value) => editForm.setValue("role", value as User["role"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="tutor">Tutor</SelectItem>
                    <SelectItem value="learner">Learner</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.watch("isActive")}
                    onChange={(e) => editForm.setValue("isActive", e.target.checked)}
                  />
                  <span>Active</span>
                </div>
                <DialogFooter>
                  <Button type="submit" loading={editUserMutation.isPending}>
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* View User Modal */}
          <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={currentUser?.profilePicture || ""} alt={currentUser?.fullName || ""} />
                    <AvatarFallback>
                      {currentUser?.fullName?.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-lg">{currentUser?.fullName}</div>
                    <div className="text-gray-500">@{currentUser?.username}</div>
                  </div>
                </div>
                <div>Email: {currentUser?.email}</div>
                <div>Role: {currentUser?.role}</div>
                <div>Status: {currentUser?.isActive ? "Active" : "Inactive"}</div>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowViewModal(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete User Dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete User</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this user? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  loading={deleteUserMutation.isPending}
                  onClick={() => deleteUserMutation.mutate()}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Reset Password Dialog */}
          <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reset Password</DialogTitle>
                <DialogDescription>
                  Enter a new password for this user.
                </DialogDescription>
              </DialogHeader>
              <Input
                label="New Password"
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowResetDialog(false)}>
                  Cancel
                </Button>
                <Button
                  loading={resetPasswordMutation.isPending}
                  onClick={() => resetPasswordMutation.mutate(resetPassword)}
                >
                  Reset Password
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
} 