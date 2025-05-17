// Admin Reports Page Stub
import * as React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";

export default function AdminReportsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="pt-16 flex flex-1">
        <Sidebar />
        <div className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <main className="py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold mb-4">Tutor Reports</h1>
            <p className="text-gray-600 dark:text-gray-400">This is the admin reports page. Here, you will see all reports submitted by learners about tutors.</p>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
