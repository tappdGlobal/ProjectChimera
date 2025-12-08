import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const databaseService = {
  initDatabase: async () => {
    try {
      db = await SQLite.openDatabaseAsync('tappd.db');
      
      // Create tables
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS offline_actions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          action_type TEXT NOT NULL,
          payload TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          synced INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS cached_profiles (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          updated_at INTEGER NOT NULL
        );
      `);
      
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  },

  getDatabase: () => {
    if (!db) {
      throw new Error('Database not initialized');
    }
    return db;
  },
};
