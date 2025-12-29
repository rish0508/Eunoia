import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(),
  reflection: text("reflection"),
  gymStatus: text("gym_status"),
  gymNotes: text("gym_notes"),
  food: text("food"),
  mood: text("mood"),
  targetMet: boolean("target_met").default(false),
  images: text("images").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
});

export const entryFormSchema = z.object({
  reflection: z.string().optional().default(""),
  gymStatus: z.string().optional().default(""),
  gymNotes: z.string().optional().default(""),
  food: z.string().optional().default(""),
  mood: z.string().optional().default(""),
  targetMet: z.boolean().default(false),
});

export type EntryFormValues = z.infer<typeof entryFormSchema>;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;

export const gymStatusOptions = ["worked_out", "rest_day", "skipped"] as const;
export type GymStatus = typeof gymStatusOptions[number];

export const moodOptions = ["great", "good", "okay", "low", "rough"] as const;
export type Mood = typeof moodOptions[number];
