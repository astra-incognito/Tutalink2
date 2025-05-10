import React from "react";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default function MyCourses() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SidebarNav />
      <main className="flex-1 max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card className="mb-8 shadow-lg border-indigo-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700 text-2xl">
              <BookOpen className="h-6 w-6 text-indigo-500" />
              My Courses
            </CardTitle>
            <CardDescription>
              Courses you have created or are assigned to as a tutor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* TODO: List courses, show syllabus, enrolled students, update options, and student progress */}
            <div className="text-gray-500 text-center py-8">
              No courses found. (This is a placeholder. Your courses will appear here.)
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 