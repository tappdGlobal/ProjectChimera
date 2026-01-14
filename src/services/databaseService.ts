import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

type OfflineAction = {
  id: number;
  action_type: string;
  payload: string;
  created_at: number;
  synced: number;
};

let db: SQLite.SQLiteDatabase | null = null;
let usesNativeSqlite = false;
let fallbackIdCounter = Date.now();

const OFFLINE_ACTIONS_KEY = '@tappd/offline_actions';

export const databaseService = {
  initDatabase: async () => {
    try {
      // Try to open a native DB
      db = await SQLite.openDatabaseAsync('tappd.db');

      // Run statements one-by-one so we can narrow down failures
      try {
        await db.execAsync('PRAGMA journal_mode = WAL;');
        await db.execAsync(`CREATE TABLE IF NOT EXISTS offline_actions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          action_type TEXT NOT NULL,
          payload TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          synced INTEGER DEFAULT 0
        );`);
        await db.execAsync(`CREATE TABLE IF NOT EXISTS cached_profiles (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          updated_at INTEGER NOT NULL
        );`);

        usesNativeSqlite = true;
        console.log('Database initialized successfully (native SQLite)');
      } catch (nativeErr) {
        // If execAsync/prepareAsync fails (native NPE), fall back
        console.warn('Native SQLite exec failed, falling back to AsyncStorage:', nativeErr);
        db = null;
        usesNativeSqlite = false;

        // Ensure fallback storage exists
        const existing = await AsyncStorage.getItem(OFFLINE_ACTIONS_KEY);
        if (!existing) {
          await AsyncStorage.setItem(OFFLINE_ACTIONS_KEY, JSON.stringify([]));
        }
      }
    } catch (openErr) {
      console.warn('Could not open native SQLite DB — using fallback AsyncStorage. Error:', openErr);
      db = null;
      usesNativeSqlite = false;

      // Ensure fallback storage exists
      const existing = await AsyncStorage.getItem(OFFLINE_ACTIONS_KEY);
      if (!existing) {
        await AsyncStorage.setItem(OFFLINE_ACTIONS_KEY, JSON.stringify([]));
      }
    }
  },

  // New abstracted APIs so callers don't need to know storage implementation
  queueOfflineAction: async (actionType: string, payload: any, createdAt?: number) => {
    const created = createdAt ?? Date.now();
    const jsonPayload = JSON.stringify(payload);

    if (usesNativeSqlite && db) {
      try {
        await db.runAsync(
          'INSERT INTO offline_actions (action_type, payload, created_at) VALUES (?, ?, ?)',
          actionType,
          jsonPayload,
          created
        );
        return;
      } catch (err) {
        console.warn('Native insert failed, falling back to AsyncStorage:', err);
        // fall through to fallback
      }
    }

    // Fallback using AsyncStorage
    try {
      const raw = await AsyncStorage.getItem(OFFLINE_ACTIONS_KEY);
      const arr: OfflineAction[] = raw ? JSON.parse(raw) : [];
      const id = ++fallbackIdCounter;
      arr.push({ id, action_type: actionType, payload: jsonPayload, created_at: created, synced: 0 });
      await AsyncStorage.setItem(OFFLINE_ACTIONS_KEY, JSON.stringify(arr));
    } catch (err) {
      console.error('Failed to queue offline action in fallback storage:', err);
    }
  },

  getUnsyncedActions: async (): Promise<OfflineAction[]> => {
    if (usesNativeSqlite && db) {
      try {
        return await db.getAllAsync('SELECT * FROM offline_actions WHERE synced = 0');
      } catch (err) {
        console.warn('Native getAllAsync failed, falling back to AsyncStorage:', err);
      }
    }

    try {
      const raw = await AsyncStorage.getItem(OFFLINE_ACTIONS_KEY);
      const arr: OfflineAction[] = raw ? JSON.parse(raw) : [];
      return arr.filter((a) => a.synced === 0);
    } catch (err) {
      console.error('Failed to read unsynced actions from fallback storage:', err);
      return [];
    }
  },

  markActionSynced: async (id: number) => {
    if (usesNativeSqlite && db) {
      try {
        await db.runAsync('UPDATE offline_actions SET synced = 1 WHERE id = ?', id);
        return;
      } catch (err) {
        console.warn('Native update failed, falling back to AsyncStorage:', err);
      }
    }

    try {
      const raw = await AsyncStorage.getItem(OFFLINE_ACTIONS_KEY);
      const arr: OfflineAction[] = raw ? JSON.parse(raw) : [];
      const idx = arr.findIndex((a) => a.id === id);
      if (idx >= 0) {
        arr[idx].synced = 1;
        await AsyncStorage.setItem(OFFLINE_ACTIONS_KEY, JSON.stringify(arr));
      }
    } catch (err) {
      console.error('Failed to mark action synced in fallback storage:', err);
    }
  },

  // Kept for backwards compatibility where callers expect a DB object; returns null if fallback is used
  getDatabase: () => {
    if (!db) {
      throw new Error('Database not initialized');
    }
    return db;
  },

  usesNative: () => usesNativeSqlite,
};
