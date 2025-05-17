import * as React from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import { SearchTutors, SearchParams } from "@/components/dashboard/search-tutors";
import { TutorCard } from "@/components/dashboard/tutor-card";
import { Tutor } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function TutorsPage() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    course: "",
    department: "",
    rating: "",
    searchQuery: "",
  });

  // Fetch tutors from the API
  const { data: tutors, isLoading } = useQuery<Tutor[]>({
    queryKey: [
      "/api/tutors", 
      searchParams.course, 
      searchParams.department, 
      searchParams.rating, 
      searchParams.searchQuery
    ],
    enabled: false, // Disabled for demo
  });

  // Mock courses and departments for search filters
  const mockCourses = [
    { value: "math241", label: "MATH 241 - Calculus I" },
    { value: "phys155", label: "PHYS 155 - Mechanics" },
    { value: "cosc387", label: "COSC 387 - Database Systems" },
    { value: "chem233", label: "CHEM 233 - Organic Chemistry" },
    { value: "econ101", label: "ECON 101 - Principles of Economics" }
  ];

  const mockDepartments = [
    { value: "computer-science", label: "Computer Science" },
    { value: "mathematics", label: "Mathematics" },
    { value: "physics", label: "Physics" },
    { value: "chemistry", label: "Chemistry" },
    { value: "economics", label: "Economics" }
  ];

  // Mock tutors data for demo
  const mockTutors: Tutor[] = [
    {
      id: 1,
      username: "johndoe",
      email: "john@example.com",
      fullName: "John Doe",
      role: "tutor",
      department: "Computer Science",
      yearOfStudy: 3,
      rating: 4.5,
      subjects: ["Programming", "Data Structures", "Algorithms"],
      price: 50,
      availability: [],
      reviews: []
    },
    {
      id: 2,
      username: "sarahamoah",
      email: "sarah@example.com",
      fullName: "Sarah Amoah",
      role: "tutor",
      department: "Mathematics",
      yearOfStudy: 4,
      rating: 5.0,
      subjects: ["Calculus", "Linear Algebra", "Statistics"],
      price: 45,
      availability: [],
      reviews: []
    },
    {
      id: 3,
      username: "kwameowusu",
      email: "kwame@example.com",
      fullName: "Kwame Owusu",
      role: "tutor",
      department: "Physics",
      yearOfStudy: 3,
      rating: 4.0,
      subjects: ["Mechanics", "Electricity", "Modern Physics"],
      price: 55,
      availability: [],
      reviews: []
    },
    {
      id: 4,
      username: "adjoadankwa",
      email: "adjoa@example.com",
      fullName: "Adjoa Dankwa",
      role: "tutor",
      department: "Chemistry",
      yearOfStudy: 4,
      rating: 4.8,
      subjects: ["Organic Chemistry", "Inorganic Chemistry", "Biochemistry"],
      price: 60,
      availability: [],
      reviews: []
    },
    {
      id: 5,
      username: "kofiboateng",
      email: "kofi@example.com",
      fullName: "Kofi Boateng",
      role: "tutor",
      department: "Economics",
      yearOfStudy: 3,
      rating: 4.2,
      subjects: ["Microeconomics", "Macroeconomics", "Econometrics"],
      price: 48,
      availability: [],
      reviews: []
    },
    {
      id: 6,
      username: "abenaappiah",
      email: "abena@example.com",
      fullName: "Abena Appiah",
      role: "tutor",
      department: "Mathematics",
      yearOfStudy: 4,
      rating: 4.7,
      subjects: ["Differential Equations", "Complex Analysis", "Numerical Methods"],
      price: 52,
      availability: [],
      reviews: []
    }
  ];

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
    toast({
      title: "Search Initiated",
      description: "Searching for tutors with your criteria...",
    });
    // In a real application, this would refetch the tutors with the new params
  };

  // Filter tutors based on search params for demo
  const filteredTutors = mockTutors.filter(tutor => {
    // Filter by department
    if (searchParams.department && tutor.department.toLowerCase() !== searchParams.department.toLowerCase()) {
      return false;
    }
    
    // Filter by rating
    if (searchParams.rating && tutor.rating < parseInt(searchParams.rating)) {
      return false;
    }
    
    // Filter by search query (name or subjects)
    if (searchParams.searchQuery) {
      const query = searchParams.searchQuery.toLowerCase();
      const nameMatch = tutor.fullName?.toLowerCase().includes(query) || tutor.username.toLowerCase().includes(query);
      const subjectMatch = tutor.subjects.some(subject => subject.toLowerCase().includes(query));
      if (!nameMatch && !subjectMatch) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="pt-16 flex flex-1">
        <Sidebar />
        
        <div className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <main className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Find Tutors</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Search for experienced tutors across various courses and departments
              </p>
            </div>

            {/* Search Section */}
            <div className="mb-8">
              <SearchTutors 
                onSearch={handleSearch}
                courses={mockCourses}
                departments={mockDepartments}
              />
            </div>

            {/* Results Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  {filteredTutors.length} Tutors Found
                </h2>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Sort by Rating
                  </Button>
                  <Button variant="outline" size="sm">
                    Sort by Price
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg h-64 animate-pulse">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12"></div>
                          <div className="ml-4 space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        </div>
                        <div className="mt-4 flex">
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mr-2"></div>
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {(filteredTutors.length > 0 ? filteredTutors : tutors || mockTutors).map((tutor) => (
                    <TutorCard key={tutor.id} tutor={tutor} />
                  ))}
                </div>
              )}

              {filteredTutors.length === 0 && (
                <div className="text-center py-10">
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tutors found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try adjusting your search criteria.
                  </p>
                  <div className="mt-6">
                    <Button
                      onClick={() => setSearchParams({
                        course: "",
                        department: "",
                        rating: "",
                        searchQuery: "",
                      })}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
