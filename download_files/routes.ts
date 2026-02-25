import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertJournalEntrySchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import bcrypt from "bcryptjs";
import session from "express-session";
import pgSession from "connect-pg-simple";
import pg from "pg";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

const PgStore = pgSession(session);

// Create a pool for session store
const sessionPool = process.env.DATABASE_URL
  ? new pg.Pool({
      connectionString: process.env.DATABASE_URL.replace(/&channel_binding=require/g, ''),
      ssl: { rejectUnauthorized: false },
    })
  : null;

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Determine if we're in production (Vercel sets NODE_ENV=production)
  const isProduction = process.env.NODE_ENV === "production";

  // Session configuration - use PG store in production, memory in dev
  const sessionConfig: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "eunoia-session-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction, // HTTPS only in production
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: isProduction ? "none" : "lax", // "none" required for cross-site cookies
    },
  };

  // Use PG session store if DATABASE_URL is available
  if (sessionPool) {
    sessionConfig.store = new PgStore({
      pool: sessionPool,
      tableName: "session", // Will auto-create if not exists
      createTableIfMissing: true,
    });
  } else {
    // Fallback to memory store for local development
    const MemoryStore = (await import("memorystore")).default(session);
    sessionConfig.store = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  app.use(session(sessionConfig));

  // Skip object storage routes if not on Replit
  if (process.env.REPL_ID) {
    try {
      registerObjectStorageRoutes(app);
    } catch (e) {
      console.log("Object storage routes not available");
    }
  }

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already taken" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ username, password: hashedPassword });

      req.session.userId = user.id;

      // Explicitly save session before responding
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Failed to create session" });
        }
        res.status(201).json({ id: user.id, username: user.username });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "Failed to register" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = insertUserSchema.parse(req.body);

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      req.session.userId = user.id;

      // Explicitly save session before responding
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Failed to create session" });
        }
        res.json({ id: user.id, username: user.username });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: "User not found" });
    }

    res.json({ id: user.id, username: user.username });
  });

  app.get("/api/entries", requireAuth, async (req, res) => {
    try {
      const entries = await storage.getAllEntriesForUser(req.session.userId!);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch entries" });
    }
  });

  app.get("/api/entries/:id", requireAuth, async (req, res) => {
    try {
      const entry = await storage.getEntryById(req.params.id);
      if (!entry) {
        return res.status(404).json({ error: "Entry not found" });
      }
      if (entry.userId !== req.session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch entry" });
    }
  });

  app.post("/api/entries", requireAuth, async (req, res) => {
    try {
      const validatedData = insertJournalEntrySchema.parse({
        ...req.body,
        userId: req.session.userId,
      });
      const entry = await storage.createEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid entry data", details: error.errors });
      }
      console.error("Create entry error:", error);
      res.status(500).json({ error: "Failed to create entry" });
    }
  });

  app.patch("/api/entries/:id", requireAuth, async (req, res) => {
    try {
      const existingEntry = await storage.getEntryById(req.params.id);
      if (!existingEntry) {
        return res.status(404).json({ error: "Entry not found" });
      }
      if (existingEntry.userId !== req.session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      if ("userId" in req.body) {
        return res.status(400).json({ error: "Cannot modify userId" });
      }

      const updateSchema = insertJournalEntrySchema.omit({ userId: true }).partial();
      const validatedData = updateSchema.parse(req.body);
      
      const entry = await storage.updateEntry(req.params.id, validatedData);
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid entry data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update entry" });
    }
  });

  app.delete("/api/entries/:id", requireAuth, async (req, res) => {
    try {
      const existingEntry = await storage.getEntryById(req.params.id);
      if (!existingEntry) {
        return res.status(404).json({ error: "Entry not found" });
      }
      if (existingEntry.userId !== req.session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      await storage.deleteEntry(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete entry" });
    }
  });

  return httpServer;
}
