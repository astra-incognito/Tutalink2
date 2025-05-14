import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import { StripeKeyManager } from "@/components/admin/stripe-key-manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function PaymentSettingsPage() {
  const { user, isLoading } = useAuth();

  // If still loading, return a loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If user is not an admin, redirect to home
  if (!user || user.role !== "admin") {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="pt-16 flex flex-1">
        <Sidebar />
        
        <div className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <main className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Settings</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Configure payment providers and settings
              </p>
            </div>

            <Tabs defaultValue="stripe" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="stripe">Stripe</TabsTrigger>
                <TabsTrigger value="general">General Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="stripe" className="space-y-6">
                {/* Stripe API Key Manager */}
                <StripeKeyManager />
                
                {/* Stripe Payment Methods */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>
                      Configure which payment methods are accepted through Stripe
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">Credit Cards</Label>
                          <p className="text-sm text-muted-foreground">
                            Accept Visa, Mastercard, and other credit cards
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">Mobile Money</Label>
                          <p className="text-sm text-muted-foreground">
                            Accept mobile money payments (MTN, Vodafone, etc.)
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">Bank Transfers</Label>
                          <p className="text-sm text-muted-foreground">
                            Accept direct bank transfers
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="general" className="space-y-6">
                {/* General Payment Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction Settings</CardTitle>
                    <CardDescription>
                      Configure general payment behavior
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">Automatic Payouts</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically transfer funds to tutors after session completion
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">Refund Policy</Label>
                          <p className="text-sm text-muted-foreground">
                            Allow refunds for cancelled sessions
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">Platform Fee</Label>
                          <p className="text-sm text-muted-foreground">
                            Collect platform fee from each transaction
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}