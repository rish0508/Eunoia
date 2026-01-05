import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const IMPORT_DIR = path.join(process.cwd(), "server/import_data");

async function importCSV(filePath: string) {
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
              (date, reflection, food, workout, mood)
              VALUES ($1, $2, $3, $4, $5)
              `,
              [
                row.date || null,
                row.reflection || row.entry || null,
                row.food || null,
                row.workout || null,
                row.mood || null,
              ],
            );
          }
          console.log(`Imported ${rows.length} rows from ${filePath}`);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
  });
}

async function run() {
  const files = fs.readdirSync(IMPORT_DIR).filter((f) => f.endsWith(".csv"));

  for (const file of files) {
    const fullPath = path.join(IMPORT_DIR, file);
    await importCSV(fullPath);
  }

  console.log("✅ ALL CSV FILES IMPORTED");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
