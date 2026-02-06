import { withMovieStore } from './db.js';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || !message.type) {
    return;
  }

  if (message.type === 'MOVIE_FOUND') {
    saveMovie(message.payload)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'GET_MOVIES') {
    getMovies()
      .then((movies) => sendResponse({ ok: true, movies }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'CLEAR_MOVIES') {
    clearMovies()
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
});

async function saveMovie(payload) {
  const title = sanitizeTitle(payload?.title);
  if (!title) {
    return { ok: false, error: 'No movie title provided.' };
  }

  const existingMovie = await withMovieStore('readonly', (store) =>
    requestToPromise(store.index('title').get(title))
  );
  if (existingMovie) {
    return { ok: true, duplicate: true, movie: existingMovie };
  }

  const movie = {
    title,
    pageUrl: payload?.pageUrl || '',
    savedAt: new Date().toISOString()
  };

  const id = await withMovieStore('readwrite', (store) =>
    requestToPromise(store.add(movie))
  );
  return { ok: true, duplicate: false, movie: { ...movie, id } };
}

async function getMovies() {
  const movies = await withMovieStore('readonly', (store) =>
    requestToPromise(store.getAll())
  );
  return movies.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
}

async function clearMovies() {
  await withMovieStore('readwrite', (store) => requestToPromise(store.clear()));
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error('IndexedDB request failed.'));
  });
}

function sanitizeTitle(rawTitle) {
  if (typeof rawTitle !== 'string') {
    return '';
  }

  return rawTitle.replace(/\s+/g, ' ').trim();
}
