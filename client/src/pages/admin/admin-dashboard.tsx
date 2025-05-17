import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Users,
  Presentation,
  BookOpen,
  CreditCard,
  Flag,
  Bell,
} from "lucide-react";
import { Link } from "wouter";

// Demo data for the charts
const userStatsData = [
  { name: "Jan", learners: 25, tutors: 10 },
  { name: "Feb", learners: 35, tutors: 12 },
  { name: "Mar", learners: 45, tutors: 15 },
  { name: "Apr", learners: 60, tutors: 18 },
  { name: "May", learners: 75, tutors: 22 },
  { name: "Jun", learners: 90, tutors: 28 },
];

const sessionStatsData = [
  { name: "Jan", sessions: 15, revenue: 750 },
  { name: "Feb", sessions: 25, revenue: 1250 },
  { name: "Mar", sessions: 35, revenue: 1750 },
  { name: "Apr", sessions: 45, revenue: 2250 },
  { name: "May", sessions: 60, revenue: 3000 },
  { name: "Jun", sessions: 75, revenue: 3750 },
];

const tutorStatusData = [
  { name: "Approved", value: 28 },
  { name: "Pending", value: 12 },
  { name: "Rejected", value: 5 },
];

const COLORS = ["#4f46e5", "#eab308", "#ef4444"];

export default function AdminDashboard() {
  // Fetch dashboard data from API
  const { data: dashboardData } = useQuery<any>({
    queryKey: ["/api/admin/dashboard"],
    enabled: false, // Disabled for demo
  });

  // Mock dashboard data for demo
  const mockDashboardData = {
    totalUsers: 125,
    totalTutors: 28,
    totalSessions: 345,
    totalRevenue: 17250,
    pendingApplications: 12,
    userReports: 8,
    recentActivities: [
      { id: 1, type: "user_registration", user: "Kofi Mensah", timestamp: "2023-07-20T10:30:00Z" },
      { id: 2, type: "tutor_application", user: "Ama Serwaa", timestamp: "2023-07-19T15:45:00Z" },
      { id: 3, type: "user_report", user: "John Doe", reportedBy: "Jane Smith", timestamp: "2023-07-18T08:20:00Z" },
      { id: 4, type: "session_booking", learner: "Emma Wilson", tutor: "Sam Davis", timestamp: "2023-07-17T14:10:00Z" },
      { id: 5, type: "payment", user: "David Brown", amount: 45, timestamp: "2023-07-16T11:25:00Z" },
    ],
  };

  // Always use mock data if dashboardData is undefined or empty
  const data = dashboardData && Object.keys(dashboardData).length > 0 ? dashboardData : mockDashboardData;

  // Format timestamp to human-readable format
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  // Get activity description based on type
  const getActivityDescription = (activity: any) => {
    switch (activity.type) {
      case "user_registration":
        return `${activity.user} registered a new account`;
      case "tutor_application":
        return `${activity.user} applied to become a tutor`;
      case "user_report":
        return `${activity.user} was reported by ${activity.reportedBy}`;
      case "session_booking":
        return `${activity.learner} booked a session with ${activity.tutor}`;
      case "payment":
        return `${activity.user} made a payment of GHS ${activity.amount}`;
      default:
        return "Unknown activity";
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="pt-16 flex flex-1">
        <Sidebar />
        
        <div className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <main className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Platform overview and statistics
              </p>
            </div>

            {/* Quick Stats Section */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
              <StatsCard
                title="Total Users"
                value={data.totalUsers}
                icon={<Users />}
              />
              <StatsCard
                title="Total Tutors"
                value={data.totalTutors}
                icon={<Presentation />}
                iconBgColor="bg-purple-100 dark:bg-purple-700"
                iconColor="text-purple-600 dark:text-purple-100"
              />
              <StatsCard
                title="Total Sessions"
                value={data.totalSessions}
                icon={<BookOpen />}
                iconBgColor="bg-blue-100 dark:bg-blue-700"
                iconColor="text-blue-600 dark:text-blue-100"
              />
              <StatsCard
                title="Total Revenue"
                value={`GHS ${data.totalRevenue}`}
                icon={<CreditCard />}
                iconBgColor="bg-green-100 dark:bg-green-700"
                iconColor="text-green-600 dark:text-green-100"
              />
              <StatsCard
                title="Pending Applications"
                value={data.pendingApplications}
                icon={<Presentation />}
                iconBgColor="bg-yellow-100 dark:bg-yellow-700"
                iconColor="text-yellow-600 dark:text-yellow-100"
              />
              <StatsCard
                title="User Reports"
                value={data.userReports}
                icon={<Flag />}
                iconBgColor="bg-red-100 dark:bg-red-700"
                iconColor="text-red-600 dark:text-red-100"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* User Growth Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={userStatsData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="learners" name="Learners" fill="hsl(var(--chart-1))" />
                        <Bar dataKey="tutors" name="Tutors" fill="hsl(var(--chart-2))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Tutor Status Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Tutor Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={tutorStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={90}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {tutorStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sessions & Revenue Chart */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Sessions & Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sessionStatsData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--chart-1))" />
                      <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-3))" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="sessions" name="Sessions" fill="hsl(var(--chart-1))" />
                      <Bar yAxisId="right" dataKey="revenue" name="Revenue (GHS)" fill="hsl(var(--chart-3))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button asChild>
                      <Link href="/admin/users">Manage Users</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/admin/tutors">Manage Tutors</Link>
                    </Button>
                    <Button variant="outline">
                      <Bell className="mr-2 h-4 w-4" />
                      Send Notification
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/admin/payment-settings">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Payment Settings
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.recentActivities.map((activity: any) => (
                      <div key={activity.id} className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            {activity.type === "user_registration" && <Users className="h-4 w-4" />}
                            {activity.type === "tutor_application" && <Presentation className="h-4 w-4" />}
                            {activity.type === "user_report" && <Flag className="h-4 w-4" />}
                            {activity.type === "session_booking" && <BookOpen className="h-4 w-4" />}
                            {activity.type === "payment" && <CreditCard className="h-4 w-4" />}
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {getActivityDescription(activity)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimestamp(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
