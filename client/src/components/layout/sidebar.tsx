import * as React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Home,
  Search,
  Calendar,
  Star,
  CreditCard,
  Presentation,
  UserCog,
  HelpCircle,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarLinkProps = {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

function SidebarLink({ href, icon, children, className }: SidebarLinkProps) {
  const [location] = useLocation();
  const isActive = location === href;

  return (
    <Link href={href}>
      <a
        className={cn(
          "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
          isActive 
            ? "bg-primary-50 dark:bg-gray-900 text-primary dark:text-white" 
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white",
          className
        )}
      >
        {React.cloneElement(icon as React.ReactElement, {
          className: cn(
            "mr-3 flex-shrink-0 h-5 w-5",
            isActive 
              ? "text-primary dark:text-gray-400" 
              : "text-gray-400 dark:text-gray-400"
          ),
        })}
        {children}
      </a>
    </Link>
  );
}

export function Sidebar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  return (
    <div className="hidden md:flex md:w-64 md:flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="h-0 flex-1 flex flex-col overflow-y-auto">
        <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            User: {user.fullName || user.username}
          </div>
          <div className="text-sm font-medium text-primary dark:text-primary-400">
            {user.role === "learner" ? "Student (Learner)" : 
             user.role === "tutor" ? "Student (Tutor)" : "Admin"}
          </div>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          <SidebarLink href="/dashboard" icon={<Home />}>
            Dashboard
          </SidebarLink>
          <SidebarLink href="/tutors" icon={<Search />}>
            Find Tutors
          </SidebarLink>
          <SidebarLink href="/sessions" icon={<Calendar />}>
            My Sessions
          </SidebarLink>
          <SidebarLink href="/reviews" icon={<Star />}>
            My Reviews
          </SidebarLink>
          <SidebarLink href="/payments" icon={<CreditCard />}>
            Payments
          </SidebarLink>
          {user.role !== "tutor" && (
            <SidebarLink href="/become-tutor" icon={<Presentation />}>
              Become a Tutor
            </SidebarLink>
          )}
          <SidebarLink href="/profile" icon={<UserCog />}>
            Profile Settings
          </SidebarLink>
          <SidebarLink href="/support" icon={<HelpCircle />}>
            Support
          </SidebarLink>
          
          {user.role === "admin" && location.startsWith("/admin") && (
            <div className="pt-2 mt-2">
              <div className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Admin
              </div>
              <div className="mt-2 space-y-1">
                <SidebarLink href="/admin" icon={<Home />}>
                  Dashboard
                </SidebarLink>
                <SidebarLink href="/admin/users" icon={<Search />}>
                  Manage Users
                </SidebarLink>
                <SidebarLink href="/admin/tutors" icon={<Presentation />}>
                  Manage Tutors
                </SidebarLink>
              </div>
            </div>
          )}
          
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => logoutMutation.mutate()}
              className="group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700"
            >
              <LogOut className="mr-3 flex-shrink-0 h-5 w-5" />
              Logout
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
