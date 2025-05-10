import { Metadata } from "next";
import { AdminDashboard } from "@/components/dashboard/admin/admin-dashboard";
import ReviewStatistics from "@/components/dashboard/admin/review-statistics";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for Tutalink",
};

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <AdminDashboard />
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Review Statistics</h2>
        <ReviewStatistics />
      </div>
    </div>
  );
} 