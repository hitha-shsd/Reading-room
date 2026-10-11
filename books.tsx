import { useState, type Dispatch, type SetStateAction } from "react";
import { BookOpen, Plus, Pencil, Trash2, Check, Star, Feather } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type Book,
  type Journal,
  type BookStatus,
  statusLabels,
  newId,
  localDate,
  safeLink,
} from "./data";
import { Field, Modal, Flourish } from "./decorations";
export type SetJournal = Dispatch<SetStateAction<Journal>>;

export function BookCover({
  book,
  index = 0,
  small = false,
}: {
  book: Book;
  index?: number;
  small?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const cover = safeLink(book.cover);
  return (
    <div className={`book-cover cover-${index % 4} ${small ? "cover-small" : ""}`}>
      {cover && !failed ? (
        <img
          src={cover}
          alt={`${book.title} cover`}
          onError={() => setFailed(true)}
          loading="lazy"
        />
      ) : (
        <div className="cover-lettering">
          <span className="cover-ornament">✦</span>
          <span className="cover-book-title">{book.title}</span>
          <span className="cover-rule" />
          <span className="cover-author">{book.author}</span>
          <span className="cover-ornament">❦</span>
        </div>
      )}
    </div>
  );
}
export function BookForm({
  book,
  onSave,
  onCancel,
}: {
  book?: Book | undefined;
  onSave: (book: Book) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Book>(
    book ?? {
      id: newId(),
      title: "",
      author: "",
      status: "reading",
      current: 0,
      total: 300,
      rating: 0,
      review: "",
      cover: "",
    },
  );
  function field<K extends keyof Book>(key: K, value: Book[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }
  return (
    <form
      className="journal-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          ...draft,
          title: draft.title.trim(),
          author: draft.author.trim(),
          current: Math.min(draft.current, draft.total),
          finishedAt: draft.status === "finished" ? draft.finishedAt || localDate() : "",
        });
      }}
    >
      <Field label="Book title">
        <input
          autoFocus
          required
          value={draft.title}
          onChange={(e) => field("title", e.target.value)}
          placeholder="A new world to step into…"
        />
      </Field>
      <Field label="Author">
        <input
          required
          value={draft.author}
          onChange={(e) => field("author", e.target.value)}
          placeholder="Who wrote this world?"
        />
      </Field>
      <Field label="On my shelf">
        <select
          value={draft.status}
          onChange={(e) => field("status", e.target.value as BookStatus)}
        >
          {Object.entries(statusLabels).map(([s, label]) => (
            <option key={s} value={s}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <div className="form-row">
        <Field label="Current page">
          <input
            type="number"
            min="0"
            max={draft.total}
            required
            value={draft.current}
            onChange={(e) => field("current", Number(e.target.value))}
          />
        </Field>
        <Field label="Total pages">
          <input
            type="number"
            min="1"
            required
            value={draft.total}
            onChange={(e) => field("total", Number(e.target.value))}
          />
        </Field>
      </div>
      {draft.status === "finished" && (
        <Field label="Date finished">
          <input
            type="date"
            required
            max={localDate()}
            value={draft.finishedAt || localDate()}
            onChange={(e) => field("finishedAt", e.target.value)}
          />
        </Field>
      )}
      <fieldset>
        <legend className="small-label">Your rating</legend>
        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map((n) => (
            <Button
              key={n}
              variant="ghost"
              size="icon"
              aria-label={`Rate ${n} stars`}
              aria-pressed={draft.rating === n}
              onClick={() => field("rating", draft.rating === n ? 0 : n)}
              type="button"
            >
              <Star className={draft.rating >= n ? "star-filled" : ""} />
            </Button>
          ))}
        </div>
      </fieldset>
      <Field label="Personal review">
        <textarea
          className="handwritten"
          rows={3}
          value={draft.review}
          onChange={(e) => field("review", e.target.value)}
          placeholder="The thoughts you want to keep…"
        />
      </Field>
      <Field label="Cover image URL · optional">
        <input
          type="url"
          value={draft.cover}
          onChange={(e) => field("cover", e.target.value)}
          placeholder="https://…"
        />
      </Field>
      <div className="form-actions">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="leather">
          <Feather />
          Save to my shelf
        </Button>
      </div>
    </form>
  );
}
export function BookCard({
  book,
  index,
  onEdit,
  onDelete,
  onUpdate,
}: {
  book: Book;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (book: Book) => void;
}) {
  const [page, setPage] = useState(book.current);
  const progress = book.total ? Math.min(100, (book.current / book.total) * 100) : 0;
  return (
    <article className="book-card">
      <BookCover book={book} index={index} />
      <div className="book-card-body">
        <span className="small-label">
          {book.status === "reading" ? "Between the pages" : statusLabels[book.status]}
        </span>
        <h3>{book.title}</h3>
        <p className="book-author">{book.author}</p>
        <div
          className="book-rating"
          aria-label={book.rating ? `${book.rating} out of 5 stars` : "Not rated"}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} className={book.rating >= n ? "star-filled" : ""} />
          ))}
        </div>
        {book.status === "reading" && (
          <>
            <div className="progress-line">
              <progress max="100" value={progress} />
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="page-update">
              <label className="sr-only" htmlFor={`page-${book.id}`}>
                Current page for {book.title}
              </label>
              <input
                id={`page-${book.id}`}
                type="number"
                min="0"
                max={book.total}
                value={page}
                onChange={(e) => setPage(Number(e.target.value))}
              />
              <span>/ {book.total} pages</span>
              <Button
                size="icon"
                variant="ghost"
                title="Save current page"
                aria-label={`Save current page for ${book.title}`}
                onClick={() =>
                  onUpdate({ ...book, current: Math.max(0, Math.min(page, book.total)) })
                }
              >
                <Check />
              </Button>
            </div>
          </>
        )}
        {book.review && <p className="book-review handwritten">{book.review}</p>}
        {book.status === "finished" && <span className="finished-stamp">Finished</span>}
        <div className="book-actions">
          {book.status === "reading" && (
            <Button
              variant="link"
              size="sm"
              onClick={() =>
                onUpdate({
                  ...book,
                  status: "finished",
                  current: book.total,
                  finishedAt: localDate(),
                })
              }
            >
              <Check />
              Mark finished
            </Button>
          )}
          {book.status === "want" && (
            <Button
              variant="link"
              size="sm"
              onClick={() => onUpdate({ ...book, status: "reading" })}
            >
              <BookOpen />
              Start reading
            </Button>
          )}
          <span className="action-spacer" />
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${book.title}`}
            title="Edit book"
            onClick={onEdit}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${book.title}`}
            title="Delete book"
            onClick={onDelete}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
    </article>
  );
}
export function Bookshelf({ journal, setJournal }: { journal: Journal; setJournal: SetJournal }) {
  const [editing, setEditing] = useState<Book | "new" | null>(null);
  const [filter, setFilter] = useState<BookStatus>("reading");
  const update = (book: Book) =>
    setJournal((j) => ({ ...j, books: j.books.map((b) => (b.id === book.id ? book : b)) }));
  function remove(book: Book) {
    if (confirm(`Remove “${book.title}” and its soundtracks from your shelf?`))
      setJournal((j) => ({
        ...j,
        books: j.books.filter((b) => b.id !== book.id),
        playlists: j.playlists.filter((p) => p.bookId !== book.id),
      }));
  }
  const books = journal.books.filter((b) => b.status === filter);
  return (
    <>
      <div className="page-section-heading">
        <div>
          <span className="small-label">Chapter I</span>
          <h2>My Bookshelf</h2>
        </div>
        <Button variant="leather" size="sm" onClick={() => setEditing("new")}>
          <Plus />
          Add a book
        </Button>
      </div>
      <p className="page-intro">Every book, a world. Every shelf, a little piece of you.</p>
      <div className="shelf-filters" role="group" aria-label="Book status">
        {(["reading", "want", "finished"] as BookStatus[]).map((s, i) => (
          <Button
            key={s}
            variant="paperTab"
            className={filter === s ? "selected" : ""}
            aria-pressed={filter === s}
            onClick={() => setFilter(s)}
          >
            <span aria-hidden="true">{["❀", "❦", "♧"][i]}</span>
            {statusLabels[s]}
            <span className="count-badge">
              {journal.books.filter((b) => b.status === s).length}
            </span>
          </Button>
        ))}
      </div>
      <div className="book-list">
        {books.map((b, i) => (
          <BookCard
            key={`${b.id}-${b.current}`}
            book={b}
            index={journal.books.indexOf(b)}
            onEdit={() => setEditing(b)}
            onDelete={() => remove(b)}
            onUpdate={update}
          />
        ))}
        {!books.length && (
          <div className="empty-state">
            <BookOpen />
            <h3>A little room for another world</h3>
            <p>Your {statusLabels[filter].toLowerCase()} shelf is waiting.</p>
            <Button variant="outline" onClick={() => setEditing("new")}>
              <Plus />
              Add a book
            </Button>
          </div>
        )}
      </div>
      <Flourish />
      <p className="page-closing handwritten">There is no such thing as too many books.</p>
      {editing && (
        <Modal
          title={editing === "new" ? "A new chapter begins" : "Between these pages"}
          onClose={() => setEditing(null)}
        >
          <BookForm
            book={editing === "new" ? undefined : editing}
            onCancel={() => setEditing(null)}
            onSave={(book) => {
              if (editing === "new") setJournal((j) => ({ ...j, books: [...j.books, book] }));
              else update(book);
              setFilter(book.status);
              setEditing(null);
            }}
          />
        </Modal>
      )}
    </>
  );
}
