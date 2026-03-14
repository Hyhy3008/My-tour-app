'use client';

import { useState, useEffect, useCallback } from 'react';
import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'tour-guide-db';
const STORE_NAME = 'tour-data';

export function useOfflineStorage() {
  const [db, setDb] = useState<IDBPDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await openDB(DB_NAME, 1, {
          upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
              db.createObjectStore(STORE_NAME);
            }
          },
        });
        setDb(database);
        setIsReady(true);
      } catch {
        setIsReady(true);
      }
    };
    initDB();
  }, []);

  const saveData = useCallback(async (key: string, data: any) => {
    try {
      if (db) {
        await db.put(STORE_NAME, data, key);
      } else {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }, [db]);

  const getData = useCallback(async <T>(key: string): Promise<T | null> => {
    try {
      if (db) return await db.get(STORE_NAME, key);
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }, [db]);

  return { saveData, getData, isReady };
}
