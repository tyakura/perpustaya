import { useEffect, useRef, useState } from 'react'
import './App.css'

const PAGE_SIZE = 12

function App() {
  const [books, setBooks] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [retryToken, setRetryToken] = useState(0)
  const [selectedBook, setSelectedBook] = useState(null)
  const [formBook, setFormBook] = useState(null)
  const [savingBook, setSavingBook] = useState(false)
  const [deletingBookId, setDeletingBookId] = useState(null)
  const [saveError, setSaveError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [notice, setNotice] = useState('')
  const dialogRef = useRef(null)
  const formDialogRef = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    let ignoreResponse = false

    async function loadBooks() {
      setStatus('loading')
      setError('')

      const params = new URLSearchParams({ page: String(page) })
      if (search) params.set('search', search)

      try {
        const response = await fetch(`/api/books?${params}`, {
          signal: controller.signal,
        })

        let payload
        try {
          payload = await response.json()
        } catch {
          throw new Error(
            `Respons peru-api tidak valid (HTTP ${response.status}). Pastikan server API berjalan.`,
          )
        }

        if (!response.ok) {
          throw new Error(payload.message || `Permintaan gagal (${response.status}).`)
        }

        if (
          !Array.isArray(payload.data) ||
          !Number.isInteger(payload.last_page) ||
          !Number.isInteger(payload.total)
        ) {
          throw new Error('Format respons katalog dari API tidak sesuai.')
        }

        if (!ignoreResponse) {
          setBooks(payload.data)
          setLastPage(payload.last_page)
          setTotal(payload.total)
          setStatus('success')
        }
      } catch (requestError) {
        if (requestError.name === 'AbortError') return

        if (!ignoreResponse) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : String(requestError),
          )
          setStatus('error')
        }
      }
    }

    loadBooks()

    return () => {
      ignoreResponse = true
      controller.abort()
    }
  }, [page, retryToken, search])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (selectedBook && !dialog.open) {
      dialog.showModal()
    } else if (!selectedBook && dialog.open) {
      dialog.close()
    }
  }, [selectedBook])

  useEffect(() => {
    const dialog = formDialogRef.current
    if (!dialog) return

    if (formBook && !dialog.open) {
      dialog.showModal()
    } else if (!formBook && dialog.open) {
      dialog.close()
    }
  }, [formBook])

  function submitSearch(event) {
    event.preventDefault()
    setPage(1)
    setSearch(searchInput.trim())
  }

  function clearSearch() {
    setSearchInput('')
    setSearch('')
    setPage(1)
  }

  function openBookForm(book = {}) {
    setSaveError('')
    setNotice('')
    setFormBook(book)
  }

  async function saveBook(event) {
    event.preventDefault()
    setSavingBook(true)
    setSaveError('')
    setNotice('')

    const formData = new FormData(event.currentTarget)
    const publicationDate = formData.get('publicationDate')
    const bookData = {
      title: formData.get('title').trim(),
      author: formData.get('author').trim(),
      year: publicationDate ? Number(publicationDate.slice(0, 4)) : null,
    }
    const isEditing = Boolean(formBook?.id)
    const endpoint = isEditing ? `/api/books/${formBook.id}` : '/api/books'

    try {
      const response = await fetch(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData),
      })

      let payload
      try {
        payload = await response.json()
      } catch {
        throw new Error(
          `Respons peru-api tidak valid (HTTP ${response.status}). Pastikan server API berjalan.`,
        )
      }

      if (!response.ok) {
        const validationMessage = payload.errors
          ? Object.values(payload.errors).flat()[0]
          : null
        throw new Error(
          validationMessage || payload.message || `Permintaan gagal (${response.status}).`,
        )
      }

      setFormBook(null)
      setNotice(isEditing ? 'Data buku berhasil diperbarui.' : 'Buku berhasil ditambahkan.')
      setPage(1)
      setRetryToken((token) => token + 1)
    } catch (requestError) {
      setSaveError(
        requestError instanceof Error ? requestError.message : String(requestError),
      )
    } finally {
      setSavingBook(false)
    }
  }

  async function deleteBook(book) {
    if (!window.confirm(`Hapus buku "${book.title}" dari katalog? Tindakan ini tidak dapat dibatalkan.`)) {
      return
    }

    setDeletingBookId(book.id)
    setDeleteError('')
    setNotice('')

    try {
      const response = await fetch(`/api/books/${book.id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      })

      if (!response.ok) {
        let payload
        try {
          payload = await response.json()
        } catch {
          throw new Error(
            `Respons peru-api tidak valid (HTTP ${response.status}). Pastikan server API berjalan.`,
          )
        }

        throw new Error(payload.message || `Permintaan gagal (${response.status}).`)
      }

      setNotice('Buku berhasil dihapus.')
      if (books.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1)
      } else {
        setRetryToken((token) => token + 1)
      }
    } catch (requestError) {
      setDeleteError(
        requestError instanceof Error ? requestError.message : String(requestError),
      )
    } finally {
      setDeletingBookId(null)
    }
  }

  return (
    <div className="site-shell">
      <a className="skip-link" href="#catalog">
        Langsung ke katalog
      </a>

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Perpustakaan, beranda">
          Perpustakaan
        </a>
        <nav aria-label="Navigasi utama">
          <a href="#catalog">Katalog</a>
          <a href="#about">Tentang</a>
        </nav>
      </header>

      <main id="top">
        <section className="intro" aria-labelledby="page-title">
          <p className="intro-note">Ruang untuk menemukan bacaan</p>
          <h1 id="page-title">Cari buku yang ingin kamu baca.</h1>
          <p className="intro-copy">
            Telusuri koleksi perpustakaan berdasarkan judul atau nama penulis.
          </p>
        </section>

        <section className="catalog" id="catalog" aria-labelledby="catalog-title">
          <div className="catalog-heading">
            <div>
              <p className="section-label">Daftar koleksi</p>
              <h2 id="catalog-title">Katalog buku</h2>
            </div>
            <div className="catalog-actions">
              {status === 'success' && (
                <p className="catalog-count">{total} buku</p>
              )}
              <button
                className="search-button add-book-button"
                type="button"
                onClick={() => openBookForm()}
              >
                Tambah buku
              </button>
            </div>
          </div>

          {notice && (
            <p className="save-notice" role="status">
              {notice}
            </p>
          )}
          {deleteError && (
            <p className="form-error delete-error" role="alert">
              {deleteError}
            </p>
          )}

          <form className="search-form" role="search" onSubmit={submitSearch}>
            <label className="visually-hidden" htmlFor="book-search">
              Cari judul atau penulis
            </label>
            <input
              id="book-search"
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Judul atau nama penulis"
            />
            <button className="search-button" type="submit">
              Cari buku
            </button>
            {search && (
              <button
                className="clear-button"
                type="button"
                onClick={clearSearch}
              >
                Hapus pencarian
              </button>
            )}
          </form>

          <div className="results" aria-live="polite" aria-busy={status === 'loading'}>
            {status === 'loading' && (
              <p className="state-message">Memuat koleksi buku dari peru-api...</p>
            )}

            {status === 'error' && (
              <div className="state-message state-error" role="alert">
                <h3>Katalog belum bisa dimuat</h3>
                <p>{error}</p>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => setRetryToken((token) => token + 1)}
                >
                  Coba lagi
                </button>
              </div>
            )}

            {status === 'success' && books.length === 0 && (
              <div className="state-message">
                <h3>{search ? 'Buku tidak ditemukan' : 'Belum ada buku di katalog'}</h3>
                <p>
                  {search
                    ? `Tidak ada hasil untuk “${search}”. Coba kata pencarian lain.`
                    : 'Tambahkan data buku ke peru-api untuk menampilkannya di sini.'}
                </p>
                {search && (
                  <button
                    className="text-button"
                    type="button"
                    onClick={clearSearch}
                  >
                    Tampilkan semua buku
                  </button>
                )}
              </div>
            )}

            {status === 'success' && books.length > 0 && (
              <>
                <ol className="book-list">
                  {books.map((book, index) => (
                    <li className="book-row" key={book.id}>
                      <span className="book-number" aria-hidden="true">
                        {String((page - 1) * PAGE_SIZE + index + 1).padStart(2, '0')}
                      </span>
                      <div className="book-copy">
                        <p className="book-year">
                          {book.year ?? 'Tahun terbit belum dicatat'}
                        </p>
                        <h3>
                          <button
                            className="book-title"
                            type="button"
                            onClick={() => setSelectedBook(book)}
                          >
                            {book.title}
                          </button>
                        </h3>
                        <p className="book-author">oleh {book.author}</p>
                      </div>
                      <div className="book-actions">
                        <button
                          className="detail-button"
                          type="button"
                          onClick={() => setSelectedBook(book)}
                          aria-label={`Lihat detail ${book.title}`}
                        >
                          Detail
                        </button>
                        <button
                          className="detail-button"
                          type="button"
                          onClick={() => openBookForm(book)}
                          aria-label={`Edit ${book.title}`}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-button"
                          type="button"
                          onClick={() => deleteBook(book)}
                          disabled={deletingBookId !== null}
                          aria-label={`Hapus ${book.title}`}
                        >
                          {deletingBookId === book.id ? 'Menghapus...' : 'Hapus'}
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>

                {lastPage > 1 && (
                  <nav className="pagination" aria-label="Halaman katalog">
                    <button
                      className="page-button"
                      type="button"
                      disabled={page === 1}
                      onClick={() => setPage((currentPage) => currentPage - 1)}
                    >
                      Sebelumnya
                    </button>
                    <p>
                      Halaman {page} dari {lastPage}
                    </p>
                    <button
                      className="page-button"
                      type="button"
                      disabled={page === lastPage}
                      onClick={() => setPage((currentPage) => currentPage + 1)}
                    >
                      Berikutnya
                    </button>
                  </nav>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <footer className="site-footer" id="about">
        <p>Data katalog dimuat langsung dari API perpustakaan.</p>
        <a href="#top">Kembali ke atas</a>
      </footer>

      <dialog
        className="book-dialog"
        ref={dialogRef}
        aria-labelledby="book-detail-title"
        onKeyDown={(event) => {
          if (event.key === 'Escape') setSelectedBook(null)
        }}
        onCancel={(event) => {
          event.preventDefault()
          setSelectedBook(null)
        }}
        onClose={() => setSelectedBook(null)}
      >
        {selectedBook && (
          <div className="dialog-content">
            <p className="section-label">Detail buku</p>
            <h2 id="book-detail-title">{selectedBook.title}</h2>
            <p className="dialog-author">oleh {selectedBook.author}</p>
            <p className="dialog-year">
              {selectedBook.year ?? 'Tahun terbit belum dicatat'}
            </p>
            <button
              className="search-button dialog-close"
              type="button"
              onClick={() => setSelectedBook(null)}
            >
              Tutup detail
            </button>
          </div>
        )}
      </dialog>

      <dialog
        className="book-dialog"
        ref={formDialogRef}
        aria-labelledby="book-form-title"
        onKeyDown={(event) => {
          if (event.key === 'Escape' && !savingBook) {
            setFormBook(null)
            setSaveError('')
          }
        }}
        onCancel={(event) => {
          event.preventDefault()
          setFormBook(null)
          setSaveError('')
        }}
        onClose={() => {
          setFormBook(null)
          setSaveError('')
        }}
      >
        {formBook !== null && (
          <form className="dialog-content book-form" onSubmit={saveBook}>
            <p className="section-label">
              {formBook.id ? 'Ubah koleksi' : 'Koleksi baru'}
            </p>
            <h2 id="book-form-title">
              {formBook.id ? 'Edit data buku' : 'Tambah buku'}
            </h2>

            {saveError && (
              <p className="form-error" role="alert">
                {saveError}
              </p>
            )}

            <label htmlFor="book-title">Judul buku</label>
            <input
              id="book-title"
              name="title"
              type="text"
              required
              maxLength={255}
              defaultValue={formBook.title ?? ''}
              autoFocus
            />

            <label htmlFor="book-author">Penulis</label>
            <input
              id="book-author"
              name="author"
              type="text"
              required
              maxLength={255}
              defaultValue={formBook.author ?? ''}
            />

            <label htmlFor="book-publication-date">Tanggal terbit (opsional)</label>
            <input
              id="book-publication-date"
              name="publicationDate"
              type="date"
              defaultValue={formBook.year ? `${formBook.year}-01-01` : ''}
              aria-describedby="publication-date-hint"
            />
            <p className="field-hint" id="publication-date-hint">
              Katalog menyimpan tahunnya saja. Hari dan bulan tidak dicatat.
            </p>

            <div className="form-actions">
              <button
                className="detail-button"
                type="button"
                disabled={savingBook}
                onClick={() => setFormBook(null)}
              >
                Batal
              </button>
              <button
                className="search-button"
                type="submit"
                disabled={savingBook}
              >
                {savingBook
                  ? 'Menyimpan...'
                  : formBook.id
                    ? 'Simpan perubahan'
                    : 'Simpan buku'}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </div>
  )
}

export default App
