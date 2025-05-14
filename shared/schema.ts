import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  role: text("role", { enum: ["learner", "tutor", "admin"] }).notNull().default("learner"),
  department: text("department"),
  yearOfStudy: integer("year_of_study"),
  profileImage: text("profile_image"),
  walletBalance: doublePrecision("wallet_balance").default(0),
  stripeCustomerId: text("stripe_customer_id"),
  cwa: doublePrecision("cwa"),
  isApproved: boolean("is_approved").default(true),
  transcriptPath: text("transcript_path"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Sessions table
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  learnerId: integer("learner_id").notNull(),
  tutorId: integer("tutor_id").notNull(),
  courseId: integer("course_id"),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  location: text("location").notNull(),
  status: text("status", { enum: ["pending", "confirmed", "completed", "cancelled"] }).notNull().default("pending"),
  paymentStatus: text("payment_status", { enum: ["pending", "paid", "refunded"] }).notNull().default("pending"),
  amount: doublePrecision("amount").notNull(),
  notes: text("notes"),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true
});

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  learnerId: integer("learner_id").notNull(),
  tutorId: integer("tutor_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  courseId: integer("course_id"),
  createdAt: text("created_at").notNull(),
  tutorResponse: text("tutor_response"),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true
});

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

// Courses table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  departmentId: integer("department_id").notNull(),
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true
});

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

// Departments table
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  collegeId: integer("college_id").notNull(),
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true
});

export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof departments.$inferSelect;

// Colleges table
export const colleges = pgTable("colleges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export const insertCollegeSchema = createInsertSchema(colleges).omit({
  id: true
});

export type InsertCollege = z.infer<typeof insertCollegeSchema>;
export type College = typeof colleges.$inferSelect;

// Additional types (not mapped to tables)

// TutorApplication type
export interface TutorApplication {
  userId: number;
  fullName: string;
  department: string;
  yearOfStudy: number;
  cwa: number;
  subjects: string[];
  transcriptPath: string;
  status: "pending" | "approved" | "rejected";
}

// FooterContent type
export interface FooterContent {
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
}

// SystemConfig type for storing application configuration like API keys
export interface SystemConfig {
  id: number;
  key: string;
  value: string;
  description?: string;
}
