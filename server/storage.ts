import { users, journalEntries, type User, type InsertUser, type JournalEntry, type InsertJournalEntry } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllEntries(): Promise<JournalEntry[]>;
  getEntryById(id: string): Promise<JournalEntry | undefined>;
  getEntryByDate(date: string): Promise<JournalEntry | undefined>;
  createEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateEntry(id: string, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined>;
  deleteEntry(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllEntries(): Promise<JournalEntry[]> {
    return await db.select().from(journalEntries).orderBy(desc(journalEntries.date));
  }

  async getEntryById(id: string): Promise<JournalEntry | undefined> {
    const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
    return entry || undefined;
  }

  async getEntryByDate(date: string): Promise<JournalEntry | undefined> {
    const datePrefix = date.split("T")[0];
    const entries = await db.select().from(journalEntries);
    return entries.find((entry) => entry.date.startsWith(datePrefix));
  }

  async createEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const [entry] = await db.insert(journalEntries).values(insertEntry).returning();
    return entry;
  }

  async updateEntry(id: string, updates: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const [entry] = await db
      .update(journalEntries)
      .set(updates)
      .where(eq(journalEntries.id, id))
      .returning();
    return entry || undefined;
  }

  async deleteEntry(id: string): Promise<boolean> {
    const result = await db.delete(journalEntries).where(eq(journalEntries.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
