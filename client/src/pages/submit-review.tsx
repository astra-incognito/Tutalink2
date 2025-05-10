import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Session {
  id: number;
  tutor: {
    id: number;
    fullName: string;
    profilePicture?: string;
  };
  course?: {
    id: number;
    name: string;
  };
  date: string;
}

export default function SubmitReview() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // Fetch session details
  const { data: session, isLoading } = useQuery<Session>({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/sessions/${sessionId}`);
      return await res.json();
    },
    enabled: !!sessionId,
  });

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/reviews`, {
        sessionId: Number(sessionId),
        rating,
        comment,
        tutorId: session?.tutor.id,
        learnerId: user?.id,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      navigate("/my-sessions");
    },
    onError: (error) => {
      toast.error("Failed to submit review. Please try again.");
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <SidebarNav />
        <main className="flex-1 max-w-4xl mx-auto py-8 px-4">
          <div className="text-center text-gray-500">Loading session details...</div>
        </main>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <SidebarNav />
        <main className="flex-1 max-w-4xl mx-auto py-8 px-4">
          <div className="text-center text-red-500">Session not found</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SidebarNav />
      <main className="flex-1 max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg border-indigo-100">
          <CardHeader>
            <CardTitle className="text-2xl text-indigo-700">Submit Review</CardTitle>
            <CardDescription>
              Rate your session with {session.tutor.fullName}
              {session.course ? ` for ${session.course.name}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review
                </label>
                <Textarea
                  placeholder="Share your experience with this tutor..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[150px]"
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/my-sessions")}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => submitReviewMutation.mutate()}
                  disabled={!rating || !comment || submitReviewMutation.isPending}
                >
                  Submit Review
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 