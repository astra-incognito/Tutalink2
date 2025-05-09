import { motion } from "framer-motion";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { Calendar } from "lucide-react";

interface Course {
  id: number;
  name: string;
  department: string;
  code: string;
  description?: string;
}

interface TutorCardProps {
  id: number;
  fullName: string;
  profilePicture?: string;
  bio?: string;
  courses: Course[];
  averageRating: number;
  reviewCount: number;
  isActive?: boolean;
  compact?: boolean;
}

export function TutorCard({
  id,
  fullName,
  profilePicture,
  bio,
  courses,
  averageRating,
  reviewCount,
  isActive = true,
  compact = false,
}: TutorCardProps) {
  // Calculate how many courses to show before "more" indicator
  const maxCoursesToShow = compact ? 2 : 3;
  const visibleCourses = courses.slice(0, maxCoursesToShow);
  const extraCoursesCount = courses.length - maxCoursesToShow;

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden">
        <CardContent className={compact ? "p-4" : "p-6"}>
          <div className="flex items-center">
            <Avatar className={compact ? "h-10 w-10" : "h-12 w-12"}>
              <AvatarImage src={profilePicture} alt={fullName} />
              <AvatarFallback>
                {fullName.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <h3 className={`font-medium text-gray-900 ${compact ? "text-base" : "text-lg"}`}>
                {fullName}
              </h3>
              <div className="flex items-center mt-1">
                <StarRating 
                  rating={averageRating} 
                  size={compact ? "sm" : "md"} 
                />
                <span className="ml-1 text-sm text-gray-500">
                  {averageRating.toFixed(1)} ({reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>
          
          {!compact && bio && (
            <p className="mt-3 text-sm text-gray-500 line-clamp-2">{bio}</p>
          )}
          
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {visibleCourses.map((course) => (
                <Badge
                  key={course.id}
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                  {course.name}
                </Badge>
              ))}
              {extraCoursesCount > 0 && (
                <Badge variant="outline">+{extraCoursesCount} more</Badge>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className={`mt-auto border-t ${compact ? "px-4 py-3" : "px-6 py-4"}`}>
          <div className="w-full flex items-center justify-between">
            <Link href={`/tutor/${id}`}>
              <Button
                variant="link"
                className="p-0 h-auto text-primary-600 hover:text-primary-700"
              >
                View profile
              </Button>
            </Link>
            <Link href={`/tutor/${id}`}>
              <Button
                size={compact ? "sm" : "default"}
                className="flex items-center"
              >
                <Calendar className="mr-1 h-4 w-4" />
                Book session
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
