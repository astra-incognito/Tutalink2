import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface CTASectionProps {
  className?: string;
}

export function CTASection({ className = "" }: CTASectionProps) {
  return (
    <section className={`bg-primary-500 ${className}`}>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to boost your grades?</span>
            <span className="block text-primary-200">Join TutaLink today.</span>
          </h2>
        </motion.div>
        <motion.div
          className="mt-8 flex lg:mt-0 lg:flex-shrink-0 space-x-4"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="inline-flex rounded-md shadow">
            <Link href="/auth?tab=signup">
              <Button 
                size="lg"
                variant="secondary" 
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50"
              >
                Sign up
              </Button>
            </Link>
          </div>
          <div className="inline-flex rounded-md shadow">
            <Link href="/auth?tab=login">
              <Button 
                size="lg"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Login
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
