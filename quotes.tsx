import { useState } from "react";
import { Plus, Pencil, Trash2, Flower2, Search, Feather } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Journal, type Quote, newId } from "./data";
import type { SetJournal } from "./books";
import { Botanical, Field, Modal, Flourish } from "./decorations";
const suggestedTags = ["comfort", "heartbreak", "hope", "existential crisis"];
export function QuoteCard({
  quote,
  onEdit,
  onDelete,
  blooming = false,
}: {
  quote: Quote;
  onEdit?: () => void;
  onDelete?: () => void;
  blooming?: boolean;
}) {
  return (
    <article className={`quote-card ${blooming ? "blooming" : ""}`}>
      <Botanical />
      <span className="quote-mark" aria-hidden="true">
        “
      </span>
      {quote.sample && (
        <span className="sample-label metadata">A placeholder for your own words</span>
      )}
      <blockquote className="drop-cap">{quote.text}</blockquote>
      <p className="quote-attribution">
        {quote.author && `${quote.author} · `}
        {quote.book}
        {quote.page && <span className="metadata"> · p. {quote.page}</span>}
      </p>
      {quote.reflection && <p className="handwritten reflection">{quote.reflection}</p>}
      <div className="quote-bottom">
        <div className="quote-tags">
          {quote.tags.map((t) => (
            <span className="wax-tag" key={t}>
              {t}
            </span>
          ))}
        </div>
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            title="Edit quote"
            aria-label="Edit quote"
            onClick={onEdit}
          >
            <Pencil />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            title="Delete quote"
            aria-label="Delete quote"
            onClick={onDelete}
          >
            <Trash2 />
          </Button>
        )}
      </div>
    </article>
  );
}
function QuoteForm({
  quote,
  journal,
  onSave,
  onCancel,
}: {
  quote?: Quote | undefined;
  journal: Journal;
  onSave: (q: Quote) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Quote>(
    quote ?? { id: newId(), text: "", book: "", author: "", page: "", reflection: "", tags: [] },
  );
  const [tags, setTags] = useState(draft.tags.join(", "));
  const set = (key: keyof Quote, value: string) => setDraft((d) => ({ ...d, [key]: value }));
  return (
    <form
      className="journal-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          ...draft,
          tags: [
            ...new Set(
              tags
                .split(",")
                .map((t) => t.trim().toLowerCase())
                .filter(Boolean),
            ),
          ],
          sample: false,
        });
      }}
    >
      <Field label="The words to keep">
        <textarea
          required
          rows={4}
          value={draft.text}
          onChange={(e) => set("text", e.target.value)}
          placeholder="A sentence that stayed with you…"
        />
      </Field>
      <div className="form-row">
        <Field label="Book">
          <input
            list="quote-books"
            value={draft.book}
            onChange={(e) => {
              set("book", e.target.value);
              const b = journal.books.find((b) => b.title === e.target.value);
              if (b) set("author", b.author);
            }}
            placeholder="Choose or write a book"
          />
          <datalist id="quote-books">
            {journal.books.map((b) => (
              <option key={b.id} value={b.title} />
            ))}
          </datalist>
        </Field>
        <Field label="Page · optional">
          <input
            type="number"
            min="1"
            value={draft.page}
            onChange={(e) => set("page", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Author">
        <input value={draft.author} onChange={(e) => set("author", e.target.value)} />
      </Field>
      <Field label="In the margins">
        <textarea
          rows={3}
          className="handwritten"
          value={draft.reflection}
          onChange={(e) => set("reflection", e.target.value)}
          placeholder="What did these words stir in you?"
        />
      </Field>
      <Field label="Tags · separated by commas">
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="comfort, hope, a quiet morning…"
        />
      </Field>
      <div className="suggested-tags">
        {suggestedTags.map((t) => (
          <Button
            type="button"
            variant="paperTab"
            size="sm"
            key={t}
            onClick={() =>
              setTags((old) =>
                [
                  ...new Set([
                    ...old
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                    t,
                  ]),
                ].join(", "),
              )
            }
          >
            {t}
          </Button>
        ))}
      </div>
      <div className="form-actions">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="leather">
          <Feather />
          Press between the pages
        </Button>
      </div>
    </form>
  );
}
export function QuoteGarden({ journal, setJournal }: { journal: Journal; setJournal: SetJournal }) {
  const [editing, setEditing] = useState<Quote | "new" | null>(null);
  const [search, setSearch] = useState(""),
    [tag, setTag] = useState(""),
    [book, setBook] = useState("");
  const [random, setRandom] = useState<Quote | null>(null);
  const tags = [...new Set(journal.quotes.flatMap((q) => q.tags))];
  const quotes = journal.quotes.filter(
    (q) =>
      (!tag || q.tags.includes(tag)) &&
      (!book || q.book === book) &&
      `${q.text} ${q.book} ${q.author} ${q.reflection} ${q.tags.join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="page-section-heading">
        <div>
          <span className="small-label">Chapter III</span>
          <h2>The Quote Garden</h2>
        </div>
        <Button variant="leather" size="sm" onClick={() => setEditing("new")}>
          <Plus />
          Keep a quote
        </Button>
      </div>
      <p className="page-intro">Words, gathered gently. A garden of things worth keeping.</p>
      <div className="quote-search">
        <div className="search-field">
          <Search size={16} />
          <input
            aria-label="Search quotes"
            placeholder="Find a few words…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          aria-label="Filter quotes by tag"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        >
          <option value="">All feelings</option>
          {tags.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select
          aria-label="Filter quotes by book"
          value={book}
          onChange={(e) => setBook(e.target.value)}
        >
          <option value="">All books</option>
          {[...new Set(journal.quotes.map((q) => q.book).filter(Boolean))].map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </div>
      <Button
        variant="outline"
        className="random-quote-button"
        disabled={!quotes.length}
        onClick={() => setRandom(quotes[Math.floor(Math.random() * quotes.length)] ?? null)}
      >
        <Flower2 />
        Pluck a random quote
      </Button>
      <div className="quote-list">
        {quotes.map((q) => (
          <QuoteCard
            key={q.id}
            quote={q}
            onEdit={() => setEditing(q)}
            onDelete={() => {
              if (confirm("Let this quote go?"))
                setJournal((j) => ({ ...j, quotes: j.quotes.filter((item) => item.id !== q.id) }));
            }}
          />
        ))}
      </div>
      {!quotes.length && (
        <div className="empty-state">
          <Flower2 />
          <h3>
            {journal.quotes.length
              ? "No words found here just yet"
              : "Your garden has room to grow"}
          </h3>
          <p>
            {journal.quotes.length
              ? "Try another feeling, book, or search."
              : "Keep the first words that speak to you."}
          </p>
        </div>
      )}
      <Flourish />
      {random && (
        <Modal title="A little something to return to" onClose={() => setRandom(null)}>
          <QuoteCard quote={random} blooming />
        </Modal>
      )}
      {editing && (
        <Modal
          title={editing === "new" ? "Words worth keeping" : "Tending the garden"}
          onClose={() => setEditing(null)}
        >
          <QuoteForm
            journal={journal}
            quote={editing === "new" ? undefined : editing}
            onCancel={() => setEditing(null)}
            onSave={(q) => {
              setJournal((j) => ({
                ...j,
                quotes:
                  editing === "new"
                    ? [...j.quotes, q]
                    : j.quotes.map((item) => (item.id === q.id ? q : item)),
              }));
              setEditing(null);
            }}
          />
        </Modal>
      )}
    </>
  );
}
