import * as React from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { FooterContent } from "@/lib/types";

export function Footer() {
  const { data: footerContent } = useQuery<FooterContent>({
    queryKey: ["/api/footer-content"],
    enabled: false, // Disable the query initially
  });

  const defaultFooterContent: FooterContent = {
    id: 1,
    copyright: "© 2023 TutaLink. All rights reserved. KNUST Student Connection Platform.",
    links: [
      { text: "Terms of Service", url: "/terms" },
      { text: "Privacy Policy", url: "/privacy" },
      { text: "Contact Us", url: "/contact" }
    ],
    socialMedia: [
      { platform: "facebook", url: "https://facebook.com" },
      { platform: "instagram", url: "https://instagram.com" },
      { platform: "twitter", url: "https://twitter.com" }
    ]
  };

  const content = footerContent || defaultFooterContent;

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 md:flex md:items-center md:justify-between">
        <div className="flex justify-center space-x-6 md:order-2">
          {content.socialMedia.map((social, index) => (
            <a 
              key={index}
              href={social.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <span className="sr-only">{social.platform}</span>
              <i className={`fab fa-${social.platform} text-xl`}></i>
            </a>
          ))}
        </div>
        <div className="mt-8 md:mt-0 md:order-1">
          <p className="text-center text-base text-gray-500 dark:text-gray-400">
            {content.copyright}
          </p>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            {content.links.map((link, index) => (
              <span key={index}>
                {index > 0 && " · "}
                <Link href={link.url} className="hover:text-primary dark:hover:text-primary-400">
                  {link.text}
                </Link>
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
