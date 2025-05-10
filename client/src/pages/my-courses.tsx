import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { BookOpen, Edit, Plus, Users, Info, Calendar, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Course {
  id: number;
  name: string;
  department: string;
  code: string;
  description?: string;
  objectives?: string;
  materials?: string;
  frequency?: string;
  duration?: string;
  price?: number;
}

interface Booking {
  id: number;
  learner: { id: number; fullName: string; profilePicture?: string };
  course: Course;
  status: string;
}

export default function MyCourses() {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvailModal, setShowAvailModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [newCourse, setNewCourse] = useState({ name: "", department: "", code: "", description: "" });

  // Fetch tutor details (including courses)
  const { data: tutorData, isLoading: tutorLoading } = useQuery({
    queryKey: ["tutor", user?.id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/tutors/${user?.id}`);
      return await res.json();
    },
    enabled: !!user?.id,
  });

  // Fetch bookings for this tutor (to get enrolled students)
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["bookings", "tutor", user?.id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/bookings/tutor/${user?.id}`);
      return await res.json();
    },
    enabled: !!user?.id,
  });

  // Create course mutation (placeholder, needs backend endpoint)
  const createCourseMutation = useMutation({
    mutationFn: async (course: any) => {
      const res = await apiRequest("POST", "/api/courses", course);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutor", user?.id] });
      setShowCreateModal(false);
      setNewCourse({ name: "", department: "", code: "", description: "" });
    },
  });

  // Helper: Get enrolled students for a course
  function getEnrolledStudents(courseId: number): { id: number; fullName: string; profilePicture?: string }[] {
    if (!bookings) return [];
    const students = bookings
      .filter((b: Booking) => b.course.id === courseId && b.learner)
      .map((b: Booking) => b.learner as { id: number; fullName: string; profilePicture?: string });
    // Unique by learner id
    return students.filter((s: { id: number }, idx: number, arr: { id: number }[]) => arr.findIndex((x: { id: number }) => x.id === s.id) === idx);
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SidebarNav />
      <main className="flex-1 max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card className="mb-8 shadow-lg border-indigo-100">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-indigo-700 text-2xl">
                <BookOpen className="h-6 w-6 text-indigo-500" />
                My Courses
              </CardTitle>
              <CardDescription>
                Courses you have created or are assigned to as a tutor.
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateModal(true)} variant="default" className="gap-2">
              <Plus className="h-4 w-4" /> Create Course
            </Button>
          </CardHeader>
          <CardContent>
            {tutorLoading ? (
              <div className="text-center text-gray-500 py-8">Loading courses...</div>
            ) : tutorData?.courses?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tutorData.courses.map((course: Course) => {
                  const students = getEnrolledStudents(course.id);
                  return (
                    <Card key={course.id} className="shadow border border-indigo-50 hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="flex items-center gap-2">
                          <Info className="h-5 w-5 text-indigo-500" />
                          <CardTitle className="text-lg text-indigo-700">{course.name}</CardTitle>
                        </div>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" onClick={() => { setSelectedCourse(course); setShowEditModal(true); }}><Edit className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => { setSelectedCourse(course); setShowAvailModal(true); }}><Calendar className="h-4 w-4" /></Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-gray-600 text-sm">Subject: <span className="font-medium">{course.department}</span></div>
                        <div className="text-gray-600 text-sm">Code: <span className="font-mono">{course.code}</span></div>
                        <div className="text-gray-600 text-sm">Description: {course.description || <span className="italic text-gray-400">No description</span>}</div>
                        <div className="text-gray-600 text-sm">Objectives: {course.objectives || <span className="italic text-gray-400">No objectives</span>}</div>
                        <div className="text-gray-600 text-sm">Materials: {course.materials || <span className="italic text-gray-400">No materials</span>}</div>
                        <div className="text-gray-600 text-sm">Session Frequency: {course.frequency || <span className="italic text-gray-400">N/A</span>}</div>
                        <div className="text-gray-600 text-sm">Session Duration: {course.duration || <span className="italic text-gray-400">N/A</span>}</div>
                        <div className="text-gray-600 text-sm flex items-center gap-1"><DollarSign className="h-4 w-4" /> {course.price ? `${course.price}` : <span className="italic text-gray-400">Free</span>}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <Users className="h-4 w-4 text-indigo-500" />
                          <span className="font-medium">{students.length}</span> enrolled student{students.length !== 1 ? "s" : ""}
                        </div>
                        <div className="mt-2">
                          <div className="font-semibold text-gray-700 mb-1">Enrolled Students:</div>
                          {students.length > 0 ? (
                            <ul className="list-disc pl-6 text-sm">
                              {students.map((s: { id: number; fullName: string }) => (
                                <li key={s.id}>{s.fullName} <span className="ml-2 text-xs text-indigo-400">(Progress: <span className="text-gray-500">Coming soon</span>)</span></li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-gray-400 italic">No students enrolled yet.</div>
                          )}
                        </div>
                        <div className="mt-2">
                          <div className="font-semibold text-gray-700 mb-1">Student Progress:</div>
                          <div className="text-gray-400 italic">(Coming soon)</div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">No courses found. (Your courses will appear here.)</div>
            )}
          </CardContent>
        </Card>

        {/* Create Course Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={e => {
                e.preventDefault();
                createCourseMutation.mutate({ ...newCourse, tutorId: user?.id });
              }}
              className="space-y-4"
            >
              <Input
                placeholder="Course Name"
                value={newCourse.name}
                onChange={e => setNewCourse({ ...newCourse, name: e.target.value })}
                required
              />
              <Input
                placeholder="Department/Subject"
                value={newCourse.department}
                onChange={e => setNewCourse({ ...newCourse, department: e.target.value })}
                required
              />
              <Input
                placeholder="Course Code"
                value={newCourse.code}
                onChange={e => setNewCourse({ ...newCourse, code: e.target.value })}
                required
              />
              <Input
                placeholder="Description"
                value={newCourse.description}
                onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
              />
              <DialogFooter>
                <Button type="submit">Create</Button>
                <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Course Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
            </DialogHeader>
            {selectedCourse && (
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  // PATCH /api/courses/:id (backend must support this)
                  await apiRequest("PATCH", `/api/courses/${selectedCourse.id}`, selectedCourse);
                  queryClient.invalidateQueries({ queryKey: ["tutor", user?.id] });
                  setShowEditModal(false);
                }}
                className="space-y-4"
              >
                <Input
                  placeholder="Course Name"
                  value={selectedCourse.name}
                  onChange={e => setSelectedCourse({ ...selectedCourse, name: e.target.value })}
                  required
                />
                <Input
                  placeholder="Department/Subject"
                  value={selectedCourse.department}
                  onChange={e => setSelectedCourse({ ...selectedCourse, department: e.target.value })}
                  required
                />
                <Input
                  placeholder="Course Code"
                  value={selectedCourse.code}
                  onChange={e => setSelectedCourse({ ...selectedCourse, code: e.target.value })}
                  required
                />
                <Input
                  placeholder="Description"
                  value={selectedCourse.description || ""}
                  onChange={e => setSelectedCourse({ ...selectedCourse, description: e.target.value })}
                />
                <DialogFooter>
                  <Button type="submit">Save Changes</Button>
                  <Button type="button" variant="ghost" onClick={() => setShowEditModal(false)}>Cancel</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Availabilities Modal */}
        <Dialog open={showAvailModal} onOpenChange={setShowAvailModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Availabilities</DialogTitle>
            </DialogHeader>
            {selectedCourse && (
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  // POST/PATCH /api/availabilities (backend must support this)
                  // Example: await apiRequest("POST", "/api/availabilities", { tutorId: user?.id, ...availability });
                  setShowAvailModal(false);
                }}
                className="space-y-4"
              >
                <Input placeholder="Day of Week (e.g. Monday)" required />
                <Input placeholder="Start Time (e.g. 09:00)" required />
                <Input placeholder="End Time (e.g. 11:00)" required />
                <DialogFooter>
                  <Button type="submit">Save Availability</Button>
                  <Button type="button" variant="ghost" onClick={() => setShowAvailModal(false)}>Cancel</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
} 