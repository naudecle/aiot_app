import { Platform } from 'react-native';

// ─── Types ───────────────────────────────────────────────────
interface SensorRecord {
  id: number;
  temperature: number;
  humidity: number;
  motion: number;
  energy: number;
  timestamp: string;
}

// ─── In-memory store (used on web, also as fallback) ─────────
let memoryStore: SensorRecord[] = [];
let memoryIdCounter = 0;

// ─── SQLite handle (native only) ─────────────────────────────
let sqliteDB: any = null;
const isNative = Platform.OS !== 'web';

// ─── Public API ──────────────────────────────────────────────

export const initDB = async (): Promise<void> => {
  if (!isNative) return; // web uses in-memory, no init needed

  try {
    // Dynamic require prevents Metro from bundling expo-sqlite on web
    const SQLite = require('expo-sqlite');
    sqliteDB = await SQLite.openDatabaseAsync('aiot.db');
    await sqliteDB.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS SensorData (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        temperature REAL,
        humidity REAL,
        motion INTEGER,
        energy REAL,
        timestamp TEXT
      );
    `);
  } catch (e) {
    console.warn('SQLite init failed, falling back to in-memory:', e);
  }
};

export const insertData = async (
  temperature: number,
  humidity: number,
  motion: number,
  energy: number
): Promise<void> => {
  const timestamp = new Date().toISOString();

  if (sqliteDB) {
    await sqliteDB.runAsync(
      'INSERT INTO SensorData (temperature, humidity, motion, energy, timestamp) VALUES (?, ?, ?, ?, ?)',
      [temperature, humidity, motion, energy, timestamp]
    );
  } else {
    // In-memory fallback
    memoryIdCounter++;
    memoryStore.push({
      id: memoryIdCounter,
      temperature,
      humidity,
      motion,
      energy,
      timestamp,
    });
    if (memoryStore.length > 500) {
      memoryStore = memoryStore.slice(-500);
    }
  }
};

export const getHistory = async (): Promise<SensorRecord[]> => {
  if (sqliteDB) {
    return await sqliteDB.getAllAsync(
      'SELECT * FROM SensorData ORDER BY id DESC LIMIT 200'
    );
  }
  return [...memoryStore].reverse().slice(0, 200);
};

export const clearHistory = async (): Promise<void> => {
  if (sqliteDB) {
    await sqliteDB.runAsync('DELETE FROM SensorData');
  } else {
    memoryStore = [];
    memoryIdCounter = 0;
  }
};

export const getRecordCount = async (): Promise<number> => {
  if (sqliteDB) {
    const result = await sqliteDB.getFirstAsync(
      'SELECT COUNT(*) as count FROM SensorData'
    );
    return result?.count ?? 0;
  }
  return memoryStore.length;
};
