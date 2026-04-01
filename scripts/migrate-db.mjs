import { createConnection } from 'mysql2/promise';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const url = new URL(dbUrl);
  const connection = await createConnection({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: true },
  });

  try {
    // Read SQL file
    const sqlFile = path.join(process.cwd(), 'drizzle', '0001_amusing_caretaker.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');
    
    // Split by statement-breakpoint and execute each statement
    const statements = sql
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Executing ${statements.length} SQL statements...`);
    
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await connection.query(statement);
    }

    console.log('\nMigration completed successfully!');
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
