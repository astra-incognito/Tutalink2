import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, BookOpen, XCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { UserRole } from "@shared/schema";
import type { Course } from "@shared/schema";

export default function ManageCourses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Partial<Course> | null>(null);
  const [form, setForm] = useState({ name: "", department: "", code: "", description: "" });

  // Redirect if not admin
  if (user?.role !== UserRole.ADMIN) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <XCircle className="h-12 w-12 text-red-500" />
              <h1 className="text-2xl font-bold">Admin Access Required</h1>
              <p className="text-center text-gray-600">
                You don't have permission to access the Manage Courses page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch all courses
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["admin", "all-courses"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/courses");
      return await res.json();
    },
  });

  // Add course mutation
  const addCourseMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await apiRequest("POST", "/api/courses", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "all-courses"] });
      setShowAddModal(false);
      setForm({ name: "", department: "", code: "", description: "" });
      toast({ title: "Course added", description: "New course added successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error adding course", description: error.message, variant: "destructive" });
    },
  });

  // Edit course mutation
  const editCourseMutation = useMutation({
    mutationFn: async (data: Partial<Course>) => {
      if (!currentCourse?.id) return;
      const res = await apiRequest("PATCH", `/api/courses/${currentCourse.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "all-courses"] });
      setShowEditModal(false);
      setCurrentCourse(null);
      toast({ title: "Course updated", description: "Course details updated successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error updating course", description: error.message, variant: "destructive" });
    },
  });

  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: async () => {
      if (!currentCourse?.id) return;
      const res = await apiRequest("DELETE", `/api/courses/${currentCourse.id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "all-courses"] });
      setShowDeleteDialog(false);
      setCurrentCourse(null);
      toast({ title: "Course deleted", description: "Course deleted successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error deleting course", description: error.message, variant: "destructive" });
    },
  });

  // Handlers
  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    addCourseMutation.mutate(form);
  };
  const handleEditCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCourse) return;
    editCourseMutation.mutate(form);
  };
  const openEditModal = (course: Course) => {
    setCurrentCourse(course);
    setForm({
      name: course.name,
      department: course.department,
      code: course.code,
      description: course.description || "",
    });
    setShowEditModal(true);
  };
  const openDeleteDialog = (course: Course) => {
    setCurrentCourse(course);
    setShowDeleteDialog(true);
  };

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
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="h-7 w-7 text-white" /> Manage Courses
                </h1>
                <p className="text-indigo-100 mt-1 text-sm">Admin: Add, edit, or remove courses</p>
              </motion.div>
              <Button
                className="mt-4 md:mt-0 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="h-5 w-5 mr-2" /> Add Course
              </Button>
            </div>
          </div>
        </motion.header>
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 w-full">
          <Card className="shadow-md border-indigo-100">
            <CardHeader>
              <CardTitle>All Courses</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8">Loading...</div>
              ) : (
                <div className="overflow-x-auto rounded-md border border-indigo-100">
                  <Table>
                    <TableHeader className="bg-indigo-50">
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses && courses.length > 0 ? (
                        courses.map((course) => (
                          <TableRow key={course.id}>
                            <TableCell>{course.name}</TableCell>
                            <TableCell>{course.department}</TableCell>
                            <TableCell>{course.code}</TableCell>
                            <TableCell>{course.description}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 mr-2"
                                onClick={() => openEditModal(course)}
                              >
                                <Edit className="h-4 w-4 mr-1" /> Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => openDeleteDialog(course)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-500">
                            No courses found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Add Course Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
            <DialogDescription>Fill in the details to add a new course.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddCourse} className="space-y-4">
            <Input
              label="Name"
              placeholder="Course Name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
            <Input
              label="Department"
              placeholder="Department"
              value={form.department}
              onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
              required
            />
            <Input
              label="Code"
              placeholder="Course Code"
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
              required
            />
            <Input
              label="Description"
              placeholder="Description (optional)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <DialogFooter>
              <Button type="submit" loading={addCourseMutation.isPending}>
                Add Course
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Course Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>Update the course details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditCourse} className="space-y-4">
            <Input
              label="Name"
              placeholder="Course Name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
            <Input
              label="Department"
              placeholder="Department"
              value={form.department}
              onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
              required
            />
            <Input
              label="Code"
              placeholder="Course Code"
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
              required
            />
            <Input
              label="Description"
              placeholder="Description (optional)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <DialogFooter>
              <Button type="submit" loading={editCourseMutation.isPending}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Course Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this course? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={deleteCourseMutation.isPending}
              onClick={() => deleteCourseMutation.mutate()}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 