import { pgTable, text, serial, integer, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User role enum
export const UserRole = {
  LEARNER: "learner",
  TUTOR: "tutor",
  ADMIN: "admin",
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  bio: text("bio"),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  fullName: true,
  role: true,
  bio: true,
  profilePicture: true,
});

// Courses table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  department: text("department").notNull(),
  code: text("code").notNull(),
  description: text("description"),
});

export const insertCourseSchema = createInsertSchema(courses).pick({
  name: true,
  department: true,
  code: true,
  description: true,
});

// TutorCourses table (junction table for tutors and courses)
export const tutorCourses = pgTable("tutor_courses", {
  id: serial("id").primaryKey(),
  tutorId: integer("tutor_id").notNull(),
  courseId: integer("course_id").notNull(),
});

export const insertTutorCourseSchema = createInsertSchema(tutorCourses).pick({
  tutorId: true,
  courseId: true,
});

// Availability table
export const availabilities = pgTable("availabilities", {
  id: serial("id").primaryKey(),
  tutorId: integer("tutor_id").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 for Sunday-Saturday
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
});

export const insertAvailabilitySchema = createInsertSchema(availabilities).pick({
  tutorId: true,
  dayOfWeek: true,
  startTime: true,
  endTime: true,
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  learnerId: integer("learner_id").notNull(),
  tutorId: integer("tutor_id").notNull(),
  courseId: integer("course_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  location: text("location").notNull(),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected, completed
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBookingSchema = createInsertSchema(bookings).pick({
  learnerId: true,
  tutorId: true,
  courseId: true,
  date: true,
  startTime: true,
  endTime: true,
  location: true,
  notes: true,
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  learnerId: integer("learner_id").notNull(),
  tutorId: integer("tutor_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  bookingId: true,
  learnerId: true,
  tutorId: true,
  rating: true,
  comment: true,
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // booking, review, system
  isRead: boolean("is_read").default(false).notNull(),
  relatedId: integer("related_id"), // ID of the related entity (booking, review, etc.)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  message: true,
  type: true,
  relatedId: true,
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  availabilities: many(availabilities),
  bookingsAsTutor: many(bookings, { relationName: "tutor" }),
  bookingsAsLearner: many(bookings, { relationName: "learner" }),
  reviewsAsTutor: many(reviews, { relationName: "tutor" }),
  reviewsAsLearner: many(reviews, { relationName: "learner" }),
  tutorCourses: many(tutorCourses),
  notifications: many(notifications),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  tutorCourses: many(tutorCourses),
  bookings: many(bookings),
}));

export const tutorCoursesRelations = relations(tutorCourses, ({ one }) => ({
  tutor: one(users, {
    fields: [tutorCourses.tutorId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [tutorCourses.courseId],
    references: [courses.id],
  }),
}));

export const availabilitiesRelations = relations(availabilities, ({ one }) => ({
  tutor: one(users, {
    fields: [availabilities.tutorId],
    references: [users.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  tutor: one(users, {
    fields: [bookings.tutorId],
    references: [users.id],
    relationName: "tutor",
  }),
  learner: one(users, {
    fields: [bookings.learnerId],
    references: [users.id],
    relationName: "learner",
  }),
  course: one(courses, {
    fields: [bookings.courseId],
    references: [courses.id],
  }),
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
  tutor: one(users, {
    fields: [reviews.tutorId],
    references: [users.id],
    relationName: "tutor",
  }),
  learner: one(users, {
    fields: [reviews.learnerId],
    references: [users.id],
    relationName: "learner",
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Types for our schema
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type TutorCourse = typeof tutorCourses.$inferSelect;
export type InsertTutorCourse = z.infer<typeof insertTutorCourseSchema>;

export type Availability = typeof availabilities.$inferSelect;
export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
