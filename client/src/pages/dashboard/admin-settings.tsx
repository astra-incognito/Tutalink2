import React from "react";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Settings, Palette, CreditCard, CalendarCheck2, Bell, Users } from "lucide-react";

const settingsSections = [
  {
    title: "Platform Branding",
    icon: <Palette className="h-5 w-5 text-indigo-500" />,
    description: "Update platform name, logo, and color scheme.",
  },
  {
    title: "Payment Settings",
    icon: <CreditCard className="h-5 w-5 text-indigo-500" />,
    description: "Configure currency, commission %, and payment providers.",
  },
  {
    title: "Booking Policy",
    icon: <CalendarCheck2 className="h-5 w-5 text-indigo-500" />,
    description: "Set cancellation rules, buffer time, and booking windows.",
  },
  {
    title: "Email & Notifications",
    icon: <Bell className="h-5 w-5 text-indigo-500" />,
    description: "Manage email templates and notification preferences.",
  },
  {
    title: "Admin Roles",
    icon: <Users className="h-5 w-5 text-indigo-500" />,
    description: "Add or remove other admin users and manage permissions.",
  },
];

export default function AdminSettings() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SidebarNav />
      <main className="flex-1 max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card className="mb-8 shadow-lg border-indigo-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700 text-2xl">
              <Settings className="h-6 w-6 text-indigo-500" />
              ⚙️ Settings
            </CardTitle>
            <CardDescription>
              Control platform-wide preferences
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsSections.map(section => (
            <Card key={section.title} className="shadow border border-indigo-50 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                {section.icon}
                <CardTitle className="text-lg text-indigo-700">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600 pb-4">
                <p className="mb-2">{section.description}</p>
                <div className="bg-indigo-50 rounded p-3 text-indigo-400 text-sm text-center">
                  Coming soon: {section.title} settings form
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
} 