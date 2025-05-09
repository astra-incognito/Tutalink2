import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { TutorCard } from "@/components/cards/tutor-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Filter, 
  X, 
  Loader2, 
  GraduationCap, 
  BookOpen 
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { localStorageKeys, getLocalStorageItem, setLocalStorageItem } from "@/lib/local-storage";

interface TutorData {
  id: number;
  fullName: string;
  profilePicture?: string;
  bio?: string;
  courses: {
    id: number;
    name: string;
    department: string;
    code: string;
    description?: string;
  }[];
  reviewCount: number;
  averageRating: number;
}

interface CourseData {
  id: number;
  name: string;
  department: string;
  code: string;
  description?: string;
}

export default function TutorsPage() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInputValue, setSearchInputValue] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Parse query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("query");
    if (query) {
      setSearchQuery(query);
      setSearchInputValue(query);
    }
  }, []);

  // Get all tutors
  const { data: tutors, isLoading: tutorsLoading } = useQuery<TutorData[]>({
    queryKey: ["tutors", searchQuery, minRating, selectedDepartments, selectedCourses],
    queryFn: async () => {
      // Try to get from localStorage first if no filters are applied
      if (!searchQuery && minRating === 0 && selectedDepartments.length === 0 && selectedCourses.length === 0) {
        const storedTutors = getLocalStorageItem<TutorData[]>(localStorageKeys.TUTORS);
        if (storedTutors) {
          return storedTutors;
        }
      }
      
      // Build query parameters
      const params = new URLSearchParams();
      if (searchQuery) params.append("query", searchQuery);
      if (minRating > 0) params.append("minRating", minRating.toString());
      
      // Add departments and courses as comma-separated values
      if (selectedDepartments.length > 0) {
        params.append("departments", selectedDepartments.join(","));
      }
      if (selectedCourses.length > 0) {
        params.append("courses", selectedCourses.join(","));
      }
      
      try {
        const url = params.toString() 
          ? `/api/tutors/search?${params.toString()}` 
          : "/api/tutors";
        
        const res = await apiRequest("GET", url);
        const data = await res.json();
        
        // Store in localStorage if this is the base set of tutors
        if (!searchQuery && minRating === 0 && selectedDepartments.length === 0 && selectedCourses.length === 0) {
          setLocalStorageItem(localStorageKeys.TUTORS, data);
        }
        
        return data;
      } catch (error) {
        console.error("Failed to fetch tutors", error);
        return [];
      }
    },
  });

  // Get all courses
  const { data: courses } = useQuery<CourseData[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      const storedCourses = getLocalStorageItem<CourseData[]>(localStorageKeys.COURSES);
      if (storedCourses) {
        return storedCourses;
      }
      
      try {
        const res = await apiRequest("GET", "/api/courses");
        const data = await res.json();
        setLocalStorageItem(localStorageKeys.COURSES, data);
        return data;
      } catch (error) {
        console.error("Failed to fetch courses", error);
        return [];
      }
    },
  });

  // Get all departments (derived from courses)
  const departments = courses 
    ? [...new Set(courses.map(course => course.department))].sort()
    : [];

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInputValue);
    updateQueryParams();
  };

  // Handle rating filter change
  const handleRatingChange = (values: number[]) => {
    setMinRating(values[0]);
  };

  // Handle department filter change
  const handleDepartmentChange = (department: string) => {
    setSelectedDepartments(prev => 
      prev.includes(department)
        ? prev.filter(d => d !== department)
        : [...prev, department]
    );
  };

  // Handle course filter change
  const handleCourseChange = (courseId: number) => {
    setSelectedCourses(prev => 
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  // Update URL query parameters
  const updateQueryParams = () => {
    const params = new URLSearchParams();
    if (searchInputValue) params.append("query", searchInputValue);
    if (minRating > 0) params.append("minRating", minRating.toString());
    if (selectedDepartments.length > 0) {
      params.append("departments", selectedDepartments.join(","));
    }
    if (selectedCourses.length > 0) {
      params.append("courses", selectedCourses.join(","));
    }
    
    const queryString = params.toString();
    setLocation(queryString ? `/tutors?${queryString}` : "/tutors", { replace: true });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSearchInputValue("");
    setMinRating(0);
    setSelectedDepartments([]);
    setSelectedCourses([]);
    setLocation("/tutors", { replace: true });
  };

  // Apply filters
  const applyFilters = () => {
    setSearchQuery(searchInputValue);
    updateQueryParams();
    if (window.innerWidth < 768) {
      setIsFiltersOpen(false);
    }
  };

  // Check if any filters are applied
  const hasFilters = searchQuery !== "" || minRating > 0 || selectedDepartments.length > 0 || selectedCourses.length > 0;

  // Get courses for selected departments
  const departmentCourses = courses?.filter(course => 
    selectedDepartments.length === 0 || selectedDepartments.includes(course.department)
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-6"
          >
            <motion.h1 
              variants={itemVariants}
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              Find Tutors
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="text-gray-600 max-w-3xl"
            >
              Connect with top-performing student tutors for in-person tutorial sessions on your campus. 
              Filter by course, department, or rating to find the perfect match for your academic needs.
            </motion.p>
          </motion.div>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Mobile filters button */}
            <div className="md:hidden mb-4">
              <Button 
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                variant="outline"
                className="w-full flex justify-between"
              >
                <span className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </span>
                {hasFilters && (
                  <Badge>{selectedDepartments.length + selectedCourses.length + (minRating > 0 ? 1 : 0) + (searchQuery ? 1 : 0)}</Badge>
                )}
              </Button>
            </div>
            
            {/* Filters sidebar */}
            <motion.aside 
              className={`md:w-64 flex-shrink-0 ${isFiltersOpen ? 'block' : 'hidden md:block'}`}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Filters</CardTitle>
                    {hasFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-8 text-xs"
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Rating filter */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Minimum Rating ({minRating}/5)
                    </Label>
                    <Slider
                      defaultValue={[minRating]}
                      max={5}
                      step={0.5}
                      value={[minRating]}
                      onValueChange={handleRatingChange}
                      className="py-4"
                    />
                  </div>
                  
                  {/* Department filter */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Departments</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 pb-2">
                      {departments.map(department => (
                        <div key={department} className="flex items-center space-x-2">
                          <Checkbox
                            id={`department-${department}`}
                            checked={selectedDepartments.includes(department)}
                            onCheckedChange={() => handleDepartmentChange(department)}
                          />
                          <label
                            htmlFor={`department-${department}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {department}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Course filter (show only if departments are selected) */}
                  {selectedDepartments.length > 0 && departmentCourses && departmentCourses.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Courses</Label>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-2 pb-2">
                        {departmentCourses.map(course => (
                          <div key={course.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`course-${course.id}`}
                              checked={selectedCourses.includes(course.id)}
                              onCheckedChange={() => handleCourseChange(course.id)}
                            />
                            <label
                              htmlFor={`course-${course.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {course.name} ({course.code})
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Apply filters button (mobile only) */}
                  <div className="md:hidden pt-2">
                    <Button onClick={applyFilters} className="w-full">
                      Apply Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.aside>
            
            {/* Main content */}
            <div className="flex-1">
              {/* Search bar */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="search"
                        placeholder="Search by name, course, or topic..."
                        className="pl-10"
                        value={searchInputValue}
                        onChange={(e) => setSearchInputValue(e.target.value)}
                      />
                      {searchInputValue && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchInputValue("");
                            if (searchQuery) {
                              setSearchQuery("");
                              updateQueryParams();
                            }
                          }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <Button type="submit">Search</Button>
                  </form>
                </CardContent>
              </Card>
              
              {/* Applied filters */}
              {hasFilters && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {searchQuery && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Search className="h-3 w-3" />
                      {searchQuery}
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSearchInputValue("");
                          updateQueryParams();
                        }}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  
                  {minRating > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Rating: {minRating}+
                      <button
                        onClick={() => {
                          setMinRating(0);
                          updateQueryParams();
                        }}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  
                  {selectedDepartments.map(dept => (
                    <Badge key={dept} variant="secondary" className="flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />
                      {dept}
                      <button
                        onClick={() => {
                          handleDepartmentChange(dept);
                          updateQueryParams();
                        }}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  
                  {selectedCourses.map(courseId => {
                    const course = courses?.find(c => c.id === courseId);
                    return course ? (
                      <Badge key={courseId} variant="secondary" className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {course.code}
                        <button
                          onClick={() => {
                            handleCourseChange(courseId);
                            updateQueryParams();
                          }}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-7 text-xs"
                  >
                    Clear all
                  </Button>
                </div>
              )}
              
              {/* Tutors grid */}
              {tutorsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : tutors && tutors.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {tutors.map((tutor) => (
                    <motion.div key={tutor.id} variants={itemVariants}>
                      <TutorCard
                        id={tutor.id}
                        fullName={tutor.fullName}
                        profilePicture={tutor.profilePicture}
                        bio={tutor.bio}
                        courses={tutor.courses}
                        averageRating={tutor.averageRating}
                        reviewCount={tutor.reviewCount}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No tutors found</h3>
                  <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                    We couldn't find any tutors matching your search criteria. Try adjusting your filters or search terms.
                  </p>
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="mt-4"
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
