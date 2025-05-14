import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginData, RegisterData, loginSchema, registrationSchema } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, KeyRound } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Admin login form schema
const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export function AuthForms() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Login form setup
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Registration form setup
  const registerForm = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
    },
  });

  // Create login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create register mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: `Welcome to TutaLink, ${user.username}!`,
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutate(values);
  }

  function onRegisterSubmit(values: z.infer<typeof registrationSchema>) {
    registerMutation.mutate(values);
  }

  // Admin login setup
  const adminLoginForm = useForm<z.infer<typeof adminLoginSchema>>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Admin login mutation
  const adminLoginMutation = useMutation({
    mutationFn: async (credentials: z.infer<typeof adminLoginSchema>) => {
      // Use our special direct admin login endpoint
      const res = await apiRequest("POST", "/api/_direct_auth/_admin_login_", credentials);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Admin login successful",
        description: `Welcome back, ${user.username}!`,
      });
      setLocation("/admin/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Admin login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Admin login submission handler
  function onAdminLoginSubmit(values: z.infer<typeof adminLoginSchema>) {
    adminLoginMutation.mutate(values);
  }

  // Toggle admin login
  const toggleAdminLogin = () => {
    setShowAdminLogin(!showAdminLogin);
  };

  return (
    <div className="w-full">
      {showAdminLogin ? (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium flex items-center justify-center">
              <KeyRound className="mr-2 h-5 w-5" />
              Admin Login
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Login with your administrative credentials
            </p>
          </div>
          
          <Form {...adminLoginForm}>
            <form onSubmit={adminLoginForm.handleSubmit(onAdminLoginSubmit)} className="space-y-6">
              <FormField
                control={adminLoginForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter admin username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={adminLoginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter admin password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={adminLoginMutation.isPending}
              >
                {adminLoginMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Admin Sign in
              </Button>
              
              <Button 
                variant="link" 
                className="w-full text-gray-500"
                onClick={toggleAdminLogin}
              >
                Back to regular login
              </Button>
            </form>
          </Form>
        </div>
      ) : (
        <Tabs defaultValue="login" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-primary dark:text-primary-400 hover:text-primary-600">
                      Forgot your password?
                    </a>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Sign in
                </Button>
                
                <div className="text-center text-sm mt-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Don't have an account?{" "}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-primary dark:text-primary-400"
                      onClick={() => setActiveTab("register")}
                    >
                      Sign up
                    </Button>
                  </p>
                </div>
                
                <div className="text-center text-sm mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="link"
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={() => setShowAdminLogin(true)}
                  >
                    <KeyRound className="mr-1 h-3 w-3" />
                    Admin Login
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="register">
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                <FormField
                  control={registerForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Choose a username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Create a password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Create Account
                </Button>
                
                <div className="text-center text-sm mt-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Already have an account?{" "}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-primary dark:text-primary-400"
                      onClick={() => setActiveTab("login")}
                    >
                      Sign in
                    </Button>
                  </p>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
