import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { 
  Menu, X, User, LogOut, Bell, ChevronDown, 
  Search, Book, Home, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NavbarProps {
  transparent?: boolean;
  className?: string;
}

export function Navbar({ transparent = false, className = "" }: NavbarProps) {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logoutMutation.mutate();
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tutors?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Links to display in the navbar
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Tutors", href: "/tutors" },
    { name: "How It Works", href: "/#how-it-works" },
  ];

  // Animation variants for mobile menu
  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <nav
      className={cn(
        "w-full py-4 px-4 sm:px-6 lg:px-8 z-50",
        transparent ? "bg-transparent" : "bg-white shadow-sm",
        className
      )}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo and site name */}
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center">
                <span className={cn(
                  "text-2xl font-bold",
                  transparent ? "text-white" : "text-primary-500"
                )}>
                  TutaLink
                </span>
              </a>
            </Link>
          </div>

          {/* Desktop navigation links */}
          <div className="hidden md:flex md:space-x-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a className={cn(
                  "px-1 py-2 text-sm font-medium border-b-2 border-transparent",
                  transparent ? "text-white hover:border-white" : "text-gray-500 hover:border-gray-300 hover:text-gray-700",
                  location === link.href && !transparent && "border-primary-500 text-primary-600",
                  location === link.href && transparent && "border-white text-white"
                )}>
                  {link.name}
                </a>
              </Link>
            ))}
          </div>

          {/* Search bar */}
          <div className="hidden md:flex items-center">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="search"
                placeholder="Search tutors..."
                className="w-60 pl-10 py-1 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search 
                className={cn(
                  "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4",
                  transparent ? "text-gray-400" : "text-gray-500"
                )} 
              />
            </form>
          </div>

          {/* User menu or login/signup buttons */}
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Mobile-only logout button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-red-500 hover:bg-red-50 hover:text-red-700"
                  aria-label="Logout"
                  onClick={handleLogout}
                >
                  <LogOut size={22} />
                </Button>
                {/* Notifications dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "relative",
                        transparent ? "text-white hover:bg-white/20" : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      <Bell size={20} />
                      <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="p-4">
                      <p className="font-medium">Notifications</p>
                      <p className="text-sm text-gray-500">You have 3 unread notifications</p>
                    </div>
                    <DropdownMenuSeparator />
                    <div className="max-h-80 overflow-y-auto">
                      {/* Sample notifications */}
                      <div className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                        <p className="text-sm font-medium">New booking request</p>
                        <p className="text-xs text-gray-500">John requested a Calculus session</p>
                        <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                      </div>
                      <div className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                        <p className="text-sm font-medium">Session reminder</p>
                        <p className="text-xs text-gray-500">Your Physics session starts in 1 hour</p>
                        <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                      </div>
                    </div>
                    <div className="p-2">
                      <Button variant="outline" size="sm" className="w-full">
                        View all notifications
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "flex items-center space-x-2",
                        transparent ? "text-white hover:bg-white/20" : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profilePicture || ""} alt={user.fullName} />
                        <AvatarFallback>
                          {user.fullName.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline">{user.fullName}</span>
                      <ChevronDown size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      <Home className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/my-profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/bookings")}>
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>My Bookings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  className={cn(
                    "border-2 border-primary-500 text-primary-600 rounded-full px-6 py-2 font-semibold bg-white hover:bg-primary-50 active:bg-primary-100 transition-colors duration-150",
                    transparent ? "hover:bg-white/20" : "",
                    "md:rounded-lg md:px-4 md:py-2"
                  )}
                  onClick={() => navigate("/auth?tab=login")}
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate("/auth?tab=signup")}
                  className={cn(
                    transparent 
                      ? "bg-white text-primary-600 hover:bg-gray-100" 
                      : "bg-primary-500 text-white hover:bg-primary-600"
                  )}
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile menu button - move to left and make fixed */}
            <div className="fixed top-4 left-4 z-50 flex md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "!bg-primary-500 !text-white !rounded-full !shadow-lg !w-14 !h-14 hover:scale-105 active:scale-95 transition-transform duration-150 border-2 border-primary-600",
                  transparent ? "hover:bg-primary-600" : "hover:bg-primary-600"
                )}
                style={{ boxShadow: "0 4px 16px rgba(80, 72, 229, 0.15)" }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Open navigation menu"
              >
                {mobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden bg-white rounded-lg shadow-lg mt-2 overflow-hidden"
              initial="closed"
              animate="open"
              exit="closed"
              variants={mobileMenuVariants}
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {/* Mobile search */}
                <form onSubmit={handleSearch} className="relative mb-2">
                  <Input
                    type="search"
                    placeholder="Search tutors..."
                    className="w-full pl-10 py-2 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                </form>

                {/* Mobile links */}
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <a 
                      className={cn(
                        "block px-3 py-2 rounded-md text-base font-medium",
                        location === link.href 
                          ? "bg-primary-50 border-l-4 border-primary-500 text-primary-700"
                          : "text-gray-700 border-l-4 border-transparent hover:bg-gray-50 hover:border-gray-300"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </a>
                  </Link>
                ))}

                {/* User-specific mobile links */}
                {user ? (
                  <>
                    <div className="border-t border-gray-200 pt-2">
                      <Link href="/dashboard">
                        <a 
                          className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 border-l-4 border-transparent hover:bg-gray-50 hover:border-gray-300"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Dashboard
                        </a>
                      </Link>
                      <Link href="/my-profile">
                        <a 
                          className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 border-l-4 border-transparent hover:bg-gray-50 hover:border-gray-300"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          My Profile
                        </a>
                      </Link>
                      <Link href="/bookings">
                        <a 
                          className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 border-l-4 border-transparent hover:bg-gray-50 hover:border-gray-300"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          My Bookings
                        </a>
                      </Link>
                      <button 
                        className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 border-l-4 border-transparent hover:bg-red-50 hover:border-red-500"
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="border-t border-gray-200 pt-2 flex flex-col space-y-2 pb-2">
                    <Button
                      variant="outline"
                      className={cn(
                        "border-2 border-primary-500 text-primary-600 rounded-full px-6 py-2 font-semibold bg-white hover:bg-primary-50 active:bg-primary-100 transition-colors duration-150",
                        transparent ? "hover:bg-white/20" : "",
                        "md:rounded-lg md:px-4 md:py-2"
                      )}
                      onClick={() => navigate("/auth?tab=login")}
                    >
                      Login
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => {
                        navigate("/auth?tab=signup");
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
