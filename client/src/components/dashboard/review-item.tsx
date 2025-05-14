import { Review } from "@/lib/types";
import { formatDistance } from "date-fns";
import { StarIcon } from "lucide-react";

type ReviewItemProps = {
  review: Review;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

export function ReviewItem({ review }: ReviewItemProps) {
  const { 
    id,
    tutorName,
    learnerName,
    courseName,
    rating,
    comment,
    createdAt,
    tutorResponse
  } = review;

  // Calculate time ago
  const timeAgo = formatDistance(new Date(createdAt), new Date(), { addSuffix: true });

  // Determine if this is a review for a tutor or from a learner
  const isForTutor = !!tutorName;
  const name = isForTutor ? tutorName : learnerName;
  const course = courseName || "Unknown Course";
  const displayName = `${name} - ${course}`;

  // Set background color based on rating
  const getBgColor = () => {
    if (rating >= 4) return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100";
    if (rating >= 3) return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100";
    return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100";
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-800 font-medium">{name ? getInitials(name) : "??"}</span>
          </div>
        </div>
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">{displayName}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{timeAgo}</p>
          </div>
          <div className="mt-1 flex">
            {[...Array(5)].map((_, i) => (
              <StarIcon 
                key={i} 
                className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-yellow-400"}`} 
              />
            ))}
          </div>
          <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
            {comment}
          </div>
          
          {tutorResponse && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Tutor Response:</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 italic">
                {tutorResponse}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
