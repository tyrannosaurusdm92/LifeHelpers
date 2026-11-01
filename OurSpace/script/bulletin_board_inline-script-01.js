
(function () {
  'use strict';

  const PROFILE = document.documentElement.dataset.profile || 'standalone';
  const DB_NAME = 'bulletin_local_archive_' + PROFILE;
  const DB_VERSION = 1;
  const STORE = 'state';
  const STATE_KEY = 'bulletin-state-v1.' + PROFILE;

  function openDB() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        resolve(null);
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function getState() {
    try {
      const db = await openDB();
      if (!db) {
        const raw = localStorage.getItem(STATE_KEY);
        return raw ? JSON.parse(raw) : null;
      }
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly');
        const req = tx.objectStore(STORE).get(STATE_KEY);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('IndexedDB read failed; using localStorage fallback.', err);
      let raw = null; try { raw = localStorage.getItem(STATE_KEY); } catch (_) {}
      return raw ? JSON.parse(raw) : null;
    }
  }

  async function setState(state) {
    const serializable = JSON.parse(JSON.stringify(state));
    try {
      const db = await openDB();
      if (!db) throw new Error('IndexedDB unavailable');
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(serializable, STATE_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      try { localStorage.setItem(STATE_KEY, JSON.stringify(serializable)); } catch (_) {}
      return true;
    } catch (err) {
      try {
        localStorage.setItem(STATE_KEY, JSON.stringify(serializable));
        return true;
      } catch (fallbackError) {
        console.error('Unable to persist Bulletin state.', fallbackError);
        return false;
      }
    }
  }

  async function clearState() {
    try {
      localStorage.removeItem(STATE_KEY);
      const db = await openDB();
      if (!db) return;
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete(STATE_KEY);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('Could not fully clear storage.', err);
    }
  }

  window.BulletinStorage = { getState, setState, clearState, STATE_KEY };
})();

