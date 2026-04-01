import { createConnection } from 'mysql2/promise';
import { URL } from 'url';

async function main() {
  // Parse DATABASE_URL
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
    // Get all patients named João Silva
    const [rows] = await connection.query(
      'SELECT id, name, createdAt FROM patients WHERE name = ? ORDER BY createdAt DESC',
      ['João Silva']
    );

    console.log(`Found ${rows.length} patients named "João Silva"`);
    if (rows.length > 0) {
      console.log('IDs:', rows.map(r => r.id));
    }

    if (rows.length > 1) {
      // Keep the first one, delete the rest
      const idsToDelete = rows.slice(1).map(r => r.id);
      console.log(`\nDeleting duplicate IDs: ${idsToDelete.join(', ')}`);
      
      // Delete duplicates
      const placeholders = idsToDelete.map(() => '?').join(',');
      await connection.query(
        `DELETE FROM patients WHERE id IN (${placeholders})`,
        idsToDelete
      );
      
      console.log('Duplicates deleted successfully!');
    }

    // Show remaining patients
    const [allPatients] = await connection.query('SELECT id, name FROM patients ORDER BY name');
    console.log('\nRemaining patients:');
    allPatients.forEach(p => console.log(`  - ${p.name} (ID: ${p.id})`));

  } finally {
    await connection.end();
  }
}

main().catch(console.error);
