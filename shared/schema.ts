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
  userId: varchar("user_id").notNull().references(() => users.id),
  date: text("date").notNull(),
  targetPlan: text("target_plan"),
  reflection: text("reflection"),
  gymStatus: text("gym_status"),
  gymNotes: text("gym_notes"),
  food: text("food"),
  mood: text("mood"),
  targetMet: boolean("target_met").default(false),
  images: text("images").array(),
  videos: text("videos").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
});

export const clientEntrySchema = insertJournalEntrySchema.omit({
  userId: true,
});

export const entryFormSchema = z.object({
  targetPlan: z.string().optional().default(""),
  reflection: z.string().optional().default(""),
  gymStatus: z.string().optional().default(""),
  gymNotes: z.string().optional().default(""),
  food: z.string().optional().default(""),
  mood: z.string().optional().default(""),
  targetMet: z.boolean().default(false),
});

export type EntryFormValues = z.infer<typeof entryFormSchema>;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type ClientEntryData = z.infer<typeof clientEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;

export const gymStatusOptions = ["worked_out", "rest_day", "skipped"] as const;
export type GymStatus = typeof gymStatusOptions[number];

export const moodOptions = ["great", "good", "okay", "low", "rough"] as const;
export type Mood = typeof moodOptions[number];

export const dailyQuotes = [
  "The only way to do great work is to love what you do.",
  "Every moment is a fresh beginning.",
  "Your limitation - it's only your imagination.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Success doesn't just find you. You have to go out and get it.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Dream bigger. Do bigger.",
  "Don't stop when you're tired. Stop when you're done.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Do something today that your future self will thank you for.",
  "Little things make big days.",
  "It's going to be hard, but hard does not mean impossible.",
  "Don't wait for opportunity. Create it.",
  "Sometimes we're tested not to show our weaknesses, but to discover our strengths.",
  "The key to success is to focus on goals, not obstacles.",
  "Dream it. Believe it. Build it.",
  "Your mind is a powerful thing. Fill it with positive thoughts.",
  "Collect moments, not things.",
  "Stay close to what keeps your heart beating.",
  "Be gentle with yourself, you're doing the best you can.",
  "Stars can't shine without darkness.",
  "The moon reminds us that even darkness can hold light.",
  "You are exactly where you need to be.",
  "Trust the timing of your life.",
  "Let your soul glow.",
  "Be the energy you want to attract.",
  "Find peace in the journey.",
  "Your story is still being written.",
  "Breathe deeply and embrace the present moment.",
];
