import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { TutorApplication } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes and middleware
  setupAuth(app);

  // API routes
  // Get all tutors
  app.get("/api/tutors", async (req, res, next) => {
    try {
      const tutors = await storage.getTutors();
      res.json(tutors);
    } catch (error) {
      next(error);
    }
  });

  // Get recommended tutors
  app.get("/api/tutors/recommended", async (req, res, next) => {
    try {
      const tutors = await storage.getRecommendedTutors();
      res.json(tutors);
    } catch (error) {
      next(error);
    }
  });

  // Get tutor by ID
  app.get("/api/tutors/:id", async (req, res, next) => {
    try {
      const tutorId = parseInt(req.params.id);
      const tutor = await storage.getTutorById(tutorId);
      
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }
      
      res.json(tutor);
    } catch (error) {
      next(error);
    }
  });

  // Book a session with a tutor
  app.post("/api/sessions", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to book a session" });
    }

    try {
      const { tutorId, courseId, date, startTime, endTime, location, notes } = req.body;
      const learnerId = req.user!.id;
      
      // Create a session
      const session = await storage.createSession({
        learnerId,
        tutorId,
        courseId,
        date,
        startTime,
        endTime,
        location,
        status: "pending",
        paymentStatus: "pending",
        amount: 0, // Would be calculated based on duration and tutor's rate
        notes
      });
      
      res.status(201).json(session);
    } catch (error) {
      next(error);
    }
  });

  // Get user's sessions
  app.get("/api/sessions", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      let sessions;
      if (userRole === "learner") {
        sessions = await storage.getLearnerSessions(userId);
      } else if (userRole === "tutor") {
        sessions = await storage.getTutorSessions(userId);
      } else {
        sessions = await storage.getAllSessions(); // Admin can see all sessions
      }
      
      res.json(sessions);
    } catch (error) {
      next(error);
    }
  });

  // Get upcoming sessions
  app.get("/api/sessions/upcoming", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      let sessions;
      if (userRole === "learner") {
        sessions = await storage.getUpcomingLearnerSessions(userId);
      } else if (userRole === "tutor") {
        sessions = await storage.getUpcomingTutorSessions(userId);
      } else {
        sessions = await storage.getAllUpcomingSessions(); // Admin can see all sessions
      }
      
      res.json(sessions);
    } catch (error) {
      next(error);
    }
  });

  // Cancel a session
  app.post("/api/sessions/:id/cancel", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const sessionId = parseInt(req.params.id);
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      // Get the session
      const session = await storage.getSessionById(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Check if user is authorized to cancel the session
      if (userRole !== "admin" && session.learnerId !== userId && session.tutorId !== userId) {
        return res.status(403).json({ message: "Unauthorized to cancel this session" });
      }
      
      // Cancel the session
      const updatedSession = await storage.updateSessionStatus(sessionId, "cancelled");
      res.json(updatedSession);
    } catch (error) {
      next(error);
    }
  });

  // Get user reviews
  app.get("/api/reviews", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      let reviews;
      if (userRole === "learner") {
        reviews = await storage.getLearnerReviews(userId);
      } else if (userRole === "tutor") {
        reviews = await storage.getTutorReviews(userId);
      } else {
        reviews = await storage.getAllReviews(); // Admin can see all reviews
      }
      
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  });

  // Get recent reviews
  app.get("/api/reviews/recent", async (req, res, next) => {
    try {
      const reviews = await storage.getRecentReviews();
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  });

  // Add a review
  app.post("/api/reviews", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { tutorId, rating, comment, courseId } = req.body;
      const learnerId = req.user!.id;
      
      // Create review
      const review = await storage.createReview({
        learnerId,
        tutorId,
        rating,
        comment,
        courseId,
        createdAt: new Date().toISOString()
      });
      
      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  });

  // Get footer content
  app.get("/api/footer-content", async (req, res, next) => {
    try {
      const footerContent = await storage.getFooterContent();
      res.json(footerContent);
    } catch (error) {
      next(error);
    }
  });

  // Admin routes
  // Get dashboard stats
  app.get("/api/admin/dashboard", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const dashboardData = await storage.getAdminDashboardData();
      res.json(dashboardData);
    } catch (error) {
      next(error);
    }
  });

  // Get all users
  app.get("/api/admin/users", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  // Delete a user
  app.delete("/api/admin/users/:id", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const userId = parseInt(req.params.id);
      await storage.deleteUser(userId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // Reset a user's password
  app.post("/api/admin/users/:id/reset-password", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const userId = parseInt(req.params.id);
      // In a real app, this would generate a random password and send it via email
      const tempPassword = "temp" + Math.floor(100000 + Math.random() * 900000);
      
      // Update password
      await storage.resetUserPassword(userId, tempPassword);
      
      res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Get all tutor applications
  app.get("/api/admin/tutor-applications", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const applications = await storage.getAllTutorApplications();
      res.json(applications);
    } catch (error) {
      next(error);
    }
  });

  // Get all tutors for admin
  app.get("/api/admin/tutors", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const tutors = await storage.getAllTutors();
      res.json(tutors);
    } catch (error) {
      next(error);
    }
  });

  // Update footer content
  app.put("/api/admin/footer-content", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const { copyright, links, socialMedia } = req.body;
      const updatedFooter = await storage.updateFooterContent({
        id: 1,
        copyright,
        links,
        socialMedia
      });
      
      res.json(updatedFooter);
    } catch (error) {
      next(error);
    }
  });

  // System Config routes for Stripe API keys
  // Get all system configs
  app.get("/api/admin/system-config", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const configs = await storage.getAllSystemConfigs();
      res.json(configs);
    } catch (error) {
      next(error);
    }
  });

  // Get specific system config
  app.get("/api/admin/system-config/:key", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const key = req.params.key;
      const config = await storage.getSystemConfig(key);
      
      if (!config) {
        return res.status(404).json({ message: "Configuration not found" });
      }
      
      res.json(config);
    } catch (error) {
      next(error);
    }
  });

  // Update system config
  app.put("/api/admin/system-config/:key", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const key = req.params.key;
      const { value } = req.body;
      
      if (!value) {
        return res.status(400).json({ message: "Value is required" });
      }
      
      const config = await storage.updateSystemConfig(key, value);
      res.json(config);
    } catch (error) {
      next(error);
    }
  });

  // Debug endpoints - REMOVE IN PRODUCTION
  app.get("/api/debug/users", (req, res) => {
    const users = storage.getAllUsers().map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      passwordType: typeof user.password,
      passwordLength: user.password ? user.password.length : 0
    }));
    res.json(users);
  });
  
  // Debug endpoint to verify admin user
  app.get("/api/debug/admin", (req, res) => {
    const adminUser = storage.getUserByUsername("admin123");
    if (adminUser) {
      const { password, ...userWithoutPassword } = adminUser;
      res.json({
        user: userWithoutPassword,
        passwordLength: password ? password.length : 0,
        passwordType: typeof password
      });
    } else {
      res.status(404).json({ message: "Admin user not found" });
    }
  });
  
  // Create the HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
