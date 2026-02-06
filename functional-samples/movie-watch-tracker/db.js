const DB_NAME = 'movieWatchTracker';
const DB_VERSION = 1;
const STORE_NAME = 'movies';

export async function withMovieStore(mode, callback) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);

    let callbackResult;
    try {
      callbackResult = callback(store);
    } catch (error) {
      reject(error);
      return;
    }

    transaction.oncomplete = async () => {
      try {
        const resolvedResult = await callbackResult;
        resolve(resolvedResult);
      } catch (error) {
        reject(error);
      }
    };

    transaction.onerror = () => {
      reject(transaction.error || new Error('IndexedDB transaction failed.'));
    };

    transaction.onabort = () => {
      reject(transaction.error || new Error('IndexedDB transaction aborted.'));
    };
  });
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });
        store.createIndex('title', 'title', { unique: true });
        store.createIndex('savedAt', 'savedAt');
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error('Unable to open IndexedDB.'));
  });
}

export { STORE_NAME };
