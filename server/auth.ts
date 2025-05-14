import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET || "tutalink_secret_key";
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, email, password, fullName } = req.body;
      
      // Validate required fields
      if (!username || !email || !password || !fullName) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }

      // Create new user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        fullName,
        role: "learner", // Default role is learner
        isApproved: true, // Learners are approved by default
      });

      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Return user without password
    const user = req.user as SelectUser;
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Admin endpoints for user management
  app.patch("/api/admin/users/:id/role", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;

      if (!["learner", "tutor", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const updatedUser = await storage.updateUserRole(userId, role);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/admin/users/:id/approve", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const userId = parseInt(req.params.id);
      const { isApproved } = req.body;

      const updatedUser = await storage.updateUserApproval(userId, isApproved);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });

  // Tutor application endpoint
  app.post("/api/tutor-applications", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = req.user as SelectUser;
      
      // Only learners can apply to become tutors
      if (user.role !== "learner") {
        return res.status(400).json({ message: "Only learners can apply to become tutors" });
      }

      // Parse application data
      let applicationData;
      if (req.is('multipart/form-data')) {
        // Handle multipart form data (with file upload)
        applicationData = JSON.parse(req.body.application);
        // File upload would be handled here
      } else {
        // Handle JSON data
        applicationData = req.body;
      }

      const { department, yearOfStudy, cwa, subjects } = applicationData;

      // Validate CWA requirement
      if (cwa < 3.4) {
        return res.status(400).json({ message: "Minimum CWA of 3.4 is required" });
      }

      // Create tutor application
      const application = await storage.createTutorApplication({
        userId: user.id,
        fullName: user.fullName || user.username,
        department,
        yearOfStudy,
        cwa,
        subjects,
        transcriptPath: "/uploads/transcripts/sample.pdf", // This would be replaced with actual uploaded file path
        status: "pending"
      });

      res.status(201).json(application);
    } catch (error) {
      next(error);
    }
  });

  // Approve tutor application endpoint
  app.post("/api/admin/tutor-applications/:id/approve", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const userId = parseInt(req.params.id);
      
      // Approve application and promote user to tutor
      const application = await storage.approveTutorApplication(userId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Update user role to tutor
      await storage.updateUserRole(userId, "tutor");

      res.json(application);
    } catch (error) {
      next(error);
    }
  });

  // Reject tutor application endpoint
  app.post("/api/admin/tutor-applications/:id/reject", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const userId = parseInt(req.params.id);
      
      // Reject application
      const application = await storage.rejectTutorApplication(userId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      res.json(application);
    } catch (error) {
      next(error);
    }
  });
}
