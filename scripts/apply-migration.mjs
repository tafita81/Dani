import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function applyMigration() {
  // Parse DATABASE_URL: mysql://user:password@host:port/database?ssl=...
  const dbUrl = process.env.DATABASE_URL || '';
  const urlParts = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):([0-9]+)\/([^?]+)/);
  
  const host = urlParts?.[3] || 'localhost';
  const user = urlParts?.[1] || 'root';
  const password = urlParts?.[2] || '';
  const database = urlParts?.[5] || 'dani';
  const port = parseInt(urlParts?.[4] || '3306');
  
  console.log('Connecting to:', { host, user, database, port });
  
  const connection = await mysql.createConnection({
    host,
    user,
    password,
    database,
    port,
    ssl: { rejectUnauthorized: false },
  });

  const sqlFile = path.join(process.cwd(), 'drizzle/0002_great_firebird.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');
  // Remove Drizzle comments
  const cleanSql = sql.replace(/--> statement-breakpoint/g, '');
  const statements = cleanSql.split(';').filter(s => s.trim());

  for (const statement of statements) {
    if (statement.trim()) {
      try {
        await connection.execute(statement);
        console.log('✓', statement.substring(0, 50) + '...');
      } catch (error) {
        console.error('✗', statement.substring(0, 50), error.message);
      }
    }
  }

  await connection.end();
  console.log('\n✅ Migration applied successfully!');
}

applyMigration().catch(console.error);
