import * as React from "react";
import { useState } from "react";
import { Redirect } from "wouter";
import { AuthForms } from "@/components/auth/auth-forms";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { apiRequest } from "@/lib/queryClient";

export default function AuthPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Check if the user is logged in
  const checkLoginStatus = async () => {
    try {
      const response = await apiRequest("GET", "/api/user");
      if (response.ok) {
        setIsLoggedIn(true);
      }
    } catch (error) {
      // User is not logged in, do nothing
    }
  };
  
  // Call the login check when component mounts
  useState(() => {
    checkLoginStatus();
    // This is equivalent to useEffect with empty deps array
    // but we're using useState trick to avoid dependency issues
  });

  // Redirect if already logged in
  if (isLoggedIn) {
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
