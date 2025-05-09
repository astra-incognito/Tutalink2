import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { formatDistanceToNow } from "date-fns";

interface ReviewCardProps {
  reviewerName: string;
  reviewerImage?: string;
  reviewerRole?: string;
  rating: number;
  comment: string;
  date: Date;
  courseName?: string;
  className?: string;
}

export function ReviewCard({
  reviewerName,
  reviewerImage,
  reviewerRole,
  rating,
  comment,
  date,
  courseName,
  className = "",
}: ReviewCardProps) {
  // Get relative time (e.g., "2 days ago")
  const relativeTime = formatDistanceToNow(date, { addSuffix: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="h-full overflow-hidden">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <Avatar className="h-10 w-10">
                <AvatarImage src={reviewerImage} alt={reviewerName} />
                <AvatarFallback>
                  {reviewerName.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <h3 className="font-medium text-gray-900">{reviewerName}</h3>
                {reviewerRole && (
                  <p className="text-xs text-gray-500">{reviewerRole}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <StarRating rating={rating} size="sm" />
              <p className="text-xs text-gray-500 mt-1">{relativeTime}</p>
            </div>
          </div>

          {courseName && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {courseName}
              </span>
            </div>
          )}

          <div className="mt-4">
            <p className="text-sm text-gray-600">{comment}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
