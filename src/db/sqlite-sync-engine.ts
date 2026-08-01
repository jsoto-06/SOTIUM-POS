import initSqlJs, { Database } from 'sql.js';

let dbInstance: Database | null = null;

// Helper to initialize local SQLite database via WASM (sql.js)
export async function getLocalSQLiteDB(): Promise<Database | null> {
  if (dbInstance) return dbInstance;
  if (typeof window === 'undefined') return null;

  try {
    const SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`,
    }).catch(() => null);

    if (SQL) {
      // Try loading saved SQLite database binary from localStorage/IndexedDB
      const savedData = typeof localStorage !== 'undefined' ? localStorage.getItem('hostelerp_sqlite_db_backup') : null;
      if (savedData) {
        const u8array = new Uint8Array(JSON.parse(savedData));
        dbInstance = new SQL.Database(u8array);
      } else {
        dbInstance = new SQL.Database();
        initTables(dbInstance);
      }
    }
  } catch (err) {
    console.warn('Failed to load WASM sql.js in current environment', err);
  }

  return dbInstance;
}

function initTables(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS salons (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS tables (
      id TEXT PRIMARY KEY,
      salon_id TEXT,
      name TEXT NOT NULL,
      seats INTEGER DEFAULT 4,
      pos_x INTEGER DEFAULT 0,
      pos_y INTEGER DEFAULT 0,
      status TEXT DEFAULT 'FREE',
      occupied_since TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category_id TEXT,
      price REAL NOT NULL,
      vat_rate REAL DEFAULT 10,
      cost_price REAL DEFAULT 0,
      barcode TEXT,
      printer_target TEXT DEFAULT 'BARRA'
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE,
      series TEXT DEFAULT 'T2026',
      type TEXT DEFAULT 'DIRECTA',
      table_name TEXT,
      server_name TEXT,
      total REAL DEFAULT 0,
      subtotal REAL DEFAULT 0,
      vat_amount REAL DEFAULT 0,
      payment_method TEXT,
      is_closed INTEGER DEFAULT 0,
      verifactu_signed INTEGER DEFAULT 0,
      verifactu_hash TEXT,
      created_at TEXT,
      closed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      pax INTEGER DEFAULT 2,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT DEFAULT 'CONFIRMADA',
      channel TEXT DEFAULT 'TELEFONO',
      table_name TEXT,
      salon_name TEXT,
      notes TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS waiting_list (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      pax INTEGER DEFAULT 2,
      position INTEGER DEFAULT 1,
      estimated_wait INTEGER DEFAULT 15,
      status TEXT DEFAULT 'WAITING',
      joined_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING',
      timestamp TEXT
    );
  `);

  saveDatabase(db);
}

export function saveDatabase(db: Database) {
  try {
    const data = db.export();
    const array = Array.from(data);
    localStorage.setItem('hostelerp_sqlite_db_backup', JSON.stringify(array));
  } catch (e) {
    console.warn('Error saving SQLite database state to localStorage:', e);
  }
}

// Queue an action in SQLite for offline synchronization
export async function queueOfflineSyncAction(action: string, payload: any) {
  const db = await getLocalSQLiteDB();
  if (!db) return;
  db.run(
    'INSERT INTO sync_queue (action, payload, status, timestamp) VALUES (?, ?, ?, ?)',
    [action, JSON.stringify(payload), 'PENDING', new Date().toISOString()]
  );
  saveDatabase(db);
}

// Flush/Sync queued SQLite offline transactions to backend PostgreSQL/API server
export async function syncOfflineQueueWithServer(): Promise<{ syncedCount: number; errors: number }> {
  const db = await getLocalSQLiteDB();
  if (!db) return { syncedCount: 0, errors: 0 };
  const res = db.exec("SELECT id, action, payload FROM sync_queue WHERE status = 'PENDING'");
  
  if (!res.length || !res[0].values.length) {
    return { syncedCount: 0, errors: 0 };
  }

  const rows = res[0].values;
  let syncedCount = 0;
  let errors = 0;

  for (const row of rows) {
    const [id, action, payloadStr] = row;
    try {
      const payload = JSON.parse(payloadStr as string);
      const apiRes = await fetch('/api/v1/sync/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });

      if (apiRes.ok) {
        db.run("UPDATE sync_queue SET status = 'SYNCED' WHERE id = ?", [id]);
        syncedCount++;
      } else {
        errors++;
      }
    } catch (e) {
      errors++;
    }
  }

  saveDatabase(db);
  return { syncedCount, errors };
}
