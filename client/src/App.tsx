import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "./lib/protected-route";
import { useAuth, AuthProvider } from "./hooks/use-auth";
import { motion } from "framer-motion";

// Pages
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import LearnerDashboard from "@/pages/dashboard/learner-dashboard";
import TutorDashboard from "@/pages/dashboard/tutor-dashboard";
import AdminDashboard from "@/pages/dashboard/admin-dashboard";
import NotFound from "@/pages/not-found";
import TutorsPage from "@/pages/tutors-page";
import TutorProfilePage from "@/pages/tutor-profile-page";
import MyProfilePage from "@/pages/my-profile-page";
import BookingsPage from "./pages/bookings-page";
import ReviewPage from "./pages/review-page";
import ManageUsersPage from "@/pages/dashboard/manage-users";

// Animation variants for page transitions
const pageVariants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
  out: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
};

// AnimatedRoute component to wrap routes with framer-motion animations
function AnimatedRoute({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="min-h-screen w-full"
    >
      {children}
    </motion.div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/">
        <AnimatedRoute>
          <HomePage />
        </AnimatedRoute>
      </Route>
      
      <Route path="/auth">
        <AnimatedRoute>
          <AuthPage />
        </AnimatedRoute>
      </Route>
      
      <Route path="/tutors">
        <AnimatedRoute>
          <TutorsPage />
        </AnimatedRoute>
      </Route>
      
      <Route path="/tutor/:id">
        {(params: { id: string }) => (
          <AnimatedRoute>
            <TutorProfilePage id={parseInt(params.id)} />
          </AnimatedRoute>
        )}
      </Route>
      
      <ProtectedRoute path="/dashboard">
        <AnimatedRoute>
          {user?.role === "learner" && <LearnerDashboard />}
          {user?.role === "tutor" && <TutorDashboard />}
          {user?.role === "admin" && <AdminDashboard />}
        </AnimatedRoute>
      </ProtectedRoute>
      
      <ProtectedRoute path="/my-profile">
        <AnimatedRoute>
          <MyProfilePage />
        </AnimatedRoute>
      </ProtectedRoute>
      
      <ProtectedRoute path="/bookings">
        <AnimatedRoute>
          <BookingsPage />
        </AnimatedRoute>
      </ProtectedRoute>
      
      <ProtectedRoute path="/review/:bookingId">
        {(params: { bookingId: string }) => (
          <AnimatedRoute>
            <ReviewPage bookingId={parseInt(params.bookingId)} />
          </AnimatedRoute>
        )}
      </ProtectedRoute>
      
      <ProtectedRoute path="/admin">
        <AnimatedRoute>
          {user?.role === "admin" ? <AdminDashboard /> : <NotFound />}
        </AnimatedRoute>
      </ProtectedRoute>
      
      <ProtectedRoute path="/admin/users">
        <AnimatedRoute>
          <ManageUsersPage />
        </AnimatedRoute>
      </ProtectedRoute>
      
      <Route>
        <AnimatedRoute>
          <NotFound />
        </AnimatedRoute>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </TooltipProvider>
  );
}

export default App;
