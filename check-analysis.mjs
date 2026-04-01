import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DATABASE_URL?.split('@')[1]?.split(':')[0] || 'localhost',
  user: process.env.DATABASE_URL?.split('://')[1]?.split(':')[0] || 'root',
  password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || '',
  database: process.env.DATABASE_URL?.split('/')[3] || 'dani',
  ssl: 'Amazon RDS',
});

const [analyses] = await connection.execute(
  `SELECT id, patientId, transcript, summary, keyThemes, fullAnalysis, createdAt 
   FROM sessionNotes 
   WHERE patientId = 40 
   ORDER BY createdAt DESC 
   LIMIT 5`
);

console.log('Análises encontradas para Pedro Mendes (ID: 40):');
console.log(JSON.stringify(analyses, null, 2));

await connection.end();
