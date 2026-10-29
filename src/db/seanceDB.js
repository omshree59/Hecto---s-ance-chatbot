// IndexedDB Database Manager for Séance Chatbot
// Provides permanent local persistence, full-text search across messages, rename, pin, and migration from localStorage.

const DB_NAME = 'SeanceChatDB';
const DB_VERSION = 1;
const STORE_NAME = 'sessions';

class SeanceDatabase {
  constructor() {
    this.db = null;
    this.initPromise = this.init();
  }

  async init() {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return null;
    }

    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('pinned', 'pinned', { unique: false });
          store.createIndex('spiritId', 'spiritId', { unique: false });
        }
      };

      request.onsuccess = async (event) => {
        this.db = event.target.result;
        await this.migrateFromLocalStorage();
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB open error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async migrateFromLocalStorage() {
    try {
      const oldRaw = localStorage.getItem('seance_sessions_v5') || localStorage.getItem('seance_sessions_v4');
      const pinnedRaw = localStorage.getItem('seance_pinned_v1');
      const pinnedList = pinnedRaw ? JSON.parse(pinnedRaw) : [];

      if (oldRaw) {
        const oldSessions = JSON.parse(oldRaw);
        if (Array.isArray(oldSessions) && oldSessions.length > 0) {
          for (const s of oldSessions) {
            const existing = await this.getSession(s.id);
            if (!existing) {
              await this.saveSession({
                ...s,
                pinned: pinnedList.includes(s.id)
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn('Migration warning:', e);
    }
  }

  async getAllSessions() {
    await this.initPromise;
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const sessions = request.result || [];
        // Sort: Pinned first, then newest timestamp
        sessions.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
        });
        resolve(sessions);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getSession(id) {
    await this.initPromise;
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async saveSession(session) {
    await this.initPromise;
    if (!this.db || !session) return;

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const cleanSession = {
        ...session,
        timestamp: session.timestamp || new Date().toISOString(),
        pinned: !!session.pinned,
        messages: session.messages || []
      };

      const request = store.put(cleanSession);
      request.onsuccess = () => resolve(cleanSession);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteSession(id) {
    await this.initPromise;
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async renameSession(id, newTitle) {
    const session = await this.getSession(id);
    if (!session) return null;

    session.title = newTitle.trim();
    return this.saveSession(session);
  }

  async togglePinSession(id) {
    const session = await this.getSession(id);
    if (!session) return null;

    session.pinned = !session.pinned;
    return this.saveSession(session);
  }

  // Full-text search across titles AND message contents
  async searchSessions(query) {
    if (!query || !query.trim()) return [];
    const q = query.toLowerCase().trim();
    const all = await this.getAllSessions();

    const matches = [];
    for (const session of all) {
      let matchedSnippet = null;
      let titleMatch = (session.title || '').toLowerCase().includes(q);

      // Search through message texts
      for (const msg of session.messages || []) {
        const text = (msg.text || '').toLowerCase();
        const idx = text.indexOf(q);
        if (idx !== -1) {
          const start = Math.max(0, idx - 30);
          const end = Math.min(msg.text.length, idx + q.length + 50);
          matchedSnippet = (start > 0 ? '...' : '') + 
            msg.text.slice(start, end) + 
            (end < msg.text.length ? '...' : '');
          break;
        }
      }

      if (titleMatch || matchedSnippet) {
        matches.push({
          session,
          matchedSnippet: matchedSnippet || session.title
        });
      }
    }

    return matches;
  }
}

export const seanceDB = new SeanceDatabase();
