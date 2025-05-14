import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

type SearchTutorsProps = {
  onSearch: (searchParams: SearchParams) => void;
  courses: { value: string; label: string }[];
  departments: { value: string; label: string }[];
};

export type SearchParams = {
  course: string;
  department: string;
  rating: string;
  searchQuery: string;
};

export function SearchTutors({ onSearch, courses, departments }: SearchTutorsProps) {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    course: "",
    department: "",
    rating: "",
    searchQuery: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({
      ...searchParams,
      searchQuery: e.target.value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setSearchParams({
      ...searchParams,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Find a Tutor</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="course" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Course
              </label>
              <Select
                value={searchParams.course}
                onValueChange={(value) => handleSelectChange("course", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.value} value={course.value}>
                      {course.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Department
              </label>
              <Select
                value={searchParams.department}
                onValueChange={(value) => handleSelectChange("department", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Departments</SelectItem>
                  {departments.map((department) => (
                    <SelectItem key={department.value} value={department.value}>
                      {department.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Rating
              </label>
              <Select
                value={searchParams.rating}
                onValueChange={(value) => handleSelectChange("rating", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Rating</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                id="search"
                placeholder="Search by tutor name, course name, or keywords"
                className="pl-10"
                value={searchParams.searchQuery}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button type="submit">
              Search
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
