import { motion } from "framer-motion";
import { 
  Search, 
  Calendar, 
  GraduationCap, 
  Star 
} from "lucide-react";

const features = [
  {
    name: "Find the perfect tutor",
    description: "Search by course, department, or rating to find tutors who've excelled in the subjects you need help with.",
    icon: Search,
    color: "bg-blue-500",
  },
  {
    name: "Book sessions with ease",
    description: "Schedule in-person tutorial sessions at convenient campus locations, choose your preferred time slots.",
    icon: Calendar,
    color: "bg-green-500",
  },
  {
    name: "Share your knowledge",
    description: "Sign up as a tutor to help fellow students while building your teaching experience and earning extra income.",
    icon: GraduationCap,
    color: "bg-purple-500",
  },
  {
    name: "Real student reviews",
    description: "Read and leave honest reviews to help others find the best tutors for their needs.",
    icon: Star,
    color: "bg-yellow-500",
  },
];

interface FeaturesSectionProps {
  className?: string;
}

export function FeaturesSection({ className = "" }: FeaturesSectionProps) {
  return (
    <section id="features" className={`py-12 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <motion.h2 
            className="text-base text-primary-600 font-semibold tracking-wide uppercase"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Features
          </motion.h2>
          <motion.p 
            className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            Everything you need to succeed
          </motion.p>
          <motion.p 
            className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
          >
            TutaLink connects you with the right tutor for your specific academic needs.
          </motion.p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature, index) => (
              <motion.div 
                key={feature.name} 
                className="relative bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                viewport={{ once: true }}
              >
                <dt>
                  <div className={`absolute flex items-center justify-center h-12 w-12 rounded-md text-white ${feature.color}`}>
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
