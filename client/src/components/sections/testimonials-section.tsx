import { motion } from "framer-motion";
import { StarRating } from "@/components/ui/star-rating";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Testimonial {
  id: number;
  content: string;
  rating: number;
  author: {
    name: string;
    role: string;
    imageUrl?: string;
  };
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    content: "I was struggling with Calculus II until I found Jake through TutaLink. After just three sessions, I went from failing to getting a B+ on my midterm!",
    rating: 5,
    author: {
      name: "Sarah T.",
      role: "Computer Science, Sophomore",
      imageUrl: "https://randomuser.me/api/portraits/women/44.jpg"
    }
  },
  {
    id: 2,
    content: "As a tutor on TutaLink, I've been able to help fellow students while reinforcing my own knowledge. The scheduling system makes it easy to balance tutoring with my own coursework.",
    rating: 4,
    author: {
      name: "Michael R.",
      role: "Biology, Senior",
      imageUrl: "https://randomuser.me/api/portraits/men/32.jpg"
    }
  },
  {
    id: 3,
    content: "As an international student, I sometimes need help understanding complex topics in my native language. TutaLink helped me find another student from my country who could explain everything clearly.",
    rating: 5,
    author: {
      name: "Aisha K.",
      role: "Economics, Junior",
      imageUrl: "https://randomuser.me/api/portraits/women/68.jpg"
    }
  },
  {
    id: 4,
    content: "TutaLink made it so easy to find a tutor who understood my course and my learning style. I felt supported every step of the way!",
    rating: 5,
    author: {
      name: "Akua Gyanewa",
      role: "Communication Design (Learner), KNUST",
    },
  },
  {
    id: 5,
    content: "Tutoring on TutaLink has been a rewarding experience. Helping others in Computer Science has deepened my own understanding, and the platform is super easy to use.",
    rating: 5,
    author: {
      name: "Lazarus Sakyi",
      role: "Computer Science (Tutor), KNUST",
    },
  },
  {
    id: 6,
    content: "I found the perfect study partner for Biological Science at University of Ghana. TutaLink connects you with real students who get it!",
    rating: 4,
    author: {
      name: "Noble Qurshie",
      role: "Biological Science, University of Ghana",
    },
  },
];

interface TestimonialsSectionProps {
  className?: string;
}

export function TestimonialsSection({ className = "" }: TestimonialsSectionProps) {
  return (
    <section id="testimonials" className={`py-12 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <motion.h2
            className="text-base text-primary-600 font-semibold tracking-wide uppercase"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Testimonials
          </motion.h2>
          <motion.p
            className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            What students are saying
          </motion.p>
          <motion.p
            className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            TutaLink has helped countless students improve their grades and confidence.
          </motion.p>
        </div>

        <div className="mt-10 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full border border-gray-100 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    <StarRating rating={testimonial.rating} />
                  </div>
                  <p className="text-xl font-semibold text-gray-900 mb-2">
                    {testimonial.id === 1 && "\"TutaLink saved my semester!\""}
                    {testimonial.id === 2 && "\"Great for both sides of the equation\""}
                    {testimonial.id === 3 && "\"Perfect for us international students\""}
                  </p>
                  <p className="text-base text-gray-500 mb-4">
                    {testimonial.content}
                  </p>
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 bg-gray-200">
                      {testimonial.author.imageUrl ? (
                        <AvatarImage src={testimonial.author.imageUrl} alt={testimonial.author.name} />
                      ) : (
                        <AvatarFallback className="bg-gray-300 text-gray-700">
                          {testimonial.author.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{testimonial.author.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.author.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
