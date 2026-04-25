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
let isInitializing = false;
const isNative = Platform.OS !== 'web';

// ─── Helpers ─────────────────────────────────────────────────

const getDB = async (): Promise<any> => {
  if (sqliteDB) return sqliteDB;
  if (!isNative) return null;
  // Avoid re-entrant init
  if (isInitializing) return null;
  isInitializing = true;
  try {
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
    sqliteDB = null;
  }
  isInitializing = false;
  return sqliteDB;
};

// ─── Public API ──────────────────────────────────────────────

export const initDB = async (): Promise<void> => {
  await getDB();
};

export const insertData = async (
  temperature: number,
  humidity: number,
  motion: number,
  energy: number
): Promise<void> => {
  const timestamp = new Date().toISOString();
  const db = await getDB();

  if (db) {
    try {
      await db.runAsync(
        'INSERT INTO SensorData (temperature, humidity, motion, energy, timestamp) VALUES (?, ?, ?, ?, ?)',
        [temperature, humidity, motion, energy, timestamp]
      );
      return;
    } catch (e) {
      console.warn('SQLite insert failed, using in-memory fallback:', e);
      // Reset connection so next call tries to reconnect
      sqliteDB = null;
    }
  }

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
};

export const getHistory = async (): Promise<SensorRecord[]> => {
  const db = await getDB();

  if (db) {
    try {
      return await db.getAllAsync(
        'SELECT * FROM SensorData ORDER BY id DESC LIMIT 200'
      );
    } catch (e) {
      console.warn('SQLite getHistory failed:', e);
      sqliteDB = null;
    }
  }
  return [...memoryStore].reverse().slice(0, 200);
};

export const clearHistory = async (): Promise<void> => {
  const db = await getDB();

  if (db) {
    try {
      await db.runAsync('DELETE FROM SensorData');
      return;
    } catch (e) {
      console.warn('SQLite clearHistory failed:', e);
      sqliteDB = null;
    }
  }
  memoryStore = [];
  memoryIdCounter = 0;
};

export const getRecordCount = async (): Promise<number> => {
  const db = await getDB();

  if (db) {
    try {
      const result = await db.getFirstAsync(
        'SELECT COUNT(*) as count FROM SensorData'
      );
      return result?.count ?? 0;
    } catch (e) {
      console.warn('SQLite getRecordCount failed:', e);
      sqliteDB = null;
    }
  }
  return memoryStore.length;
};