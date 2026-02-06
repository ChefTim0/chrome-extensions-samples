const SCAN_DELAY_MS = 1200;
let scanTimer;

scheduleScan();
observePotentialSpaNavigation();

function scheduleScan() {
  window.clearTimeout(scanTimer);
  scanTimer = window.setTimeout(scanAndSaveMovie, SCAN_DELAY_MS);
}

function observePotentialSpaNavigation() {
  const observer = new MutationObserver(() => {
    scheduleScan();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  window.addEventListener('popstate', scheduleScan);
  window.addEventListener('hashchange', scheduleScan);
}

async function scanAndSaveMovie() {
  const movieTitle = detectMovieTitle();
  if (!movieTitle) {
    return;
  }

  try {
    await chrome.runtime.sendMessage({
      type: 'MOVIE_FOUND',
      payload: {
        title: movieTitle,
        pageUrl: location.href
      }
    });
  } catch {
    // Extension context may be unavailable during page teardown.
  }
}

function detectMovieTitle() {
  const metaMovie = document.querySelector(
    'meta[property="og:type"][content="video.movie"]'
  );
  if (metaMovie) {
    const ogTitle = getMetaContent('meta[property="og:title"]');
    const twitterTitle = getMetaContent('meta[name="twitter:title"]');
    return cleanTitle(ogTitle || twitterTitle || document.title);
  }

  const schemaMovie = document.querySelector('[itemtype*="schema.org/Movie"]');
  if (schemaMovie) {
    const schemaName = schemaMovie.querySelector('[itemprop="name"]');
    if (schemaName?.textContent) {
      return cleanTitle(schemaName.textContent);
    }

    return cleanTitle(document.title);
  }

  const explicitMovieLabel = Array.from(
    document.querySelectorAll('h1, h2, [aria-label], [data-testid]')
  ).find((element) => {
    const text =
      `${element.textContent || ''} ${element.getAttribute('aria-label') || ''}`.toLowerCase();
    return text.includes('movie') || text.includes('film');
  });

  if (explicitMovieLabel?.textContent) {
    return cleanTitle(explicitMovieLabel.textContent);
  }

  return null;
}

function getMetaContent(selector) {
  const meta = document.querySelector(selector);
  return meta?.content || '';
}

function cleanTitle(rawTitle) {
  if (!rawTitle) {
    return null;
  }

  return rawTitle
    .replace(/\s+/g, ' ')
    .replace(/\|.*$/, '')
    .replace(/-.*$/, '')
    .trim();
}
