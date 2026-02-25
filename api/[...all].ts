import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import { createServer } from "http";
import { registerRoutes } from "../server/routes";

let cachedApp: express.Express | null = null;

async function getApp() {
  if (cachedApp) return cachedApp;

  const app = express();
  const httpServer = createServer(app);

  // mounts your existing routes (including /api/auth/*)
  await registerRoutes(httpServer, app);

  cachedApp = app;
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await getApp();
  app(req as any, res as any);
}
