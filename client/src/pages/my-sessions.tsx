import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

interface Session {
  id: number;
  status: "upcoming" | "completed" | "cancelled";
  date: string;
  hasReview: boolean;
  tutor: {
    id: number;
    fullName: string;
    profilePicture?: string;
  };
  course?: {
    id: number;
    name: string;
  };
}

export default function MySessions() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ["sessions", "learner", user?.id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/sessions/learner/${user?.id}`);
      return await res.json();
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <SidebarNav />
        <main className="flex-1 max-w-4xl mx-auto py-8 px-4">
          <div className="text-center text-gray-500">Loading sessions...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SidebarNav />
      <main className="flex-1 max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card className="mb-8 shadow-lg border-indigo-100">
          <CardHeader>
            <CardTitle className="text-2xl text-indigo-700">My Sessions</CardTitle>
            <CardDescription>View and manage your tutoring sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions && sessions.length > 0 ? (
                sessions.map((session) => (
                  <Card key={session.id} className="border border-indigo-50 shadow">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold">
                          {session.tutor.fullName.split(" ").map((n: string) => n[0]).join("")}
                        </span>
                        <div>
                          <div className="font-semibold">{session.tutor.fullName}</div>
                          <div className="text-xs text-gray-400">
                            {session.course ? session.course.name : "General Session"}
                          </div>
                        </div>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        {session.status === "completed" && !session.hasReview && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/submit-review/${session.id}`)}
                          >
                            Review Session
                          </Button>
                        )}
                        {session.status === "completed" && session.hasReview && (
                          <span className="text-sm text-gray-500">Reviewed</span>
                        )}
                        <span className={`px-2 py-1 rounded text-xs ${
                          session.status === "completed" ? "bg-green-100 text-green-700" :
                          session.status === "upcoming" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-600">
                        {new Date(session.date).toLocaleDateString()} at{" "}
                        {new Date(session.date).toLocaleTimeString()}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">No sessions found.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 