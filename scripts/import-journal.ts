import { db } from "../server/db";
import { journalEntries, users } from "../shared/schema";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

interface ParsedEntry {
  date: string; // ISO format yyyy-MM-dd
  reflection: string;
  gymNotes: string | null;
  gymStatus: "worked_out" | "skipped" | "rest_day" | null;
}

function parseDate(dateStr: string): string | null {
  // Handle MM/DD/YYYY format
  const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, month, day, year] = match;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return null;
}

function detectGymActivity(text: string): { gymStatus: "worked_out" | "rest_day" | null; gymNotes: string | null } {
  const lowerText = text.toLowerCase();
  const gymKeywords = ["gym", "gymmed", "workout", "worked out", "chest", "back", "legs", "shoulders", "arms", "biceps", "triceps", "abs", "cardio", "swimming", "swam", "swim", "badminton", "boxing", "volleyball", "basketball", "cricket", "football", "jogged", "jog", "run", "ran"];
  
  for (const keyword of gymKeywords) {
    if (lowerText.includes(keyword)) {
      return { gymStatus: "worked_out", gymNotes: null };
    }
  }
  // Return null (unknown) rather than assuming skipped
  return { gymStatus: null, gymNotes: null };
}

function parseCSV(content: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = "";
    } else if ((char === "\n" || (char === "\r" && nextChar === "\n")) && !inQuotes) {
      currentRow.push(currentCell.trim());
      if (currentRow.some(cell => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = "";
      if (char === "\r") i++;
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(cell => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function parseJournal2022(filePath: string): ParsedEntry[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const rows = parseCSV(content);
  const entries: ParsedEntry[] = [];

  // Format: Day, Date, Activity
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 3) continue;

    const [, dateStr, activity] = row;
    if (!dateStr || !activity) continue;

    const date = parseDate(dateStr);
    if (!date) continue;

    const { gymStatus } = detectGymActivity(activity);

    entries.push({
      date,
      reflection: activity,
      gymNotes: null,
      gymStatus,
    });
  }

  return entries;
}

function parse2024FewDays(filePath: string): ParsedEntry[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const rows = parseCSV(content);
  const entries: ParsedEntry[] = [];

  // Format: Day, Date, Journal
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 3) continue;

    const [, dateStr, journal] = row;
    if (!dateStr || !journal) continue;

    const date = parseDate(dateStr);
    if (!date) continue;

    const { gymStatus } = detectGymActivity(journal);

    entries.push({
      date,
      reflection: journal,
      gymNotes: null,
      gymStatus,
    });
  }

  return entries;
}

function parseNov2024Dec2025(filePath: string): ParsedEntry[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const rows = parseCSV(content);
  const entries: ParsedEntry[] = [];

  // Format: Physical Activity, Day, Date, Journal
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 4) continue;

    const [physicalActivity, , dateStr, journal] = row;
    if (!dateStr) continue;

    const date = parseDate(dateStr);
    if (!date) continue;

    // Skip if no journal and no activity
    if (!journal && !physicalActivity) continue;

    let gymStatus: "worked_out" | "skipped" | null = null;
    let gymNotes: string | null = null;

    if (physicalActivity && physicalActivity.trim().length > 0) {
      gymStatus = "worked_out";
      gymNotes = physicalActivity.trim();
    } else if (journal) {
      const detected = detectGymActivity(journal);
      gymStatus = detected.gymStatus;
    }

    entries.push({
      date,
      reflection: journal || "",
      gymNotes,
      gymStatus,
    });
  }

  return entries;
}

function parseWhatsAppChat(filePath: string): ParsedEntry[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const entries: ParsedEntry[] = [];

  // Pattern: DD/MM/YYYY, HH:MM - Rishabh: Day X...
  const messagePattern = /^(\d{2})\/(\d{2})\/(\d{4}), \d{2}:\d{2} - Rishabh: (.+)$/;
  
  let currentDate: string | null = null;
  let currentReflection = "";
  let isCollecting = false;

  for (const line of lines) {
    const match = line.match(messagePattern);
    
    if (match) {
      // Save previous entry if exists
      if (currentDate && currentReflection && isCollecting) {
        const { gymStatus } = detectGymActivity(currentReflection);
        entries.push({
          date: currentDate,
          reflection: currentReflection.trim(),
          gymNotes: null,
          gymStatus,
        });
      }

      const [, day, month, year, messageStart] = match;
      currentDate = `${year}-${month}-${day}`;
      
      // Check if this is a Day entry
      if (messageStart.toLowerCase().startsWith("day ")) {
        currentReflection = messageStart;
        isCollecting = true;
      } else {
        isCollecting = false;
        currentReflection = "";
      }
    } else if (isCollecting && !line.match(/^\d{2}\/\d{2}\/\d{4}/)) {
      // Continue collecting multiline message
      currentReflection += "\n" + line;
    }
  }

  // Save last entry
  if (currentDate && currentReflection && isCollecting) {
    const { gymStatus } = detectGymActivity(currentReflection);
    entries.push({
      date: currentDate,
      reflection: currentReflection.trim(),
      gymNotes: null,
      gymStatus,
    });
  }

  return entries;
}

async function importEntries() {
  console.log("Starting journal import...");

  // Find user Rish05
  const [user] = await db.select().from(users).where(eq(users.username, "Rish05"));
  if (!user) {
    console.error("User Rish05 not found! Please create the account first.");
    process.exit(1);
  }

  console.log(`Found user: ${user.username} (ID: ${user.id})`);

  const allEntries: ParsedEntry[] = [];

  // Parse all files
  const assetsDir = path.join(process.cwd(), "attached_assets");

  // 1. Journal 2022
  const journal2022Path = path.join(assetsDir, "Journal_2022_1767254707467.csv");
  if (fs.existsSync(journal2022Path)) {
    const entries = parseJournal2022(journal2022Path);
    console.log(`Parsed ${entries.length} entries from Journal 2022`);
    allEntries.push(...entries);
  }

  // 2. 2024 Few Days
  const fewDays2024Path = path.join(assetsDir, "2024_Few_Days_1767254707463.csv");
  if (fs.existsSync(fewDays2024Path)) {
    const entries = parse2024FewDays(fewDays2024Path);
    console.log(`Parsed ${entries.length} entries from 2024 Few Days`);
    allEntries.push(...entries);
  }

  // 3. Nov 2024 - Dec 2025
  const nov2024Path = path.join(assetsDir, "Nov_2024_-_Dec_2025_1767254707465.csv");
  if (fs.existsSync(nov2024Path)) {
    const entries = parseNov2024Dec2025(nov2024Path);
    console.log(`Parsed ${entries.length} entries from Nov 2024 - Dec 2025`);
    allEntries.push(...entries);
  }

  // 4. WhatsApp Chat
  const whatsappPath = path.join(assetsDir, "WhatsApp_Chat_with_225_days_1767255444650.txt");
  if (fs.existsSync(whatsappPath)) {
    const entries = parseWhatsAppChat(whatsappPath);
    console.log(`Parsed ${entries.length} entries from WhatsApp Chat`);
    allEntries.push(...entries);
  }

  console.log(`\nTotal entries to import: ${allEntries.length}`);

  // Deduplicate by date (keep the most recent/detailed one)
  const entryMap = new Map<string, ParsedEntry>();
  for (const entry of allEntries) {
    const existing = entryMap.get(entry.date);
    if (!existing || entry.reflection.length > existing.reflection.length) {
      entryMap.set(entry.date, entry);
    }
  }

  const uniqueEntries = Array.from(entryMap.values());
  console.log(`Unique entries after deduplication: ${uniqueEntries.length}`);

  // Get existing entries for this user
  const existingEntries = await db.select().from(journalEntries).where(eq(journalEntries.userId, user.id));
  const existingDates = new Set(existingEntries.map(e => e.date.split("T")[0]));

  console.log(`Existing entries in database: ${existingEntries.length}`);

  // Insert new entries
  let insertedCount = 0;
  let skippedCount = 0;

  for (const entry of uniqueEntries) {
    if (existingDates.has(entry.date)) {
      skippedCount++;
      continue;
    }

    try {
      await db.insert(journalEntries).values({
        userId: user.id,
        date: `${entry.date}T12:00:00`,
        reflection: entry.reflection || null,
        gymStatus: entry.gymStatus,
        gymNotes: entry.gymNotes,
        targetPlan: null,
        food: null,
        mood: null,
        targetMet: false,
        images: null,
        videos: null,
      });
      insertedCount++;
    } catch (err) {
      console.error(`Failed to insert entry for ${entry.date}:`, err);
    }
  }

  console.log(`\nImport complete!`);
  console.log(`- Inserted: ${insertedCount} entries`);
  console.log(`- Skipped (already exist): ${skippedCount} entries`);
}

importEntries()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Import failed:", err);
    process.exit(1);
  });
