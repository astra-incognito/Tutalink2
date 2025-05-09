import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Mail, Github } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <div>
              <span className="text-white text-2xl font-bold">TutaLink</span>
              <p className="text-gray-300 text-base mt-2">
                Connecting students with peer tutors for academic success.
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-300 transition-colors">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300 transition-colors">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300 transition-colors">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300 transition-colors">
                <span className="sr-only">GitHub</span>
                <Github className="h-6 w-6" />
              </a>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  Resources
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <Link href="/tutors">
                      <a className="text-base text-gray-300 hover:text-white transition-colors">
                        Find Tutors
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq">
                      <a className="text-base text-gray-300 hover:text-white transition-colors">
                        FAQ
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/support">
                      <a className="text-base text-gray-300 hover:text-white transition-colors">
                        Support
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog">
                      <a className="text-base text-gray-300 hover:text-white transition-colors">
                        Blog
                      </a>
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  Legal
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <Link href="/privacy">
                      <a className="text-base text-gray-300 hover:text-white transition-colors">
                        Privacy Policy
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms">
                      <a className="text-base text-gray-300 hover:text-white transition-colors">
                        Terms of Service
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/cookies">
                      <a className="text-base text-gray-300 hover:text-white transition-colors">
                        Cookie Policy
                      </a>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  Company
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <Link href="/about">
                      <a className="text-base text-gray-300 hover:text-white transition-colors">
                        About
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/careers">
                      <a className="text-base text-gray-300 hover:text-white transition-colors">
                        Careers
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact">
                      <a className="text-base text-gray-300 hover:text-white transition-colors">
                        Contact
                      </a>
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  Subscribe to our newsletter
                </h3>
                <p className="mt-4 text-base text-gray-300">
                  Get the latest updates on new features and tutors.
                </p>
                <form className="mt-4 sm:flex sm:max-w-md">
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <Input
                    type="email"
                    name="email-address"
                    id="email-address"
                    autoComplete="email"
                    required
                    placeholder="Enter your email"
                    className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <div className="mt-3 rounded-md sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                    <button
                      type="submit"
                      className={cn(
                        buttonVariants({ variant: "default" }),
                        "w-full"
                      )}
                    >
                      Subscribe
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 xl:text-center">
            &copy; {new Date().getFullYear()} TutaLink, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
