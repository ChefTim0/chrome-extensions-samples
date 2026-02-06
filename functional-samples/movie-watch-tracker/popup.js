const moviesList = document.querySelector('#movies');
const emptyState = document.querySelector('#empty-state');
const clearButton = document.querySelector('#clear');

clearButton.addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ type: 'CLEAR_MOVIES' });
  await renderMovies();
});

renderMovies();

async function renderMovies() {
  const response = await chrome.runtime.sendMessage({ type: 'GET_MOVIES' });
  moviesList.textContent = '';

  if (!response?.ok || !response.movies?.length) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  for (const movie of response.movies) {
    const item = document.createElement('li');

    const title = document.createElement('span');
    title.className = 'movie-title';
    title.textContent = movie.title;

    const date = document.createElement('p');
    date.className = 'movie-date';
    date.textContent = new Date(movie.savedAt).toLocaleString();

    const source = document.createElement('p');
    source.className = 'movie-source';
    source.textContent = movie.pageUrl;

    item.append(title, date, source);
    moviesList.append(item);
  }
}
