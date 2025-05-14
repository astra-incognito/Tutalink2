import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tutor } from "@/lib/types";
import { StarIcon, StarHalfIcon } from "lucide-react";
import { User, Eye, CalendarPlus } from "lucide-react";
import { Link } from "wouter";

type TutorCardProps = {
  tutor: Tutor;
};

function TutorRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return (
    <div className="flex items-center">
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <StarIcon key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-current" />
        ))}
        {hasHalfStar && <StarHalfIcon className="w-4 h-4 text-yellow-400 fill-current" />}
        {[...Array(emptyStars)].map((_, i) => (
          <StarIcon key={`empty-${i}`} className="w-4 h-4 text-yellow-400" />
        ))}
      </div>
      <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">({rating.toFixed(1)})</span>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

export function TutorCard({ tutor }: TutorCardProps) {
  const { id, fullName, username, department, yearOfStudy, subjects, price, rating } = tutor;
  
  return (
    <Card className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-800 font-medium text-lg">
              {fullName ? getInitials(fullName) : username.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{fullName || username}</h3>
            <TutorRating rating={rating} />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            <i className="fas fa-graduation-cap mr-1"></i> {department}, {yearOfStudy && `${yearOfStudy}${yearOfStudy === 1 ? 'st' : yearOfStudy === 2 ? 'nd' : yearOfStudy === 3 ? 'rd' : 'th'} Year`}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            <i className="fas fa-book mr-1"></i> {subjects.join(', ')}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <i className="fas fa-money-bill-wave mr-1"></i> GHS {price} per hour
          </div>
        </div>
        <div className="mt-4 flex">
          <Button variant="outline" size="sm" className="mr-2">
            <Eye className="mr-2 h-4 w-4" />
            View Profile
          </Button>
          <Button size="sm">
            <CalendarPlus className="mr-2 h-4 w-4" />
            Book Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
