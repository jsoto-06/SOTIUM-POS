import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { logger } from '../services/loggerService';

let localDb: Database.Database | null = null;

export function getBetterSqliteDB(): Database.Database {
  if (localDb) return localDb;

  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.join(dataDir, 'hostelerp_offline.db');

  try {
    localDb = new Database(dbPath, { verbose: (msg) => logger.debug(`[better-sqlite3] ${msg}`) });
    
    // Enable Write-Ahead Logging (WAL) for ultimate offline performance & concurrency
    localDb.pragma('journal_mode = WAL');
    
    initBetterSqliteTables(localDb);
    logger.info(`[better-sqlite3] Engine initialized successfully at ${dbPath}`);
  } catch (err: any) {
    logger.error('[better-sqlite3] Failed to initialize SQLite file DB, cleaning up corrupt database file:', err?.message || err);
    try {
      if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
      if (fs.existsSync(`${dbPath}-wal`)) fs.unlinkSync(`${dbPath}-wal`);
      if (fs.existsSync(`${dbPath}-shm`)) fs.unlinkSync(`${dbPath}-shm`);

      localDb = new Database(dbPath, { verbose: (msg) => logger.debug(`[better-sqlite3] ${msg}`) });
      localDb.pragma('journal_mode = WAL');
      initBetterSqliteTables(localDb);
      logger.info(`[better-sqlite3] Engine re-created successfully at ${dbPath}`);
    } catch (recreateErr: any) {
      logger.error('[better-sqlite3] Failed to recreate SQLite file DB, using memory database as fallback.', recreateErr);
      localDb = new Database(':memory:');
      initBetterSqliteTables(localDb);
    }
  }

  return localDb;
}

function initBetterSqliteTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS local_orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      table_id TEXT,
      table_name TEXT,
      server_name TEXT NOT NULL,
      status TEXT DEFAULT 'OPEN',
      subtotal REAL DEFAULT 0,
      vat_amount REAL DEFAULT 0,
      total REAL DEFAULT 0,
      payment_method TEXT,
      is_closed INTEGER DEFAULT 0,
      verifactu_hash TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_name TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING',
      attempts INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);
}

export function queueLocalChange(entityName: string, entityId: string, action: string, payload: any) {
  const db = getBetterSqliteDB();
  const stmt = db.prepare(`
    INSERT INTO sync_queue (entity_name, entity_id, action, payload, status, created_at)
    VALUES (?, ?, ?, ?, 'PENDING', ?)
  `);
  return stmt.run(entityName, entityId, action, JSON.stringify(payload), new Date().toISOString());
}
