import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Home,
  Users,
  Calendar,
  Star,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Book,
  Grid3X3,
  UserCheck,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  isActive: boolean;
  collapsed: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, to, isActive, collapsed, onClick }: NavItemProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Link href={to}>
            <motion.div whileHover={{ x: 2 }}>
              <Button
                variant={isActive ? "default" : "ghost"}
                size={collapsed ? "icon" : "default"}
                className={cn(
                  "justify-start w-full relative h-11 overflow-hidden",
                  isActive 
                    ? "bg-white/10 text-white shadow-md border-l-4 border-indigo-300 pl-3" 
                    : "hover:bg-white/5 text-indigo-100",
                  collapsed ? "px-2 rounded-xl" : "px-4 rounded-xl"
                )}
                onClick={onClick}
              >
                {isActive && (
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500/40 to-indigo-500/0 rounded-l-xl"
                    layoutId="activeNavHighlight"
                    transition={{ type: "spring", duration: 0.4 }}
                  />
                )}
                <span className={cn("mr-2 relative z-10", isActive ? "text-white" : "text-indigo-200")}>{icon}</span>
                {!collapsed && (
                  <span className="font-medium text-sm whitespace-nowrap relative z-10">
                    {label}
                  </span>
                )}
              </Button>
            </motion.div>
          </Link>
        </TooltipTrigger>
        {collapsed && <TooltipContent side="right">{label}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
}

interface SidebarNavProps {
  className?: string;
}

export function SidebarNav({ className }: SidebarNavProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isMobile = useIsMobile();

  // Set sidebar to collapsed on mobile by default
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  if (!user) return null;

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsSheetOpen(false);
  };

  const handleNavigation = () => {
    if (isMobile) {
      setIsSheetOpen(false);
    }
  };
  
  // For mobile, the sidebar should never be collapsed
  const effectiveCollapsed = isMobile ? false : collapsed;

  const isLearner = user.role === "learner";
  const isTutor = user.role === "tutor";
  const isAdmin = user.role === "admin";

  // Sidebar animation variants
  const sidebarVariants = {
    expanded: { width: "240px" },
    collapsed: { width: "72px" },
  };

  // Common routes for all users
  const commonRoutes = [
    { icon: <Home size={20} />, label: "Dashboard", to: "/dashboard" },
    { icon: <User size={20} />, label: "My Profile", to: "/my-profile" },
  ];

  // Role-specific routes
  const learnerRoutes = [
    { icon: <Users size={20} />, label: "Find Tutors", to: "/tutors" },
    { icon: <Calendar size={20} />, label: "My Bookings", to: "/bookings" },
    { icon: <Star size={20} />, label: "My Reviews", to: "/reviews" },
  ];

  const tutorRoutes = [
    { icon: <Calendar size={20} />, label: "My Sessions", to: "/bookings" },
    { icon: <Star size={20} />, label: "My Reviews", to: "/reviews" },
    { icon: <Book size={20} />, label: "My Courses", to: "/courses" },
  ];

  const adminRoutes = [
    { icon: <UserCheck size={20} />, label: "Manage Users", to: "/admin/users" },
    { icon: <Grid3X3 size={20} />, label: "Manage Courses", to: "/admin/courses" },
    { icon: <Calendar size={20} />, label: "All Bookings", to: "/admin/bookings" },
    { icon: <Settings size={20} />, label: "Settings", to: "/admin/settings" },
  ];

  // Determine which routes to show based on user role
  const roleSpecificRoutes = isAdmin
    ? adminRoutes
    : isLearner
    ? learnerRoutes
    : isTutor
    ? tutorRoutes
    : [];

  const routes = [...commonRoutes, ...roleSpecificRoutes];

  // Render sidebar content (used both in desktop and mobile)
  const SidebarContent = (
    <motion.div
      className={cn(
        "h-screen bg-gradient-to-b from-indigo-900 to-indigo-800 text-white flex flex-col p-3",
        collapsed ? "items-center" : "",
        isMobile ? "w-[280px]" : ""
      )}
      variants={isMobile ? undefined : sidebarVariants}
      initial={isMobile ? undefined : "expanded"}
      animate={isMobile ? undefined : (collapsed ? "collapsed" : "expanded")}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
  
      <div className="flex items-center justify-between mb-8 mt-4 px-2">
        {!collapsed ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white text-indigo-600 mr-2 shadow-md">
              <Book size={22} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                TutaLink
              </h1>
              <p className="text-[0.65rem] text-blue-200 font-light -mt-1">Student-to-Student Tutoring</p>
            </div>
          </motion.div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-white text-indigo-600 flex items-center justify-center shadow-md my-2">
            <Book size={22} strokeWidth={2.5} />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:bg-white/10 hover:text-white absolute -right-4 top-6 rounded-full border border-indigo-700 bg-indigo-800 w-8 h-8 shadow-md"
        >
          {collapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </Button>
      </div>

      <div className="flex flex-col space-y-1">
        {routes.map((route) => (
          <NavItem
            key={route.to}
            icon={route.icon}
            label={route.label}
            to={route.to}
            isActive={location === route.to}
            collapsed={effectiveCollapsed}
            onClick={handleNavigation}
          />
        ))}
      </div>

      {/* Mobile: Show logout button right after nav links */}
      {isMobile && (
        <div className="mt-4 mb-2">
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button
                    variant="ghost"
                    size={effectiveCollapsed ? "icon" : "default"}
                    className={cn(
                      "justify-start w-full text-white hover:bg-red-500/10 hover:text-red-200 rounded-xl",
                      effectiveCollapsed ? "px-2" : "px-4"
                    )}
                    onClick={handleLogout}
                  >
                    <span className="mr-2 text-red-300">
                      <LogOut size={18} />
                    </span>
                    {!effectiveCollapsed && <span className="text-sm font-medium">Logout</span>}
                  </Button>
                </motion.div>
              </TooltipTrigger>
              {effectiveCollapsed && <TooltipContent side="right">Logout</TooltipContent>}
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* User profile and logout (desktop) */}
      {!isMobile && (
        <div className="mt-auto mb-4">
          <div className="mt-2 border-t border-indigo-700/50 pt-4 pb-2 mb-2">
            <Link href="/my-profile">
              <div className={cn(
                "flex items-center p-2 rounded-xl hover:bg-white/5 transition-colors", 
                effectiveCollapsed ? "justify-center" : "px-2"
              )}>
                <Avatar className={cn(
                  "border-2 border-indigo-400/40",
                  effectiveCollapsed ? "h-10 w-10" : "h-9 w-9"
                )}>
                  <AvatarImage src={user.profilePicture || ""} alt={user.fullName} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-indigo-600 text-white">
                    {user.fullName.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                {!effectiveCollapsed && (
                  <div className="ml-2 overflow-hidden">
                    <p className="text-sm font-medium truncate text-white">{user.fullName}</p>
                    <div className="flex items-center">
                      <div className={cn(
                        "w-2 h-2 rounded-full mr-1.5",
                        user.role === "admin" ? "bg-indigo-400" : user.role === "tutor" ? "bg-purple-400" : "bg-blue-400"
                      )}></div>
                      <p className="text-xs text-indigo-200 capitalize">{user.role}</p>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          </div>
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button
                    variant="ghost"
                    size={effectiveCollapsed ? "icon" : "default"}
                    className={cn(
                      "justify-start w-full text-white hover:bg-red-500/10 hover:text-red-200 rounded-xl",
                      effectiveCollapsed ? "px-2" : "px-4"
                    )}
                    onClick={handleLogout}
                  >
                    <span className="mr-2 text-red-300">
                      <LogOut size={18} />
                    </span>
                    {!effectiveCollapsed && <span className="text-sm font-medium">Logout</span>}
                  </Button>
                </motion.div>
              </TooltipTrigger>
              {effectiveCollapsed && <TooltipContent side="right">Logout</TooltipContent>}
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </motion.div>
  );
  
  // Return different UI for mobile vs desktop
  if (isMobile) {
    return (
      <>
        {/* Mobile Hamburger Menu */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
              aria-label="Open Menu"
            >
              <Menu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 border-r-indigo-200 w-auto max-w-[300px]" aria-label="Navigation menu">
            <div className="sr-only">Navigation Menu</div>
            {SidebarContent}
          </SheetContent>
        </Sheet>
      </>
    );
  }
  
  // Desktop sidebar
  return (
    <div className="border-r border-gray-200 shadow-xl relative z-50">
      {SidebarContent}
    </div>
  );
}
