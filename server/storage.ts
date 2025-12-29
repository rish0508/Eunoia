import { type User, type InsertUser, type JournalEntry, type InsertJournalEntry } from "@shared/schema";
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private entries: Map<string, JournalEntry>;

  constructor() {
    this.users = new Map();
    this.entries = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllEntries(): Promise<JournalEntry[]> {
    return Array.from(this.entries.values()).sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  async getEntryById(id: string): Promise<JournalEntry | undefined> {
    return this.entries.get(id);
  }

  async getEntryByDate(date: string): Promise<JournalEntry | undefined> {
    const datePrefix = date.split("T")[0];
    return Array.from(this.entries.values()).find((entry) =>
      entry.date.startsWith(datePrefix)
    );
  }

  async createEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const id = randomUUID();
    const entry: JournalEntry = {
      id,
      date: insertEntry.date,
      reflection: insertEntry.reflection ?? null,
      gymStatus: insertEntry.gymStatus ?? null,
      gymNotes: insertEntry.gymNotes ?? null,
      food: insertEntry.food ?? null,
      mood: insertEntry.mood ?? null,
      targetMet: insertEntry.targetMet ?? false,
      images: insertEntry.images ?? null,
      createdAt: new Date(),
    };
    this.entries.set(id, entry);
    return entry;
  }

  async updateEntry(id: string, updates: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const existing = this.entries.get(id);
    if (!existing) return undefined;

    const updated: JournalEntry = {
      ...existing,
      date: updates.date ?? existing.date,
      reflection: updates.reflection !== undefined ? updates.reflection : existing.reflection,
      gymStatus: updates.gymStatus !== undefined ? updates.gymStatus : existing.gymStatus,
      gymNotes: updates.gymNotes !== undefined ? updates.gymNotes : existing.gymNotes,
      food: updates.food !== undefined ? updates.food : existing.food,
      mood: updates.mood !== undefined ? updates.mood : existing.mood,
      targetMet: updates.targetMet !== undefined ? updates.targetMet : existing.targetMet,
      images: updates.images !== undefined ? updates.images : existing.images,
    };
    this.entries.set(id, updated);
    return updated;
  }

  async deleteEntry(id: string): Promise<boolean> {
    return this.entries.delete(id);
  }
}

export const storage = new MemStorage();
