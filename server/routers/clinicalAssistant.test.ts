import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createConnection } from "mysql2/promise";
import { URL } from "url";

describe("Clinical Assistant - Session Analysis Saving", () => {
  let connection: any;

  beforeAll(async () => {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL not set");
    }

    const url = new URL(dbUrl);
    connection = await createConnection({
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: { rejectUnauthorized: true },
    });
  });

  afterAll(async () => {
    if (connection) {
      await connection.end();
    }
  });

  it("should have new columns in session_notes table", async () => {
    const [columns] = await connection.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'session_notes' AND TABLE_SCHEMA = DATABASE()"
    );

    const columnNames = columns.map((c: any) => c.COLUMN_NAME);

    expect(columnNames).toContain("full_analysis");
    expect(columnNames).toContain("emotional_analysis");
    expect(columnNames).toContain("session_type");
    expect(columnNames).toContain("duration");
    expect(columnNames).toContain("session_date");
  });

  it("should have removed duplicate patients", async () => {
    const [joaoSilvas] = await connection.query(
      "SELECT COUNT(*) as count FROM patients WHERE name = 'João Silva'"
    );

    expect(joaoSilvas[0].count).toBeLessThanOrEqual(1);
  });

  it("should have correct data types for new columns", async () => {
    const [columns] = await connection.query(
      "SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'session_notes' AND TABLE_SCHEMA = DATABASE()"
    );

    const columnMap = Object.fromEntries(
      columns.map((c: any) => [c.COLUMN_NAME, c.COLUMN_TYPE])
    );

    expect(columnMap.full_analysis).toMatch(/text/i);
    expect(columnMap.emotional_analysis).toMatch(/json/i);
    expect(columnMap.session_type).toMatch(/varchar/i);
    expect(columnMap.duration).toMatch(/int/i);
    expect(columnMap.session_date).toMatch(/timestamp/i);
  });
});
