import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertJournalEntrySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/entries", async (req, res) => {
    try {
      const entries = await storage.getAllEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch entries" });
    }
  });

  app.get("/api/entries/:id", async (req, res) => {
    try {
      const entry = await storage.getEntryById(req.params.id);
      if (!entry) {
        return res.status(404).json({ error: "Entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch entry" });
    }
  });

  app.post("/api/entries", async (req, res) => {
    try {
      const validatedData = insertJournalEntrySchema.parse(req.body);
      const entry = await storage.createEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid entry data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create entry" });
    }
  });

  app.patch("/api/entries/:id", async (req, res) => {
    try {
      const partialSchema = insertJournalEntrySchema.partial();
      const validatedData = partialSchema.parse(req.body);
      const entry = await storage.updateEntry(req.params.id, validatedData);
      if (!entry) {
        return res.status(404).json({ error: "Entry not found" });
      }
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid entry data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update entry" });
    }
  });

  app.delete("/api/entries/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteEntry(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Entry not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete entry" });
    }
  });

  return httpServer;
}
