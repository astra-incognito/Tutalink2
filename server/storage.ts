import { 
  users, 
  type User, 
  type InsertUser, 
  Session, 
  InsertSession, 
  Review, 
  InsertReview, 
  TutorApplication, 
  FooterContent,
  SystemConfig
} from "@shared/schema";
import { Tutor } from "@/lib/types";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  updateUserRole(id: number, role: string): Promise<User | undefined>;
  updateUserApproval(id: number, isApproved: boolean): Promise<User | undefined>;
  resetUserPassword(id: number, newPassword: string): Promise<User | undefined>;
  deleteUser(id: number): Promise<void>;
  getAllUsers(): Promise<User[]>;

  // Tutor operations
  getTutors(): Promise<Tutor[]>;
  getRecommendedTutors(): Promise<Tutor[]>;
  getTutorById(id: number): Promise<Tutor | undefined>;
  getAllTutors(): Promise<Tutor[]>;

  // Session operations
  createSession(session: InsertSession): Promise<Session>;
  getSessionById(id: number): Promise<Session | undefined>;
  updateSessionStatus(id: number, status: string): Promise<Session | undefined>;
  getLearnerSessions(learnerId: number): Promise<Session[]>;
  getTutorSessions(tutorId: number): Promise<Session[]>;
  getAllSessions(): Promise<Session[]>;
  getUpcomingLearnerSessions(learnerId: number): Promise<Session[]>;
  getUpcomingTutorSessions(tutorId: number): Promise<Session[]>;
  getAllUpcomingSessions(): Promise<Session[]>;

  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getLearnerReviews(learnerId: number): Promise<Review[]>;
  getTutorReviews(tutorId: number): Promise<Review[]>;
  getAllReviews(): Promise<Review[]>;
  getRecentReviews(): Promise<Review[]>;

  // Tutor application operations
  createTutorApplication(application: TutorApplication): Promise<TutorApplication>;
  getTutorApplicationById(userId: number): Promise<TutorApplication | undefined>;
  approveTutorApplication(userId: number): Promise<TutorApplication | undefined>;
  rejectTutorApplication(userId: number): Promise<TutorApplication | undefined>;
  getAllTutorApplications(): Promise<TutorApplication[]>;

  // Footer content operations
  getFooterContent(): Promise<FooterContent>;
  updateFooterContent(content: FooterContent): Promise<FooterContent>;

  // System configuration operations
  getSystemConfig(key: string): Promise<SystemConfig | undefined>;
  getAllSystemConfigs(): Promise<SystemConfig[]>;
  updateSystemConfig(key: string, value: string): Promise<SystemConfig>;
  
  // Admin dashboard data
  getAdminDashboardData(): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sessions: Map<number, Session>;
  private reviews: Map<number, Review>;
  private tutorApplications: Map<number, TutorApplication>;
  private systemConfigs: Map<string, SystemConfig>;
  private footerContent: FooterContent;
  currentId: number;
  currentSessionId: number;
  currentReviewId: number;
  currentConfigId: number;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.reviews = new Map();
    this.tutorApplications = new Map();
    this.systemConfigs = new Map();
    this.currentId = 1;
    this.currentSessionId = 1;
    this.currentReviewId = 1;
    this.currentConfigId = 1;

    // Create a default admin user
    this.users.set(1, {
      id: 1,
      username: "admin",
      email: "admin@tutalink.com",
      password: "dd12dff51e73ab3bc5230c6e78fbdd4f4c493f6cc5a7a127e8b0a5ade1a06aabf59ce7da9bfd2792027e5e43a9f9cd4bf3c2f6e54ef871c4c713e7662bf362df.b1a5ab3849e07ec2b0ecc9a3de50829d", // admin123
      fullName: "Admin User",
      role: "admin",
      department: null,
      yearOfStudy: null,
      profileImage: null,
      walletBalance: 0,
      stripeCustomerId: null,
      cwa: null,
      isApproved: true,
      transcriptPath: null
    });
    
    // Initialize default Stripe system configs
    this.systemConfigs.set("STRIPE_SECRET_KEY", {
      id: this.currentConfigId++,
      key: "STRIPE_SECRET_KEY",
      value: "",
      description: "Stripe Secret Key for payment processing"
    });
    
    this.systemConfigs.set("VITE_STRIPE_PUBLIC_KEY", {
      id: this.currentConfigId++,
      key: "VITE_STRIPE_PUBLIC_KEY",
      value: "",
      description: "Stripe Public Key for client-side payment forms"
    });

    // Initialize with default footer content
    this.footerContent = {
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

    // Seed admin user
    this.createUser({
      username: "admin123",
      email: "admin@tutalink.com",
      password: "$2a$10$XWiOkTZsQVJFfMu/2X1kAOlVY6NXeIA.jd3fqXS05cGVvHn/NCL4K", // password123
      fullName: "Admin User",
      role: "admin",
      isApproved: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserRole(id: number, role: string): Promise<User | undefined> {
    return this.updateUser(id, { role: role as "learner" | "tutor" | "admin" });
  }

  async updateUserApproval(id: number, isApproved: boolean): Promise<User | undefined> {
    return this.updateUser(id, { isApproved });
  }

  async resetUserPassword(id: number, newPassword: string): Promise<User | undefined> {
    return this.updateUser(id, { password: newPassword });
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Tutor operations
  async getTutors(): Promise<Tutor[]> {
    return Array.from(this.users.values())
      .filter(user => user.role === "tutor" && user.isApproved)
      .map(user => this.convertUserToTutor(user));
  }

  async getRecommendedTutors(): Promise<Tutor[]> {
    // In a real app, this would use some recommendation algorithm
    return this.getTutors().then(tutors => 
      tutors.sort((a, b) => b.rating - a.rating).slice(0, 3)
    );
  }

  async getTutorById(id: number): Promise<Tutor | undefined> {
    const user = this.users.get(id);
    if (!user || user.role !== "tutor") return undefined;
    
    return this.convertUserToTutor(user);
  }

  async getAllTutors(): Promise<Tutor[]> {
    return Array.from(this.users.values())
      .filter(user => user.role === "tutor")
      .map(user => this.convertUserToTutor(user));
  }

  // Session operations
  async createSession(session: InsertSession): Promise<Session> {
    const id = this.currentSessionId++;
    const newSession: Session = { ...session, id };
    this.sessions.set(id, newSession);
    return newSession;
  }

  async getSessionById(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async updateSessionStatus(id: number, status: string): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;

    const updatedSession = { 
      ...session, 
      status: status as "pending" | "confirmed" | "completed" | "cancelled" 
    };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  async getLearnerSessions(learnerId: number): Promise<Session[]> {
    return Array.from(this.sessions.values())
      .filter(session => session.learnerId === learnerId);
  }

  async getTutorSessions(tutorId: number): Promise<Session[]> {
    return Array.from(this.sessions.values())
      .filter(session => session.tutorId === tutorId);
  }

  async getAllSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values());
  }

  async getUpcomingLearnerSessions(learnerId: number): Promise<Session[]> {
    const now = new Date();
    return Array.from(this.sessions.values())
      .filter(session => 
        session.learnerId === learnerId && 
        (session.status === "pending" || session.status === "confirmed") &&
        new Date(session.date) >= now
      );
  }

  async getUpcomingTutorSessions(tutorId: number): Promise<Session[]> {
    const now = new Date();
    return Array.from(this.sessions.values())
      .filter(session => 
        session.tutorId === tutorId && 
        (session.status === "pending" || session.status === "confirmed") &&
        new Date(session.date) >= now
      );
  }

  async getAllUpcomingSessions(): Promise<Session[]> {
    const now = new Date();
    return Array.from(this.sessions.values())
      .filter(session => 
        (session.status === "pending" || session.status === "confirmed") &&
        new Date(session.date) >= now
      );
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const newReview: Review = { ...review, id };
    this.reviews.set(id, newReview);
    return newReview;
  }

  async getLearnerReviews(learnerId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.learnerId === learnerId);
  }

  async getTutorReviews(tutorId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.tutorId === tutorId);
  }

  async getAllReviews(): Promise<Review[]> {
    return Array.from(this.reviews.values());
  }

  async getRecentReviews(): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }

  // Tutor application operations
  async createTutorApplication(application: TutorApplication): Promise<TutorApplication> {
    this.tutorApplications.set(application.userId, application);
    return application;
  }

  async getTutorApplicationById(userId: number): Promise<TutorApplication | undefined> {
    return this.tutorApplications.get(userId);
  }

  async approveTutorApplication(userId: number): Promise<TutorApplication | undefined> {
    const application = this.tutorApplications.get(userId);
    if (!application) return undefined;

    const updatedApplication = { ...application, status: "approved" as const };
    this.tutorApplications.set(userId, updatedApplication);
    return updatedApplication;
  }

  async rejectTutorApplication(userId: number): Promise<TutorApplication | undefined> {
    const application = this.tutorApplications.get(userId);
    if (!application) return undefined;

    const updatedApplication = { ...application, status: "rejected" as const };
    this.tutorApplications.set(userId, updatedApplication);
    return updatedApplication;
  }

  async getAllTutorApplications(): Promise<TutorApplication[]> {
    return Array.from(this.tutorApplications.values());
  }

  // Footer content operations
  async getFooterContent(): Promise<FooterContent> {
    return this.footerContent;
  }

  async updateFooterContent(content: FooterContent): Promise<FooterContent> {
    this.footerContent = content;
    return this.footerContent;
  }

  // Admin dashboard data
  async getAdminDashboardData(): Promise<any> {
    const totalUsers = this.users.size;
    const totalTutors = Array.from(this.users.values()).filter(user => user.role === "tutor").length;
    const totalSessions = this.sessions.size;
    
    // Calculate total revenue from sessions
    const totalRevenue = Array.from(this.sessions.values())
      .filter(session => session.paymentStatus === "paid")
      .reduce((sum, session) => sum + session.amount, 0);
    
    // Count pending applications
    const pendingApplications = Array.from(this.tutorApplications.values())
      .filter(app => app.status === "pending")
      .length;
    
    // For a real app, this would include actual user reports
    const userReports = 0;
    
    // Mock recent activities for demo
    const recentActivities = [
      { id: 1, type: "user_registration", user: "Kofi Mensah", timestamp: "2023-07-20T10:30:00Z" },
      { id: 2, type: "tutor_application", user: "Ama Serwaa", timestamp: "2023-07-19T15:45:00Z" },
      { id: 3, type: "session_booking", learner: "Emma Wilson", tutor: "Sam Davis", timestamp: "2023-07-17T14:10:00Z" },
    ];
    
    return {
      totalUsers,
      totalTutors,
      totalSessions,
      totalRevenue,
      pendingApplications,
      userReports,
      recentActivities
    };
  }

  // Helper methods
  private convertUserToTutor(user: User): Tutor {
    // Get reviews for this tutor
    const tutorReviews = Array.from(this.reviews.values())
      .filter(review => review.tutorId === user.id);
    
    // Calculate average rating
    const rating = tutorReviews.length > 0
      ? tutorReviews.reduce((sum, review) => sum + review.rating, 0) / tutorReviews.length
      : 0;
    
    // In a real app, subjects and price would be stored in the user record or a separate tutor profile table
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      department: user.department,
      yearOfStudy: user.yearOfStudy,
      cwa: user.cwa,
      rating: rating || 4.5, // Mock rating for demo
      subjects: ["Calculus", "Linear Algebra"], // Mock subjects for demo
      price: 50, // Mock price for demo
      availability: [], // Mock availability for demo
      reviews: tutorReviews,
      isApproved: user.isApproved
    };
  }

  // SystemConfig operations
  async getSystemConfig(key: string): Promise<SystemConfig | undefined> {
    return this.systemConfigs.get(key);
  }

  async getAllSystemConfigs(): Promise<SystemConfig[]> {
    return Array.from(this.systemConfigs.values());
  }

  async updateSystemConfig(key: string, value: string): Promise<SystemConfig> {
    const existingConfig = this.systemConfigs.get(key);
    
    if (existingConfig) {
      existingConfig.value = value;
      this.systemConfigs.set(key, existingConfig);
      return existingConfig;
    }
    
    // Create new config if it doesn't exist
    const newConfig: SystemConfig = {
      id: this.currentConfigId++,
      key,
      value,
      description: key === 'STRIPE_SECRET_KEY' 
        ? 'Stripe Secret Key for server-side operations' 
        : key === 'STRIPE_PUBLIC_KEY' 
          ? 'Stripe Public Key for client-side operations'
          : undefined
    };
    
    this.systemConfigs.set(key, newConfig);
    return newConfig;
  }
}

export const storage = new MemStorage();
