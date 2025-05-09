import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { MapPin, AlertCircle, Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6"
      >
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ 
            duration: 0.5,
            type: "spring",
            stiffness: 200
          }}
          className="flex justify-center mb-4"
        >
          <MapPin className="h-16 w-16 text-indigo-500" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-indigo-700 mb-4">Page Not Found</h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="w-full max-w-md border-indigo-200 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <AlertCircle className="h-5 w-5" />
              We've lost this page
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Sorry, the page you're looking for doesn't exist or has been moved.
            </p>
            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2 mt-4">
              <motion.div 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-1/2"
              >
                <Button 
                  variant="default" 
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setLocation("/")}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-1/2"
              >
                <Button 
                  variant="outline" 
                  className="w-full border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
              </motion.div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-indigo-100 flex items-center justify-center pt-4">
            <div className="text-sm text-gray-500 flex items-center">
              <Search className="h-4 w-4 mr-2" />
              Looking for tutoring? Try browsing our tutors page.
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8"
      >
        <Button 
          variant="link" 
          className="text-indigo-600"
          onClick={() => setLocation("/tutors")}
        >
          Browse Available Tutors
        </Button>
      </motion.div>
    </div>
  );
}
