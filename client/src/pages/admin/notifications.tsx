// Admin Notifications Page Stub
import * as React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function AdminNotificationsPage() {
  const [message, setMessage] = React.useState("");
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="pt-16 flex flex-1">
        <Sidebar />
        <div className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <main className="py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold mb-4">Send Notification</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Send a notification to all users on the platform.</p>
            <Textarea
              className="mb-4"
              placeholder="Type your notification message here..."
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <Button disabled={!message.trim()}>Send Notification</Button>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
