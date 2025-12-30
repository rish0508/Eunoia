import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { Pool } from "pg";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// ---------- DB (Postgres) ----------
const DATABASE_URL = process.env.DATABASE_URL;
const pool =
  DATABASE_URL && DATABASE_URL.length > 0
    ? new Pool({
        connectionString: DATABASE_URL,
        // Render Postgres typically requires SSL
        ssl: { rejectUnauthorized: false },
      })
    : null;

// ---------- Body parsing ----------
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// ---------- Request logging for /api ----------
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson as any;
    return originalResJson.apply(res, [bodyJson, ...args] as any);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });

  next();
});

// ---------- Hard API routes (for testing) ----------
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || "unknown" });
});

app.get("/api/db-test", async (_req, res) => {
  try {
    if (!pool) {
      return res.status(500).json({
        ok: false,
        error: "DATABASE_URL is missing on Render Environment",
      });
    }

    const r1 = await pool.query("select 1 as ok");
    const tables = await pool.query(
      `select tablename
       from pg_catalog.pg_tables
       where schemaname='public'
       order by tablename;`,
    );

    return res.json({
      ok: true,
      ping: r1.rows?.[0],
      tables: tables.rows.map((t) => t.tablename),
    });
  } catch (e: any) {
    return res.status(500).json({
      ok: false,
      error: e?.message || String(e),
    });
  }
});

app.get("/api/schema/users", async (_req, res) => {
  try {
    if (!pool) {
      return res.status(500).json({
        ok: false,
        error: "DATABASE_URL is missing on Render Environment",
      });
    }

    const cols = await pool.query(
      `select column_name, data_type, is_nullable
       from information_schema.columns
       where table_schema='public' and table_name='users'
       order by ordinal_position;`,
    );

    return res.json({ ok: true, columns: cols.rows });
  } catch (e: any) {
    return res.status(500).json({
      ok: false,
      error: e?.message || String(e),
    });
  }
});

// ---------- Main boot ----------
(async () => {
  // Your app’s routes (auth, journals, etc.)
  await registerRoutes(httpServer, app);

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Static only in production (after API routes)
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
