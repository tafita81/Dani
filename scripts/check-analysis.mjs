import { db } from '../server/db.ts';

async function checkAnalyses() {
  const analyses = await db.query.sessionNotes.findMany({
    where: (notes, { eq }) => eq(notes.patientId, 40),
    orderBy: (notes, { desc }) => desc(notes.createdAt),
    limit: 5,
  });
  
  console.log('Análises para Pedro Mendes (ID: 40):');
  analyses.forEach((analysis, index) => {
    console.log(`\n=== Análise ${index + 1} ===`);
    console.log(`ID: ${analysis.id}`);
    console.log(`Data: ${analysis.createdAt}`);
    console.log(`Transcrição: ${analysis.transcript?.substring(0, 100)}...`);
    console.log(`Resumo: ${analysis.summary?.substring(0, 100)}...`);
    console.log(`Temas: ${analysis.keyThemes?.substring(0, 100)}...`);
    console.log(`Análise Completa: ${analysis.fullAnalysis?.substring(0, 100)}...`);
  });
}

checkAnalyses().catch(console.error);
