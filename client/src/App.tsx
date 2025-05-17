import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import DashboardPage from "@/pages/dashboard-page";
import TutorsPage from "@/pages/tutors-page";
import SessionsPage from "@/pages/sessions-page";
import BecomeTutorPage from "@/pages/become-tutor-page";
import ProfilePage from "@/pages/profile-page";
import AdminDashboard from "@/pages/admin/admin-dashboard";
import ManageUsers from "@/pages/admin/manage-users";
import ManageTutors from "@/pages/admin/manage-tutors";
import PaymentSettingsPage from "@/pages/admin/payment-settings";
import SupportPage from "@/pages/support-page";
import PaymentsPage from "@/pages/payments-page";
import ReviewsPage from "@/pages/reviews-page";
import { ProtectedRoute } from "./lib/protected-route";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "./hooks/use-auth";

// AuthenticatedApp component with routes that require authentication
function AuthenticatedApp() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/tutors" component={TutorsPage} />
      <ProtectedRoute path="/sessions" component={SessionsPage} />
      <ProtectedRoute path="/become-tutor" component={BecomeTutorPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/admin" component={AdminDashboard} roles={["admin"]} />
      <ProtectedRoute path="/admin/users" component={ManageUsers} roles={["admin"]} />
      <ProtectedRoute path="/admin/tutors" component={ManageTutors} roles={["admin"]} />
      <ProtectedRoute path="/admin/payment-settings" component={PaymentSettingsPage} roles={["admin"]} />
      <ProtectedRoute path="/payments" component={PaymentsPage} />
      <ProtectedRoute path="/reviews" component={ReviewsPage} />
      <ProtectedRoute path="/support" component={SupportPage} />
      <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} roles={["admin"]} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </TooltipProvider>
  );
}

export default App;
