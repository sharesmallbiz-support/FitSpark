import initSqlJs, { Database as SqlJsDatabase } from "sql.js";
import { drizzle } from "drizzle-orm/sql-js";
import * as schema from "@shared/schema";
import fs from "fs";
import path from "path";

// ESM-compatible __dirname
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const dbFilePath = path.resolve(__dirname, "../data/database.db");

async function loadDatabase(): Promise<SqlJsDatabase> {
  const SQL = await initSqlJs();
  let db: SqlJsDatabase;
  if (fs.existsSync(dbFilePath)) {
    const fileBuffer = fs.readFileSync(dbFilePath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }
  return db;
}

// Export a db object for compatibility with code expecting a direct db export
let db: ReturnType<typeof drizzle> | undefined;
export const dbPromise = loadDatabase().then((sqlite) => {
  db = drizzle(sqlite, { schema });
  return db;
});
export { db };

export async function saveDatabase(sqlite: SqlJsDatabase) {
  const data = sqlite.export();
  // Buffer.from is available in Node.js, but if not, use Uint8Array directly
  fs.writeFileSync(
    dbFilePath,
    Buffer.from ? Buffer.from(data) : new Uint8Array(data)
  );
}
