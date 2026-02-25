import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import { createServer } from "http";
import { registerRoutes } from "../server/routes";

let cachedApp: express.Express | null = null;

async function getApp() {
  if (cachedApp) return cachedApp;

  const app = express();
  const httpServer = createServer(app);

  // Trust proxy for Vercel (required for secure cookies behind proxy)
  app.set("trust proxy", 1);

  // Body parsing middleware - MUST be before routes
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // CORS middleware for cross-origin requests (if any)
  app.use((req, res, next) => {
    const allowedOrigins = [
      "https://eunoia-theta.vercel.app",
      "https://eunoia-git-main-rish0508s-projects.vercel.app",
      "https://eunoia-kwengrcrk-rish0508s-projects.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
    ];

    const origin = req.headers.origin;
    if (origin && allowedOrigins.some((o) => origin.startsWith(o.replace(/\/$/, "")) || o.includes("vercel.app") && origin.includes("vercel.app"))) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With"
    );

    // Handle preflight
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    next();
  });

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, env: process.env.NODE_ENV || "unknown", platform: "vercel" });
  });

  // Your app's routes (auth, journals, etc.)
  await registerRoutes(httpServer, app);

  cachedApp = app;
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await getApp();
  app(req as any, res as any);
}
