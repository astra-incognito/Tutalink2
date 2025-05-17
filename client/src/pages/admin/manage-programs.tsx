// Admin Manage Programs/Departments/Colleges Page Stub
import * as React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

export default function ManageProgramsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="pt-16 flex flex-1">
        <Sidebar />
        <div className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <main className="py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold mb-4">Manage Programs, Departments & Colleges</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Add, edit, or remove programs, departments, and colleges for KNUST.</p>
            <Button>Add New Program/Department/College</Button>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
