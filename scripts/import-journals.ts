import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq } from "drizzle-orm";
import { users, journalEntries } from "../shared/schema";
import * as fs from "fs";
import * as path from "path";

const { Pool } = pg;

const RENDER_DATABASE_URL = process.env.RENDER_DATABASE_URL;
const TARGET_USERNAME = "Rish05";

if (!RENDER_DATABASE_URL) {
  console.error("RENDER_DATABASE_URL environment variable is required");
  process.exit(1);
}

interface JournalRow {
  date: string;
  journal: string;
  gymNotes?: string;
}

function parseDate(dateStr: string): string | null {
  if (!dateStr || dateStr.trim() === "") return null;
  
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;
  
  const month = parts[0].padStart(2, "0");
  const day = parts[1].padStart(2, "0");
  const year = parts[2];
  
  return `${year}-${month}-${day}`;
}

function parseCSV(content: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        currentRow.push(currentCell.trim());
        currentCell = "";
      } else if (char === "\n" || (char === "\r" && nextChar === "\n")) {
        currentRow.push(currentCell.trim());
        if (currentRow.some(cell => cell !== "")) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = "";
        if (char === "\r") i++;
      } else if (char !== "\r") {
        currentCell += char;
      }
    }
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(cell => cell !== "")) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function extractJournalEntries(filePath: string): JournalRow[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const rows = parseCSV(content);
  const entries: JournalRow[] = [];

  if (rows.length === 0) return entries;

  const header = rows[0].map(h => h.toLowerCase());
  const dateIndex = header.findIndex(h => h === "date");
  const journalIndex = header.findIndex(h => h === "journal" || h === "activity");
  const gymIndex = header.findIndex(h => h.includes("physical") || h.includes("gym"));

  if (dateIndex === -1 || journalIndex === -1) {
    console.log(`  Could not find date/journal columns in ${filePath}`);
    console.log(`  Header: ${header.join(", ")}`);
    return entries;
  }

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const dateStr = row[dateIndex];
    const journal = row[journalIndex];
    const gymNotes = gymIndex !== -1 ? row[gymIndex] : undefined;

    if (!dateStr || !journal || journal.trim() === "") continue;

    const formattedDate = parseDate(dateStr);
    if (!formattedDate) continue;

    let cleanJournal = journal.trim();
    if (cleanJournal.startsWith("$")) {
      cleanJournal = cleanJournal.substring(1);
    }

    entries.push({
      date: formattedDate,
      journal: cleanJournal,
      gymNotes: gymNotes && gymNotes.trim() !== "" ? gymNotes.trim() : undefined,
    });
  }

  return entries;
}

async function main() {
  console.log("Starting journal import to Render database...");
  console.log(`Target user: ${TARGET_USERNAME}`);

  const pool = new Pool({
    connectionString: RENDER_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const db = drizzle(pool);

  try {
    const [user] = await db.select().from(users).where(eq(users.username, TARGET_USERNAME));

    if (!user) {
      console.error(`User "${TARGET_USERNAME}" not found in the database!`);
      process.exit(1);
    }

    console.log(`Found user: ${user.username} (ID: ${user.id})`);

    const csvFiles = [
      "attached_assets/2024_Few_Days_1767613590158.csv",
      "attached_assets/Nov_2024_-_Dec_2025_1767613590159.csv",
      "attached_assets/Journal_2022_1767613590160.csv",
    ];

    const allEntries: JournalRow[] = [];

    for (const csvFile of csvFiles) {
      const fullPath = path.resolve(csvFile);
      if (!fs.existsSync(fullPath)) {
        console.log(`  File not found: ${csvFile}`);
        continue;
      }
      console.log(`\nProcessing: ${csvFile}`);
      const entries = extractJournalEntries(fullPath);
      console.log(`  Found ${entries.length} journal entries`);
      allEntries.push(...entries);
    }

    console.log(`\nTotal entries to import: ${allEntries.length}`);

    const existingEntries = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, user.id));

    const existingDates = new Map(existingEntries.map(e => [e.date.split("T")[0], e]));
    console.log(`Existing entries for user: ${existingEntries.length}`);

    const toCreate: { userId: string; date: string; reflection: string; gymNotes?: string }[] = [];
    const toUpdate: { id: string; reflection: string; gymNotes?: string }[] = [];
    let skipped = 0;

    for (const entry of allEntries) {
      const existingEntry = existingDates.get(entry.date);

      if (existingEntry) {
        if (existingEntry.reflection && existingEntry.reflection.trim() !== "") {
          skipped++;
          continue;
        }
        toUpdate.push({
          id: existingEntry.id,
          reflection: entry.journal,
          gymNotes: entry.gymNotes || existingEntry.gymNotes || undefined,
        });
      } else {
        toCreate.push({
          userId: user.id,
          date: entry.date,
          reflection: entry.journal,
          gymNotes: entry.gymNotes,
        });
      }
    }

    console.log(`\nEntries to create: ${toCreate.length}`);
    console.log(`Entries to update: ${toUpdate.length}`);
    console.log(`Entries to skip: ${skipped}`);

    if (toCreate.length > 0) {
      console.log("\nInserting new entries in batches...");
      const batchSize = 50;
      for (let i = 0; i < toCreate.length; i += batchSize) {
        const batch = toCreate.slice(i, i + batchSize);
        await db.insert(journalEntries).values(batch);
        console.log(`  Inserted ${Math.min(i + batchSize, toCreate.length)} / ${toCreate.length}`);
      }
    }

    if (toUpdate.length > 0) {
      console.log("\nUpdating existing entries...");
      for (const update of toUpdate) {
        await db
          .update(journalEntries)
          .set({ reflection: update.reflection, gymNotes: update.gymNotes })
          .where(eq(journalEntries.id, update.id));
      }
      console.log(`  Updated ${toUpdate.length} entries`);
    }

    console.log(`\nImport complete!`);
    console.log(`  Created: ${toCreate.length}`);
    console.log(`  Updated: ${toUpdate.length}`);
    console.log(`  Skipped (already has reflection): ${skipped}`);
  } catch (error) {
    console.error("Error during import:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
