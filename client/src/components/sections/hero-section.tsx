import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className = "" }: HeroSectionProps) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Hide Sign Up button if mobile menu is open (workaround: only show on md+ screens)
  const [showSignUp, setShowSignUp] = useState(true);
  useEffect(() => {
    const handleResize = () => {
      setShowSignUp(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className={`relative bg-white overflow-hidden ${className}`}>
      {/* Fixed Sign Up button for mobile/desktop */}
      {showSignUp && (
        <Link href="/auth?tab=signup">
          <Button
            className="fixed top-4 right-4 z-50 bg-primary-500 text-white font-bold rounded-full px-6 py-2 shadow-lg hover:bg-primary-600 transition-colors duration-200 md:top-8 md:right-8"
            style={{ minWidth: 100 }}
          >
            Sign Up
          </Button>
        </Link>
      )}
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <svg
            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>

          <motion.div
            className="pt-10 px-4 sm:pt-12 sm:px-6 md:pt-16 lg:pt-20 lg:px-8 xl:pt-28"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="sm:text-center lg:text-left">
              <motion.h1
                className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
                variants={itemVariants}
              >
                <span className="block">Learn from the best</span>
                <span className="block text-primary-500">fellow students</span>
              </motion.h1>
              <motion.p
                className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0"
                variants={itemVariants}
              >
                Find and book in-person tutorial sessions with top-performing peers on your campus. 
                Get the help you need from students who've aced the courses you're taking.
              </motion.p>
              <motion.div
                className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start"
                variants={itemVariants}
              >
                <div className="rounded-md shadow">
                  <Link href="/auth?tab=signup">
                    <Button size="lg" className="w-full px-8 py-3 md:py-4 md:text-lg md:px-10">
                      Get started
                    </Button>
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link href="/tutors">
                    <Button 
                      variant="secondary" 
                      size="lg" 
                      className="w-full px-8 py-3 bg-primary-100 text-primary-600 hover:bg-primary-200 md:py-4 md:text-lg md:px-10"
                    >
                      Browse tutors
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&h=800"
          alt="Students studying together at a table"
        />
      </div>
    </section>
  );
}
