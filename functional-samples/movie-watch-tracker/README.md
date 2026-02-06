# Movie Watch Tracker

This sample extension automatically detects movie titles on web pages and stores them in a local IndexedDB database so you can remember what you've already watched.

## How it works

- `content-script.js` scans pages for movie signals such as `og:type=video.movie` and `schema.org/Movie` markup.
- When a movie is found, it sends the title and URL to the extension service worker.
- `service-worker.js` stores unique movie titles in IndexedDB.
- The popup displays saved movies and allows clearing the local list.

## Run the extension

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this folder: `functional-samples/movie-watch-tracker`.
5. Visit movie pages and open the extension popup to view saved titles.
