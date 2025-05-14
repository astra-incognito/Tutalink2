import { useEffect, useState } from "react";
import { Redirect, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { AuthForms } from "@/components/auth/auth-forms";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Directly check if user is authenticated
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    onSuccess: () => setIsInitialized(true),
    onError: () => setIsInitialized(true)
  });

  // Show loading state during initialization
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-16">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Welcome to TutaLink
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Connect with top student tutors at KNUST
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <AuthForms />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
