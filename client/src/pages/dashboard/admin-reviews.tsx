import React, { useEffect, useState } from "react";

interface Review {
  id: number;
  learner: string;
  tutor: string;
  comment: string;
  time: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/reviews")
      .then(res => res.json())
      .then(data => {
        setReviews(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">All Reviews</h1>
      {loading ? (
        <div>Loading reviews...</div>
      ) : (
        <div className="space-y-4">
          {reviews.length === 0 && <div>No reviews found.</div>}
          {reviews.map((review) => (
            <div key={review.id} className="border rounded p-4 bg-white shadow">
              <div className="mb-2">
                <span className="font-semibold">{review.learner}</span> reviewed <span className="font-semibold">{review.tutor}</span>
              </div>
              <div className="mb-1 text-gray-700">"{review.comment}"</div>
              <div className="text-xs text-gray-400">{new Date(review.time).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 