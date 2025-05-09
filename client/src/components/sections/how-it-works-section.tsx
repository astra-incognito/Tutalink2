import { motion } from "framer-motion";
import { UserPlus, Search, Calendar, BookOpen, Bell, Star } from "lucide-react";

interface Step {
  number: string;
  title: string;
  description: string;
  color: string;
  icon: any;
  iconBg: string;
}

const learnerSteps: Step[] = [
  {
    number: "1",
    title: "Create an account",
    description: "Sign up as a learner, complete your profile with your courses and academic interests.",
    color: "primary",
    icon: UserPlus,
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    number: "2",
    title: "Find a tutor",
    description: "Browse and filter tutors by course, availability, rating, or location on campus.",
    color: "primary",
    icon: Search,
    iconBg: "bg-green-100 text-green-600",
  },
  {
    number: "3",
    title: "Book a session",
    description: "Schedule a tutorial session at your preferred time and campus location.",
    color: "primary",
    icon: Calendar,
    iconBg: "bg-purple-100 text-purple-600",
  },
];

const tutorSteps: Step[] = [
  {
    number: "1",
    title: "Create a tutor profile",
    description: "Sign up as a tutor, list your course expertise, and set your availability.",
    color: "secondary",
    icon: BookOpen,
    iconBg: "bg-yellow-100 text-yellow-700",
  },
  {
    number: "2",
    title: "Receive booking requests",
    description: "Get notified when students request to book tutorial sessions with you.",
    color: "secondary",
    icon: Bell,
    iconBg: "bg-pink-100 text-pink-600",
  },
  {
    number: "3",
    title: "Conduct sessions & earn",
    description: "Host effective tutorial sessions and build your reputation through positive reviews.",
    color: "secondary",
    icon: Star,
    iconBg: "bg-indigo-100 text-indigo-600",
  },
];

function StepCard({ step, index }: { step: Step; index: number }) {
  return (
    <motion.div
      className="flex flex-col rounded-lg shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="flex-1 bg-white p-6 flex flex-col justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center mr-3 ${step.iconBg}`}>
              <step.icon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
          </div>
          <p className="mt-3 text-base text-gray-500">
            {step.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

interface HowItWorksSectionProps {
  className?: string;
}

export function HowItWorksSection({ className = "" }: HowItWorksSectionProps) {
  return (
    <section id="how-it-works" className={`py-12 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <motion.h2
            className="text-base text-primary-600 font-semibold tracking-wide uppercase"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>
          <motion.p
            className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            Simple steps to academic success
          </motion.p>
          <motion.p
            className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
          >
            Getting the help you need has never been easier.
          </motion.p>
        </div>

        <div className="mt-10">
          <motion.div 
            className="relative"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-gray-50 text-lg font-medium text-gray-900">
                For Learners
              </span>
            </div>
          </motion.div>

          <div className="mt-8 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
            {learnerSteps.map((step, index) => (
              <StepCard key={step.title} step={step} index={index} />
            ))}
          </div>

          <motion.div 
            className="relative mt-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-gray-50 text-lg font-medium text-gray-900">
                For Tutors
              </span>
            </div>
          </motion.div>

          <div className="mt-8 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
            {tutorSteps.map((step, index) => (
              <StepCard key={step.title} step={step} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
