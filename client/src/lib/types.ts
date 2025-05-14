import { z } from "zod";

export type User = {
  id: number;
  username: string;
  email: string;
  role: "learner" | "tutor" | "admin";
  fullName?: string;
  profileImage?: string;
  department?: string;
  yearOfStudy?: number;
  walletBalance?: number;
  stripeCustomerId?: string;
  cwa?: number;
  isApproved?: boolean;
  transcriptPath?: string;
};

export type LoginData = {
  username: string;
  password: string;
};

export type RegisterData = {
  username: string;
  email: string;
  password: string;
  fullName: string;
};

export type Tutor = User & {
  rating: number;
  subjects: string[];
  price: number;
  availability: Availability[];
  reviews: Review[];
};

export type Availability = {
  id: number;
  tutorId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location: string;
};

export type Course = {
  id: number;
  name: string;
  code: string;
  description: string;
  departmentId: number;
};

export type Department = {
  id: number;
  name: string;
  collegeId: number;
};

export type College = {
  id: number;
  name: string;
};

export type Session = {
  id: number;
  learnerId: number;
  tutorId: number;
  learnerName?: string;
  tutorName?: string;
  courseId?: number;
  courseName?: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded";
  amount: number;
  notes?: string;
};

export type Review = {
  id: number;
  learnerId: number;
  tutorId: number;
  learnerName?: string;
  tutorName?: string;
  rating: number;
  comment: string;
  courseId?: number;
  courseName?: string;
  createdAt: string;
  tutorResponse?: string;
};

export type TutorApplication = {
  userId: number;
  fullName: string;
  department: string;
  yearOfStudy: number;
  cwa: number;
  subjects: string[];
  transcriptPath: string;
  status: "pending" | "approved" | "rejected";
};

export type FooterContent = {
  id: number;
  copyright: string;
  links: {
    text: string;
    url: string;
  }[];
  socialMedia: {
    platform: string;
    url: string;
  }[];
};

export const registrationSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name is required"),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const tutorApplicationSchema = z.object({
  department: z.string().min(1, "Department is required"),
  yearOfStudy: z.number().min(1, "Year of study is required"),
  cwa: z.number().min(3.4, "Minimum CWA of 3.4 is required").max(4.0, "Maximum CWA is 4.0"),
  subjects: z.array(z.string()).min(1, "At least one subject is required"),
});
