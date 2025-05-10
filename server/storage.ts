import { 
  User, InsertUser, 
  Course, InsertCourse,
  TutorCourse, InsertTutorCourse,
  Availability, InsertAvailability,
  Booking, InsertBooking,
  Review, InsertReview,
  Notification, InsertNotification,
  UserRole
} from "@shared/schema";

// Modify the interface with CRUD methods needed for the application
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getPendingUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<boolean>;
  
  // Course methods
  getCourse(id: number): Promise<Course | undefined>;
  getAllCourses(): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  
  // TutorCourse methods
  getTutorCourses(tutorId: number): Promise<TutorCourse[]>;
  addTutorCourse(tutorCourse: InsertTutorCourse): Promise<TutorCourse>;
  removeTutorCourse(tutorId: number, courseId: number): Promise<boolean>;
  
  // Availability methods
  getTutorAvailability(tutorId: number): Promise<Availability[]>;
  addAvailability(availability: InsertAvailability): Promise<Availability>;
  removeAvailability(id: number): Promise<boolean>;
  
  // Booking methods
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByLearner(learnerId: number): Promise<Booking[]>;
  getBookingsByTutor(tutorId: number): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  getAllBookings(): Promise<Booking[]>;
  
  // Review methods
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByTutor(tutorId: number): Promise<Review[]>;
  getReviewsByLearner(learnerId: number): Promise<Review[]>;
  
  // Notification methods
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<boolean>;
  
  // Search and filtering
  searchTutors(query: string): Promise<User[]>;
  filterTutorsByCourse(courseId: number): Promise<User[]>;
  filterTutorsByDepartment(department: string): Promise<User[]>;
  filterTutorsByRating(minRating: number): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private tutorCourses: Map<number, TutorCourse>;
  private availabilities: Map<number, Availability>;
  private bookings: Map<number, Booking>;
  private reviews: Map<number, Review>;
  private notifications: Map<number, Notification>;
  
  private userIdCounter: number;
  private courseIdCounter: number;
  private tutorCourseIdCounter: number;
  private availabilityIdCounter: number;
  private bookingIdCounter: number;
  private reviewIdCounter: number;
  private notificationIdCounter: number;
  
  constructor() {
    // Initialize storage maps
    this.users = new Map();
    this.courses = new Map();
    this.tutorCourses = new Map();
    this.availabilities = new Map();
    this.bookings = new Map();
    this.reviews = new Map();
    this.notifications = new Map();
    
    // Initialize ID counters
    this.userIdCounter = 1;
    this.courseIdCounter = 1;
    this.tutorCourseIdCounter = 1;
    this.availabilityIdCounter = 1;
    this.bookingIdCounter = 1;
    this.reviewIdCounter = 1;
    this.notificationIdCounter = 1;
    
    // Create default admin user
    this.createUser({
      username: "admin123",
      email: "admin@tutalink.com",
      password: "password123",
      fullName: "Admin User",
      role: UserRole.ADMIN,
      bio: "System administrator",
      profilePicture: "",
    }).then(admin => {
      // Set admin as active
      this.updateUser(admin.id, { isActive: true });
    });
    
    // Initialize with some sample courses
    const sampleCourses = [
      { name: "Calculus I", department: "Mathematics", code: "MATH101", description: "Introduction to limits, derivatives, and integrals." },
      { name: "Computer Science I", department: "Computer Science", code: "CS101", description: "Introduction to programming concepts and problem-solving." },
      { name: "Physics I", department: "Physics", code: "PHYS101", description: "Mechanics, energy, and wave phenomena." },
      { name: "Organic Chemistry", department: "Chemistry", code: "CHEM201", description: "Study of carbon compounds and their reactions." },
      { name: "Introduction to Psychology", department: "Psychology", code: "PSY101", description: "Survey of basic principles in psychology." }
    ];
    
    sampleCourses.forEach(course => {
      this.createCourse(course);
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = {
      ...userData,
      id,
      isActive: userData.role === UserRole.ADMIN, // Only admin is active by default
      createdAt: now,
      bio: userData.bio ?? null,
      profilePicture: userData.profilePicture ?? null
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) {
      return undefined;
    }
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async getPendingUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => !user.isActive);
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
  
  // Course methods
  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }
  
  async getAllCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }
  
  async createCourse(courseData: InsertCourse): Promise<Course> {
    const id = this.courseIdCounter++;
    const course: Course = { ...courseData, id, description: courseData.description ?? null };
    this.courses.set(id, course);
    return course;
  }
  
  // TutorCourse methods
  async getTutorCourses(tutorId: number): Promise<TutorCourse[]> {
    return Array.from(this.tutorCourses.values()).filter(tc => tc.tutorId === tutorId);
  }
  
  async addTutorCourse(tutorCourseData: InsertTutorCourse): Promise<TutorCourse> {
    const id = this.tutorCourseIdCounter++;
    const tutorCourse: TutorCourse = { ...tutorCourseData, id };
    this.tutorCourses.set(id, tutorCourse);
    return tutorCourse;
  }
  
  async removeTutorCourse(tutorId: number, courseId: number): Promise<boolean> {
    const tutorCourse = Array.from(this.tutorCourses.values()).find(
      tc => tc.tutorId === tutorId && tc.courseId === courseId
    );
    
    if (!tutorCourse) {
      return false;
    }
    
    return this.tutorCourses.delete(tutorCourse.id);
  }
  
  // Availability methods
  async getTutorAvailability(tutorId: number): Promise<Availability[]> {
    return Array.from(this.availabilities.values()).filter(a => a.tutorId === tutorId);
  }
  
  async addAvailability(availabilityData: InsertAvailability): Promise<Availability> {
    const id = this.availabilityIdCounter++;
    const availability: Availability = { ...availabilityData, id };
    this.availabilities.set(id, availability);
    return availability;
  }
  
  async removeAvailability(id: number): Promise<boolean> {
    return this.availabilities.delete(id);
  }
  
  // Booking methods
  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const id = this.bookingIdCounter++;
    const now = new Date();
    const booking: Booking = {
      ...bookingData,
      id,
      status: "pending",
      createdAt: now,
      notes: bookingData.notes ?? null
    };
    this.bookings.set(id, booking);
    
    // Create notification for tutor
    await this.createNotification({
      userId: bookingData.tutorId,
      message: "You have a new booking request",
      type: "booking",
      relatedId: id
    });
    
    return booking;
  }
  
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }
  
  async getBookingsByLearner(learnerId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(b => b.learnerId === learnerId);
  }
  
  async getBookingsByTutor(tutorId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(b => b.tutorId === tutorId);
  }
  
  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const booking = await this.getBooking(id);
    if (!booking) {
      return undefined;
    }
    
    const updatedBooking = { ...booking, status };
    this.bookings.set(id, updatedBooking);
    
    // Create notification for learner
    await this.createNotification({
      userId: booking.learnerId,
      message: `Your booking has been ${status}`,
      type: "booking",
      relatedId: id
    });
    
    return updatedBooking;
  }
  
  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }
  
  // Review methods
  async createReview(reviewData: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const now = new Date();
    const review: Review = {
      ...reviewData,
      id,
      createdAt: now,
      comment: reviewData.comment ?? null
    };
    this.reviews.set(id, review);
    
    // Create notification for tutor
    await this.createNotification({
      userId: reviewData.tutorId,
      message: "You have received a new review",
      type: "review",
      relatedId: id
    });
    
    return review;
  }
  
  async getReviewsByTutor(tutorId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(r => r.tutorId === tutorId);
  }
  
  async getReviewsByLearner(learnerId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(r => r.learnerId === learnerId);
  }
  
  // Notification methods
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const now = new Date();
    const notification: Notification = {
      ...notificationData,
      id,
      isRead: false,
      createdAt: now,
      relatedId: notificationData.relatedId ?? null
    };
    this.notifications.set(id, notification);
    return notification;
  }
  
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async markNotificationAsRead(id: number): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) {
      return false;
    }
    
    this.notifications.set(id, { ...notification, isRead: true });
    return true;
  }
  
  // Search and filtering
  async searchTutors(query: string): Promise<User[]> {
    const normalizedQuery = query.toLowerCase();
    return Array.from(this.users.values()).filter(user => 
      user.role === UserRole.TUTOR && 
      user.isActive &&
      (user.fullName.toLowerCase().includes(normalizedQuery) || 
       user.bio?.toLowerCase().includes(normalizedQuery))
    );
  }
  
  async filterTutorsByCourse(courseId: number): Promise<User[]> {
    const tutorIds = new Set(
      Array.from(this.tutorCourses.values())
        .filter(tc => tc.courseId === courseId)
        .map(tc => tc.tutorId)
    );
    
    return Array.from(this.users.values()).filter(user => 
      user.role === UserRole.TUTOR && 
      user.isActive &&
      tutorIds.has(user.id)
    );
  }
  
  async filterTutorsByDepartment(department: string): Promise<User[]> {
    const courseIdsInDepartment = Array.from(this.courses.values())
      .filter(course => course.department === department)
      .map(course => course.id);
    
    const tutorIds = new Set(
      Array.from(this.tutorCourses.values())
        .filter(tc => courseIdsInDepartment.includes(tc.courseId))
        .map(tc => tc.tutorId)
    );
    
    return Array.from(this.users.values()).filter(user => 
      user.role === UserRole.TUTOR && 
      user.isActive &&
      tutorIds.has(user.id)
    );
  }
  
  async filterTutorsByRating(minRating: number): Promise<User[]> {
    // Group reviews by tutor and calculate average ratings
    const tutorRatings = new Map<number, number>();
    const tutorReviewCounts = new Map<number, number>();
    
    Array.from(this.reviews.values()).forEach(review => {
      const currentSum = tutorRatings.get(review.tutorId) || 0;
      const currentCount = tutorReviewCounts.get(review.tutorId) || 0;
      
      tutorRatings.set(review.tutorId, currentSum + review.rating);
      tutorReviewCounts.set(review.tutorId, currentCount + 1);
    });
    
    // Find tutors with average rating >= minRating
    const qualifyingTutorIds = new Set<number>();
    tutorRatings.forEach((ratingSum, tutorId) => {
      const reviewCount = tutorReviewCounts.get(tutorId) || 0;
      if (reviewCount > 0 && ratingSum / reviewCount >= minRating) {
        qualifyingTutorIds.add(tutorId);
      }
    });
    
    return Array.from(this.users.values()).filter(user => 
      user.role === UserRole.TUTOR && 
      user.isActive &&
      qualifyingTutorIds.has(user.id)
    );
  }
}

import { DatabaseStorage } from "./database-storage";

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
