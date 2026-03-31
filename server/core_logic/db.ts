/**
 * db.ts — Conexão com MySQL usando Drizzle ORM
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../../drizzle/schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não definida no .env");
}

// Pool de conexões
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export const db = drizzle(pool, { schema, mode: "default" });

// Testar conexão ao iniciar
pool
  .getConnection()
  .then((conn) => {
    console.log("✅ MySQL conectado com sucesso");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar MySQL:", err.message);
    process.exit(1);
  });
