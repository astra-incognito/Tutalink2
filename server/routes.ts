import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertBookingSchema, insertReviewSchema, UserRole } from "@shared/schema";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication with passport
  setupAuth(app);
  
  // API routes
  app.post("/api/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username exists
      const existingUserByUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email exists
      const existingUserByEmail = await storage.getUserByEmail(validatedData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const newUser = await storage.createUser(validatedData);
      res.status(201).json({ 
        user: { 
          ...newUser, 
          password: undefined 
        }, 
        message: "User created. Awaiting admin approval." 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  
   // Admin routes
  app.get("/api/admin/pending-users", async (req, res) => {
    try {
      const pendingUsers = await storage.getPendingUsers();
      res.status(200).json(pendingUsers.map(user => ({ ...user, password: undefined })));
    } catch (error) {
      res.status(500).json({ message: "Failed to get pending users" });
    }
  });
  
  app.patch("/api/admin/approve-user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(userId, { isActive: true });
      res.status(200).json({ 
        user: { 
          ...updatedUser, 
          password: undefined 
        }, 
        message: "User approved" 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to approve user" });
    }
  });
  
  app.delete("/api/admin/reject-user/:id", async (req, res) => {
    try {
      // In a real implementation, we would delete the user from the database
      // For now, we'll just set isActive to false to simulate rejection
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // We're just setting isActive to false as a way to simulate rejection
      // In a real app, we might delete the user or have a separate status field
      await storage.updateUser(userId, { isActive: false });
      res.status(200).json({ message: "User rejected" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reject user" });
    }
  });
  
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.status(200).json(users.map(user => ({ ...user, password: undefined })));
    } catch (error) {
      res.status(500).json({ message: "Failed to get users" });
    }
  });
  
  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Prevent deleting self (admin)
      if (req.user.id === userId) {
        return res.status(400).json({ message: "You cannot delete your own account." });
      }
      await storage.deleteUser(userId);
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  
  // User routes
  app.patch("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Only allow the user themselves or an admin to update
      if (!req.isAuthenticated() || (req.user.id !== userId && req.user.role !== "admin")) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      // Don't allow updating password here (use change-password endpoint)
      const { password, ...updateData } = req.body;
      
      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({ ...updatedUser, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // Password change route
  app.post("/api/users/:id/change-password", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Only allow the user themselves or an admin to change the password
      if (!req.isAuthenticated() || (req.user.id !== userId && req.user.role !== "admin")) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const { newPassword } = req.body;
      if (!newPassword) {
        return res.status(400).json({ message: "New password is required" });
      }
      
      const updatedUser = await storage.updateUser(userId, { password: newPassword });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update password" });
    }
  });
  
  // Course routes
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.status(200).json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to get courses" });
    }
  });
  
  // Tutor routes
  app.get("/api/tutors", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const tutors = users.filter(user => user.role === UserRole.TUTOR && user.isActive);
      
      // For each tutor, get their courses and reviews
      const tutorsWithDetails = await Promise.all(tutors.map(async tutor => {
        const tutorCourses = await storage.getTutorCourses(tutor.id);
        const reviews = await storage.getReviewsByTutor(tutor.id);
        
        // Calculate average rating
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
        
        // Get course details for each tutor course
        const courseDetails = await Promise.all(
          tutorCourses.map(async tc => {
            const course = await storage.getCourse(tc.courseId);
            return course;
          })
        );
        
        // Filter out undefined courses
        const validCourses = courseDetails.filter(course => course !== undefined) as any[];
        
        return {
          ...tutor,
          password: undefined,
          courses: validCourses,
          reviewCount: reviews.length,
          averageRating
        };
      }));
      
      res.status(200).json(tutorsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to get tutors" });
    }
  });
  
  app.get("/api/tutors/search", async (req, res) => {
    try {
      const { query, courseId, department, minRating } = req.query;
      
      let tutors: any[] = [];
      
      if (query && typeof query === 'string') {
        tutors = await storage.searchTutors(query);
      } else if (courseId && typeof courseId === 'string') {
        const courseIdNum = parseInt(courseId);
        if (!isNaN(courseIdNum)) {
          tutors = await storage.filterTutorsByCourse(courseIdNum);
        }
      } else if (department && typeof department === 'string') {
        tutors = await storage.filterTutorsByDepartment(department);
      } else if (minRating && typeof minRating === 'string') {
        const minRatingNum = parseFloat(minRating);
        if (!isNaN(minRatingNum)) {
          tutors = await storage.filterTutorsByRating(minRatingNum);
        }
      } else {
        // Get all tutors
        const users = await storage.getAllUsers();
        tutors = users.filter(user => user.role === UserRole.TUTOR && user.isActive);
      }
      
      // Get details for each tutor
      const tutorsWithDetails = await Promise.all(tutors.map(async tutor => {
        const tutorCourses = await storage.getTutorCourses(tutor.id);
        const reviews = await storage.getReviewsByTutor(tutor.id);
        
        // Calculate average rating
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
        
        // Get course details for each tutor course
        const courseDetails = await Promise.all(
          tutorCourses.map(async tc => {
            const course = await storage.getCourse(tc.courseId);
            return course;
          })
        );
        
        // Filter out undefined courses
        const validCourses = courseDetails.filter(course => course !== undefined) as any[];
        
        return {
          ...tutor,
          password: undefined,
          courses: validCourses,
          reviewCount: reviews.length,
          averageRating
        };
      }));
      
      res.status(200).json(tutorsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to search tutors" });
    }
  });
  
  app.get("/api/tutors/:id", async (req, res) => {
    try {
      const tutorId = parseInt(req.params.id);
      if (isNaN(tutorId)) {
        return res.status(400).json({ message: "Invalid tutor ID" });
      }
      
      const tutor = await storage.getUser(tutorId);
      if (!tutor || tutor.role !== UserRole.TUTOR || !tutor.isActive) {
        return res.status(404).json({ message: "Tutor not found" });
      }
      
      const tutorCourses = await storage.getTutorCourses(tutorId);
      const reviews = await storage.getReviewsByTutor(tutorId);
      const availability = await storage.getTutorAvailability(tutorId);
      
      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
      
      // Get course details for each tutor course
      const courseDetails = await Promise.all(
        tutorCourses.map(async tc => {
          const course = await storage.getCourse(tc.courseId);
          return course;
        })
      );
      
      // Filter out undefined courses
      const validCourses = courseDetails.filter(course => course !== undefined) as any[];
      
      // Get details for each review
      const reviewsWithDetails = await Promise.all(
        reviews.map(async review => {
          const learner = await storage.getUser(review.learnerId);
          return {
            ...review,
            learner: learner ? {
              id: learner.id,
              fullName: learner.fullName,
              profilePicture: learner.profilePicture
            } : null
          };
        })
      );
      
      res.status(200).json({
        ...tutor,
        password: undefined,
        courses: validCourses,
        reviews: reviewsWithDetails,
        availability,
        reviewCount: reviews.length,
        averageRating
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get tutor details" });
    }
  });
  
  // Booking routes
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      
      // Verify that the learner exists
      const learner = await storage.getUser(validatedData.learnerId);
      if (!learner || learner.role !== UserRole.LEARNER || !learner.isActive) {
        return res.status(400).json({ message: "Invalid learner" });
      }
      
      // Verify that the tutor exists
      const tutor = await storage.getUser(validatedData.tutorId);
      if (!tutor || tutor.role !== UserRole.TUTOR || !tutor.isActive) {
        return res.status(400).json({ message: "Invalid tutor" });
      }
      
      // Verify that the course exists
      const course = await storage.getCourse(validatedData.courseId);
      if (!course) {
        return res.status(400).json({ message: "Invalid course" });
      }
      
      const booking = await storage.createBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });
  
  app.get("/api/bookings/learner/:id", async (req, res) => {
    try {
      const learnerId = parseInt(req.params.id);
      if (isNaN(learnerId)) {
        return res.status(400).json({ message: "Invalid learner ID" });
      }
      
      const bookings = await storage.getBookingsByLearner(learnerId);
      
      // Get additional details for each booking
      const bookingsWithDetails = await Promise.all(
        bookings.map(async booking => {
          const tutor = await storage.getUser(booking.tutorId);
          const course = await storage.getCourse(booking.courseId);
          
          return {
            ...booking,
            tutor: tutor ? {
              id: tutor.id,
              fullName: tutor.fullName,
              profilePicture: tutor.profilePicture
            } : null,
            course: course || null
          };
        })
      );
      
      res.status(200).json(bookingsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to get learner bookings" });
    }
  });
  
  app.get("/api/bookings/tutor/:id", async (req, res) => {
    try {
      const tutorId = parseInt(req.params.id);
      if (isNaN(tutorId)) {
        return res.status(400).json({ message: "Invalid tutor ID" });
      }
      
      const bookings = await storage.getBookingsByTutor(tutorId);
      
      // Get additional details for each booking
      const bookingsWithDetails = await Promise.all(
        bookings.map(async booking => {
          const learner = await storage.getUser(booking.learnerId);
          const course = await storage.getCourse(booking.courseId);
          
          return {
            ...booking,
            learner: learner ? {
              id: learner.id,
              fullName: learner.fullName,
              profilePicture: learner.profilePicture
            } : null,
            course: course || null
          };
        })
      );
      
      res.status(200).json(bookingsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to get tutor bookings" });
    }
  });
  
  app.patch("/api/bookings/:id/status", async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      if (isNaN(bookingId)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }
      
      const { status } = req.body;
      if (!status || !["pending", "accepted", "rejected", "completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const updatedBooking = await storage.updateBookingStatus(bookingId, status);
      res.status(200).json(updatedBooking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });
  
  // Review routes
  app.post("/api/reviews", async (req, res) => {
    try {
      const validatedData = insertReviewSchema.parse(req.body);
      
      // Verify that the booking exists and is completed
      const booking = await storage.getBooking(validatedData.bookingId);
      if (!booking || booking.status !== "completed") {
        return res.status(400).json({ message: "Invalid or incomplete booking" });
      }
      
      // Verify that the learner and tutor match the booking
      if (booking.learnerId !== validatedData.learnerId || booking.tutorId !== validatedData.tutorId) {
        return res.status(400).json({ message: "Learner or tutor doesn't match booking" });
      }
      
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });
  
  app.get("/api/reviews/tutor/:id", async (req, res) => {
    try {
      const tutorId = parseInt(req.params.id);
      if (isNaN(tutorId)) {
        return res.status(400).json({ message: "Invalid tutor ID" });
      }
      
      const reviews = await storage.getReviewsByTutor(tutorId);
      
      // Get learner details for each review
      const reviewsWithDetails = await Promise.all(
        reviews.map(async review => {
          const learner = await storage.getUser(review.learnerId);
          return {
            ...review,
            learner: learner ? {
              id: learner.id,
              fullName: learner.fullName,
              profilePicture: learner.profilePicture
            } : null
          };
        })
      );
      
      res.status(200).json(reviewsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to get tutor reviews" });
    }
  });
  
  // Notification routes
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const notifications = await storage.getUserNotifications(userId);
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to get notifications" });
    }
  });
  
  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      if (isNaN(notificationId)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }
      
      const success = await storage.markNotificationAsRead(notificationId);
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
