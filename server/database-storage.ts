import { 
  User, InsertUser, 
  Course, InsertCourse,
  TutorCourse, InsertTutorCourse,
  Availability, InsertAvailability,
  Booking, InsertBooking,
  Review, InsertReview,
  Notification, InsertNotification,
  UserRole,
  users,
  courses,
  tutorCourses,
  availabilities,
  bookings,
  reviews,
  notifications
} from "@shared/schema";
import { IStorage } from "./storage";
import { db } from "./db";
import { eq, and, inArray, or, ilike, sql } from "drizzle-orm";
import connectPgSimple from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";
import { hashPassword } from "./auth";

export class DatabaseStorage implements IStorage {
  sessionStore: any;
  
  constructor() {
    const PostgresSessionStore = connectPgSimple(session);
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
    
    // Seed initial data if needed
    this.seedInitialData();
  }

  private async seedInitialData() {
    try {
      // Check if we have any courses
      const existingCourses = await this.getAllCourses();
      
      if (existingCourses.length === 0) {
        console.log("Seeding initial courses...");
        // Add some initial courses
        const sampleCourses = [
          { name: "Calculus I", department: "Mathematics", code: "MATH101", description: "Introduction to limits, derivatives, and integrals." },
          { name: "Computer Science I", department: "Computer Science", code: "CS101", description: "Introduction to programming concepts and problem-solving." },
          { name: "Physics I", department: "Physics", code: "PHYS101", description: "Mechanics, energy, and wave phenomena." },
          { name: "Organic Chemistry", department: "Chemistry", code: "CHEM201", description: "Study of carbon compounds and their reactions." },
          { name: "Introduction to Psychology", department: "Psychology", code: "PSY101", description: "Survey of basic principles in psychology." }
        ];
        
        for (const course of sampleCourses) {
          await this.createCourse(course);
        }
      }
      
      // Check if we have an admin user
      const adminUser = await this.getUserByUsername("admin123");
      const hashedPassword = await hashPassword("password123");
      if (!adminUser) {
        console.log("Creating admin user...");
        // Create default admin
        await this.createUser({
          username: "admin123",
          email: "admin@tutalink.com",
          password: hashedPassword,
          fullName: "Admin User",
          role: UserRole.ADMIN,
          bio: "System administrator",
          profilePicture: "",
        });
      } else {
        // Always update password to ensure login works
        await this.updateUser(adminUser.id, { password: hashedPassword, isActive: true });
      }
    } catch (error) {
      console.error("Error seeding initial data:", error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(userData: InsertUser): Promise<User> {
    // Set active flag based on role
    const isActive = userData.role === UserRole.ADMIN;
    
    const result = await db.insert(users)
      .values({
        ...userData,
        isActive
      })
      .returning();
      
    return result[0];
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getPendingUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isActive, false));
  }

  // Course methods
  async getCourse(id: number): Promise<Course | undefined> {
    const result = await db.select().from(courses).where(eq(courses.id, id));
    return result[0];
  }

  async getAllCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }

  async createCourse(courseData: InsertCourse): Promise<Course> {
    const result = await db.insert(courses).values(courseData).returning();
    return result[0];
  }

  // TutorCourse methods
  async getTutorCourses(tutorId: number): Promise<TutorCourse[]> {
    return await db.select().from(tutorCourses).where(eq(tutorCourses.tutorId, tutorId));
  }

  async addTutorCourse(tutorCourseData: InsertTutorCourse): Promise<TutorCourse> {
    const result = await db.insert(tutorCourses).values(tutorCourseData).returning();
    return result[0];
  }

  async removeTutorCourse(tutorId: number, courseId: number): Promise<boolean> {
    const result = await db.delete(tutorCourses)
      .where(
        and(
          eq(tutorCourses.tutorId, tutorId),
          eq(tutorCourses.courseId, courseId)
        )
      )
      .returning();
    
    return result.length > 0;
  }

  // Availability methods
  async getTutorAvailability(tutorId: number): Promise<Availability[]> {
    return await db.select().from(availabilities).where(eq(availabilities.tutorId, tutorId));
  }

  async addAvailability(availabilityData: InsertAvailability): Promise<Availability> {
    const result = await db.insert(availabilities).values(availabilityData).returning();
    return result[0];
  }

  async removeAvailability(id: number): Promise<boolean> {
    const result = await db.delete(availabilities).where(eq(availabilities.id, id)).returning();
    return result.length > 0;
  }

  // Booking methods
  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const result = await db.insert(bookings)
      .values({
        ...bookingData,
        status: "pending"
      })
      .returning();
    
    const booking = result[0];
    
    // Create notification for tutor
    await this.createNotification({
      userId: bookingData.tutorId,
      message: "You have a new booking request",
      type: "booking",
      relatedId: booking.id
    });
    
    return booking;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const result = await db.select().from(bookings).where(eq(bookings.id, id));
    return result[0];
  }

  async getBookingsByLearner(learnerId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.learnerId, learnerId));
  }

  async getBookingsByTutor(tutorId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.tutorId, tutorId));
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const result = await db.update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    
    const booking = result[0];
    
    if (booking) {
      // Create notification for learner
      await this.createNotification({
        userId: booking.learnerId,
        message: `Your booking has been ${status}`,
        type: "booking",
        relatedId: id
      });
    }
    
    return booking;
  }

  // Review methods
  async createReview(reviewData: InsertReview): Promise<Review> {
    const result = await db.insert(reviews).values(reviewData).returning();
    const review = result[0];
    
    // Create notification for tutor
    await this.createNotification({
      userId: reviewData.tutorId,
      message: "You have received a new review",
      type: "review",
      relatedId: review.id
    });
    
    return review;
  }

  async getReviewsByTutor(tutorId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.tutorId, tutorId));
  }

  async getReviewsByLearner(learnerId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.learnerId, learnerId));
  }

  // Notification methods
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications)
      .values({
        ...notificationData,
        isRead: false
      })
      .returning();
    
    return result[0];
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return await db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(sql`${notifications.createdAt} DESC`);
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const result = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    
    return result.length > 0;
  }

  // Search and filtering
  async searchTutors(query: string): Promise<User[]> {
    if (!query) {
      return await db.select()
        .from(users)
        .where(
          and(
            eq(users.role, UserRole.TUTOR),
            eq(users.isActive, true)
          )
        );
    }
    
    return await db.select()
      .from(users)
      .where(
        and(
          eq(users.role, UserRole.TUTOR),
          eq(users.isActive, true),
          or(
            ilike(users.fullName, `%${query}%`),
            ilike(users.bio || '', `%${query}%`),
            ilike(users.username, `%${query}%`)
          )
        )
      );
  }

  async filterTutorsByCourse(courseId: number): Promise<User[]> {
    // Get all tutor IDs who teach this course
    const tutorCourseEntries = await db.select({ tutorId: tutorCourses.tutorId })
      .from(tutorCourses)
      .where(eq(tutorCourses.courseId, courseId));
    
    const tutorIds = tutorCourseEntries.map(entry => entry.tutorId);
    
    if (tutorIds.length === 0) {
      return [];
    }
    
    // Get all tutors by these IDs
    return await db.select()
      .from(users)
      .where(
        and(
          eq(users.role, UserRole.TUTOR),
          eq(users.isActive, true),
          inArray(users.id, tutorIds)
        )
      );
  }

  async filterTutorsByDepartment(department: string): Promise<User[]> {
    // Get all courses in this department
    const coursesInDept = await db.select({ id: courses.id })
      .from(courses)
      .where(eq(courses.department, department));
    
    const courseIds = coursesInDept.map(course => course.id);
    
    if (courseIds.length === 0) {
      return [];
    }
    
    // Get all tutors teaching these courses
    const tutorCourseEntries = await db.select({ tutorId: tutorCourses.tutorId })
      .from(tutorCourses)
      .where(inArray(tutorCourses.courseId, courseIds));
    
    // Use filter for uniqueness instead of Set to avoid downlevelIteration issues
    const tutorIds = tutorCourseEntries
      .map(entry => entry.tutorId)
      .filter((id, index, self) => self.indexOf(id) === index);
    
    if (tutorIds.length === 0) {
      return [];
    }
    
    // Get all tutors by these IDs
    return await db.select()
      .from(users)
      .where(
        and(
          eq(users.role, UserRole.TUTOR),
          eq(users.isActive, true),
          inArray(users.id, tutorIds)
        )
      );
  }

  async filterTutorsByRating(minRating: number): Promise<User[]> {
    // Calculate average ratings for tutors
    const tutorsWithRatings = await db.select({
        id: users.id,
        avgRating: sql<number>`AVG(${reviews.rating})::float`
      })
      .from(users)
      .leftJoin(reviews, eq(users.id, reviews.tutorId))
      .where(
        and(
          eq(users.role, UserRole.TUTOR),
          eq(users.isActive, true)
        )
      )
      .groupBy(users.id)
      .having(sql<number>`AVG(${reviews.rating})::float >= ${minRating}`);
    
    const tutorIds = tutorsWithRatings.map(tutor => tutor.id);
    
    if (tutorIds.length === 0) {
      return [];
    }
    
    // Get full user details
    return await db.select()
      .from(users)
      .where(inArray(users.id, tutorIds));
  }

  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings);
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }
}