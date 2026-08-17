// Library Management System
// Handles: Add Book, Display Books, Search Book, Delete Book

let books = [];
let nextId = 1;

const bookForm = document.getElementById('bookForm');
const bookList = document.getElementById('bookList');
const emptyMsg = document.getElementById('emptyMsg');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearSearchBtn = document.getElementById('clearSearchBtn');

// ---------- Add Book ----------
bookForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const genre = document.getElementById('genre').value.trim();
  const copies = document.getElementById('copies').value;

  if (!title || !author || !genre || copies === '') return;

  const newBook = {
    id: nextId++,
    title,
    author,
    genre,
    copies: Number(copies)
  };

  books.push(newBook);
  bookForm.reset();
  renderBooks(books);
});

// ---------- Display Books ----------
function renderBooks(list) {
  bookList.innerHTML = '';

  if (list.length === 0) {
    emptyMsg.hidden = false;
    return;
  }
  emptyMsg.hidden = true;

  list.forEach((book) => {
    const item = document.createElement('div');
    item.className = 'book-item';
    item.innerHTML = `
      <div class="book-info">
        <h3>${escapeHtml(book.title)}</h3>
        <p>by ${escapeHtml(book.author)} · ${escapeHtml(book.genre)} · ${book.copies} copies</p>
      </div>
      <button class="btn-delete" data-id="${book.id}">Delete</button>
    `;
    bookList.appendChild(item);
  });

  document.querySelectorAll('.btn-delete').forEach((btn) => {
    btn.addEventListener('click', () => deleteBook(Number(btn.dataset.id)));
  });
}

// ---------- Search Book ----------
searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') performSearch();
});

// Search helper below
function performSearch() {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    renderBooks(books);
    return;
  }
  const results = books.filter(
    (b) =>
      b.title.toLowerCase().includes(query) ||
      b.author.toLowerCase().includes(query)
  );
  renderBooks(results);
}

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  renderBooks(books);
});

// ---------- Delete Book ----------
function deleteBook(id) {
  books = books.filter((b) => b.id !== id);
  performSearch.length && searchInput.value
    ? performSearch()
    : renderBooks(books);
}

// ---------- Utility ----------
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Initial render
renderBooks(books);

