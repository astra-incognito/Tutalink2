import * as React from "react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import { User } from "@/lib/types";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ChevronDown,
  Search,
  UserPlus,
  MoreHorizontal,
  UserCog,
  Shield,
  Trash,
  CheckCircle,
  XCircle,
  Mail,
  Key,
  Loader2,
  Filter,
} from "lucide-react";

export default function ManageUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState("");
  const { toast } = useToast();

  // Fetch users from API
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: false, // Disabled for demo
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Change user role mutation
  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      await apiRequest("PATCH", `/api/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      toast({
        title: "Role updated",
        description: `User has been ${newRole === "admin" ? "promoted to admin" : newRole === "tutor" ? "set as tutor" : "set as learner"}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsPromoteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to update role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest("POST", `/api/admin/users/${userId}/reset-password`);
    },
    onSuccess: () => {
      toast({
        title: "Password reset",
        description: "A temporary password has been sent to the user's email",
      });
      setIsResetPasswordDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to reset password",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Approve/reject user mutation
  const updateApprovalMutation = useMutation({
    mutationFn: async ({ userId, isApproved }: { userId: number; isApproved: boolean }) => {
      await apiRequest("PATCH", `/api/admin/users/${userId}/approve`, { isApproved });
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.isApproved ? "User approved" : "User rejected",
        description: `The user has been ${variables.isApproved ? "approved" : "rejected"} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update user status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mock data for demo
  const mockUsers: User[] = [
    {
      id: 1,
      username: "john_doe",
      email: "john@example.com",
      fullName: "John Doe",
      role: "learner",
      department: "Computer Science",
      yearOfStudy: 3,
      isApproved: true
    },
    {
      id: 2,
      username: "sarahamoah",
      email: "sarah@example.com",
      fullName: "Sarah Amoah",
      role: "tutor",
      department: "Mathematics",
      yearOfStudy: 4,
      isApproved: true,
      cwa: 3.8
    },
    {
      id: 3,
      username: "kofi_mensah",
      email: "kofi@example.com",
      fullName: "Kofi Mensah",
      role: "learner",
      department: "Engineering",
      yearOfStudy: 2,
      isApproved: false
    },
    {
      id: 4,
      username: "admin123",
      email: "admin@tutalink.com",
      fullName: "Admin User",
      role: "admin",
      isApproved: true
    },
    {
      id: 5,
      username: "ama_serwaa",
      email: "ama@example.com",
      fullName: "Ama Serwaa",
      role: "tutor",
      department: "Physics",
      yearOfStudy: 3,
      isApproved: true,
      cwa: 3.9
    },
    {
      id: 6,
      username: "kwame_owusu",
      email: "kwame@example.com",
      fullName: "Kwame Owusu",
      role: "learner",
      department: "Chemistry",
      yearOfStudy: 2,
      isApproved: true
    },
    {
      id: 7,
      username: "abenaappiah",
      email: "abena@example.com",
      fullName: "Abena Appiah",
      role: "learner",
      department: "Medicine",
      yearOfStudy: 4,
      isApproved: false
    }
  ];

  // Filter and search users
  const filteredUsers = (users || mockUsers).filter(user => {
    // Search filter
    const matchesSearch = 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.fullName && user.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Role filter
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    // Status filter
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "approved" && user.isApproved) || 
      (statusFilter === "pending" && !user.isApproved);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  const handleChangeRole = (user: User, role: string) => {
    setSelectedUser(user);
    setNewRole(role);
    setIsPromoteDialogOpen(true);
  };

  const confirmChangeRole = () => {
    if (selectedUser && newRole) {
      changeRoleMutation.mutate({ userId: selectedUser.id, role: newRole });
    }
  };

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setIsResetPasswordDialogOpen(true);
  };

  const confirmResetPassword = () => {
    if (selectedUser) {
      resetPasswordMutation.mutate(selectedUser.id);
    }
  };

  const handleApproveUser = (user: User) => {
    updateApprovalMutation.mutate({ userId: user.id, isApproved: true });
  };

  const handleRejectUser = (user: User) => {
    updateApprovalMutation.mutate({ userId: user.id, isApproved: false });
  };

  const handleSendEmail = (user: User) => {
    toast({
      title: "Email Feature",
      description: `Send email feature for ${user.fullName || user.username} will be implemented soon.`,
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="pt-16 flex flex-1">
        <Sidebar />
        
        <div className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <main className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Users</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  View and manage all users on the platform
                </p>
              </div>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </div>

            {/* Filters and Search */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <div className="w-40">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <div className="flex items-center">
                        <Filter className="mr-2 h-4 w-4" />
                        <span>{roleFilter === "all" ? "All Roles" : roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="learner">Learner</SelectItem>
                      <SelectItem value="tutor">Tutor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-40">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <div className="flex items-center">
                        <Filter className="mr-2 h-4 w-4" />
                        <span>
                          {statusFilter === "all" 
                            ? "All Status" 
                            : statusFilter === "approved" 
                              ? "Approved" 
                              : "Pending"}
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.fullName || "-"}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                            ${user.role === "admin" 
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" 
                              : user.role === "tutor" 
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" 
                                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"}`}
                          >
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {user.isApproved === undefined || user.isApproved ? (
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
                              <DropdownMenuItem onClick={() => handleChangeRole(user, "learner")}>
                                <UserCog className="mr-2 h-4 w-4" />
                                <span>Set as Learner</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangeRole(user, "tutor")}>
                                <UserCog className="mr-2 h-4 w-4" />
                                <span>Set as Tutor</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangeRole(user, "admin")}>
                                <Shield className="mr-2 h-4 w-4" />
                                <span>Promote to Admin</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                                <Key className="mr-2 h-4 w-4" />
                                <span>Reset Password</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSendEmail(user)}>
                                <Mail className="mr-2 h-4 w-4" />
                                <span>Send Email</span>
                              </DropdownMenuItem>
                              {user.isApproved === false && (
                                <DropdownMenuItem onClick={() => handleApproveUser(user)}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  <span>Approve User</span>
                                </DropdownMenuItem>
                              )}
                              {user.isApproved === true && (
                                <DropdownMenuItem onClick={() => handleRejectUser(user)}>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  <span>Reject User</span>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-600 dark:text-red-400"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Delete User</span>
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
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No users found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
      
      <Footer />

      {/* Delete User Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUser?.fullName || selectedUser?.username}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Role Dialog */}
      <AlertDialog open={isPromoteDialogOpen} onOpenChange={setIsPromoteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {newRole === "admin" 
                ? "Promote to Admin" 
                : newRole === "tutor" 
                  ? "Set as Tutor" 
                  : "Set as Learner"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {newRole === "admin" 
                ? "promote" 
                : "change the role of"} {selectedUser?.fullName || selectedUser?.username} to {newRole}?
              {newRole === "admin" && " This will give them full administrative privileges."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmChangeRole}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <AlertDialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset the password for {selectedUser?.fullName || selectedUser?.username} and send a temporary password to their email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmResetPassword}>
              Reset Password
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
