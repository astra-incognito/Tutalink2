import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Star, MessageCircle, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Review {
  id: number;
  rating: number;
  comment: string;
  learner: { id: number; fullName: string; profilePicture?: string };
  bookingId: number;
  course?: { id: number; name: string };
  reply?: string;
}

export default function MyReviews() {
  const { user } = useAuth();
  const [reply, setReply] = useState<{ [reviewId: number]: string }>({});

  // Fetch reviews for this tutor
  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ["reviews", "tutor", user?.id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/reviews/tutor/${user?.id}`);
      return await res.json();
    },
    enabled: !!user?.id,
  });

  // Ratings summary
  const avgRating = reviews && reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2) : "0.00";
  const totalRatings = reviews ? reviews.length : 0;

  const replyMutation = useMutation({
    mutationFn: async ({ reviewId, reply }: { reviewId: number; reply: string }) => {
      // Backend must support this endpoint
      const res = await apiRequest("POST", `/api/reviews/${reviewId}/reply`, { reply });
      return await res.json();
    },
    onSuccess: () => {
      // Refetch reviews after reply
      // (Assumes backend returns updated review with reply)
      window.location.reload();
    },
  });

  // Ratings breakdown
  const ratingsBreakdown = [1, 2, 3, 4, 5].map(star => ({
    star,
    count: reviews ? reviews.filter(r => r.rating === star).length : 0,
  }));

  // Most reviewed courses
  const courseCounts: { [courseName: string]: number } = {};
  if (reviews) {
    reviews.forEach(r => {
      if (r.course && r.course.name) {
        courseCounts[r.course.name] = (courseCounts[r.course.name] || 0) + 1;
      }
    });
  }
  const mostReviewedCourses = Object.entries(courseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SidebarNav />
      <main className="flex-1 max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card className="mb-8 shadow-lg border-indigo-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700 text-2xl">
              <Star className="h-6 w-6 text-indigo-500" />
              My Reviews
            </CardTitle>
            <CardDescription>All reviews from students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-8 mb-6">
              <div>
                <div className="flex items-center gap-2 text-2xl font-bold text-indigo-700">
                  <Star className="h-6 w-6 text-yellow-400" />
                  {avgRating}
                </div>
                <div className="text-gray-600">{totalRatings} rating{totalRatings !== 1 ? "s" : ""}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700 mb-1">Ratings Breakdown</div>
                <div className="flex gap-2">
                  {ratingsBreakdown.reverse().map(rb => (
                    <div key={rb.star} className="flex flex-col items-center">
                      <span className="font-bold text-indigo-700">{rb.count}</span>
                      <Star className="h-4 w-4" />
                      <span className="text-xs text-gray-500">{rb.star}★</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-700 mb-1">Most Reviewed Courses</div>
                <ul className="text-sm text-gray-600">
                  {mostReviewedCourses.length > 0 ? mostReviewedCourses.map(([name, count]) => (
                    <li key={name}>{name} <span className="text-indigo-500 font-bold">({count})</span></li>
                  )) : <li className="italic text-gray-400">N/A</li>}
                </ul>
              </div>
            </div>
            {isLoading ? (
              <div className="text-center text-gray-500 py-8">Loading reviews...</div>
            ) : reviews && reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review: Review) => (
                  <Card key={review.id} className="border border-indigo-50 shadow">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold">
                          {review.learner.fullName.split(" ").map(n => n[0]).join("")}
                        </span>
                        <div>
                          <div className="font-semibold">{review.learner.fullName}</div>
                          <div className="text-xs text-gray-400">Session #{review.bookingId} {review.course ? `- ${review.course.name}` : ""}</div>
                        </div>
                      </div>
                      <div className="ml-auto flex items-center gap-1">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className={`h-4 w-4 ${i <= review.rating ? "text-yellow-400" : "text-gray-300"}`} />
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-2 text-gray-700">{review.comment}</div>
                      {review.reply && (
                        <div className="mb-2 ml-6 p-2 bg-indigo-50 rounded text-indigo-700 text-sm">
                          <span className="font-semibold">Your reply:</span> {review.reply}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <MessageCircle className="h-4 w-4 text-indigo-400" />
                        <Input
                          placeholder="Write a reply..."
                          value={reply[review.id] || ""}
                          onChange={e => setReply({ ...reply, [review.id]: e.target.value })}
                          className="w-2/3"
                        />
                        <Button size="sm" variant="default" onClick={() => replyMutation.mutate({ reviewId: review.id, reply: reply[review.id] })} disabled={!reply[review.id] || replyMutation.isPending}>
                          Reply
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">No reviews yet.</div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 