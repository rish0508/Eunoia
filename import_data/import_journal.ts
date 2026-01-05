import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// IMPORTANT: correct folder
const IMPORT_DIR = path.join(process.cwd(), "import_data");

// username we are importing for
const USERNAME = "Rish05";

async function getUserId(): Promise<number> {
  const result = await pool.query("SELECT id FROM users WHERE username = $1", [
    USERNAME,
  ]);

  if (result.rows.length === 0) {
    throw new Error(`User ${USERNAME} not found`);
  }

  return result.rows[0].id;
}

async function importCSV(filePath: string, userId: number) {
  return new Promise<void>((resolve, reject) => {
    const rows: any[] = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => rows.push(data))
      .on("end", async () => {
        try {
          for (const row of rows) {
            await pool.query(
              `
              INSERT INTO journal_entries
              (user_id, date, reflection, food, workout, mood)
              VALUES ($1, $2, $3, $4, $5, $6)
              `,
              [
                userId,
                row.date || null,
                row.reflection || row.entry || null,
                row.food || null,
                row.workout || null,
                row.mood || null,
              ],
            );
          }

          console.log(
            `Imported ${rows.length} rows from ${path.basename(filePath)}`,
          );
          resolve();
        } catch (err) {
          reject(err);
        }
      });
  });
}

async function run() {
  const userId = await getUserId();
  console.log(`Importing data for user_id=${userId} (${USERNAME})`);

  const files = fs.readdirSync(IMPORT_DIR).filter((f) => f.endsWith(".csv"));

  for (const file of files) {
    const fullPath = path.join(IMPORT_DIR, file);
    await importCSV(fullPath, userId);
  }

  console.log("✅ ALL CSV FILES IMPORTED FOR Rish05");
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Import failed:", err);
  process.exit(1);
});
