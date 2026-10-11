import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  BookOpen,
  Download,
  Upload,
  Archive,
  ChevronDown,
  Check,
  Feather,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJournal } from "@/hooks/use-journal";
import { isJournal, type Book } from "@/components/reading-room/data";
import { BookShell, ContentsPage } from "@/components/reading-room/book-shell";
import { Bookshelf, BookForm } from "@/components/reading-room/books";
import { Soundtracks } from "@/components/reading-room/playlists";
import { QuoteGarden } from "@/components/reading-room/quotes";
import { GoalTracker } from "@/components/reading-room/goals";
import { CoffeeCup, Modal } from "@/components/reading-room/decorations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Reading Room — Your personal reading journal" },
      {
        name: "description",
        content:
          "An antique-book reading journal for your bookshelf, book soundtracks, treasured quotes and gentle reading goals. Saved privately in your browser.",
      },
      { property: "og:title", content: "The Reading Room — Your personal reading journal" },
      {
        property: "og:description",
        content:
          "For the books we read, the worlds we visit, and the words we keep. Your own quiet reading room.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});
function Index() {
  const { journal, setJournal, ready, storageError } = useJournal();
  const [chapter, setChapter] = useState(0),
    [backup, setBackup] = useState(false),
    [message, setMessage] = useState("");
  const [selected, setSelected] = useState<Book | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  function changeChapter(n: number) {
    setChapter(n);
  }
  function exportData() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(journal, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `the-reading-room-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("Your stories, safely tucked into a backup.");
    setBackup(false);
  }
  async function importData(file?: File) {
    if (!file) return;
    try {
      const imported: unknown = JSON.parse(await file.text());
      if (!isJournal(imported)) throw new Error("invalid");
      if (confirm("Replace your current reading journal with this backup?")) {
        setJournal(imported);
        setMessage("Welcome back. Your journal has been restored.");
      }
    } catch {
      setMessage(
        "This file is not a valid Reading Room backup. Your journal has not been changed.",
      );
    }
    if (fileInput.current) fileInput.current.value = "";
    setBackup(false);
  }
  function clearSamples() {
    if (
      !confirm(
        "Remove the sample books, playlists and placeholder quotes? Your own entries will stay.",
      )
    )
      return;
    setJournal((j) => {
      const ids = new Set(j.books.filter((b) => b.sample).map((b) => b.id));
      return {
        ...j,
        books: j.books.filter((b) => !b.sample),
        playlists: j.playlists.filter((p) => !p.sample && !ids.has(p.bookId)),
        quotes: j.quotes.filter((q) => !q.sample),
      };
    });
    setMessage("A fresh page. All sample entries have been cleared.");
  }
  const hasSamples =
    journal.books.some((b) => b.sample) ||
    journal.playlists.some((p) => p.sample) ||
    journal.quotes.some((q) => q.sample);
  return (
    <main className="reading-desk">
      <header className="desk-header">
        <div className="brand-lockup">
          <div className="wax-seal">
            <BookOpen />
          </div>
          <div>
            <span className="brand-name">The Reading Room</span>
            <span className="brand-subtitle">A LITTLE HOME FOR YOUR LITERARY LIFE</span>
          </div>
        </div>
        <div className="header-right">
          <span className="saved-note">
            <span className="saved-dot" />
            {ready ? "Kept in your browser" : "Opening your journal"}
          </span>
          <div className="backup-control">
            <Button variant="chapter" onClick={() => setBackup((v) => !v)} aria-expanded={backup}>
              <Archive />
              Backup
              <ChevronDown />
            </Button>
            {backup && (
              <div className="backup-menu">
                <Button variant="chapter" onClick={exportData}>
                  <Download />
                  Export my data
                </Button>
                <Button variant="chapter" onClick={() => fileInput.current?.click()}>
                  <Upload />
                  Import a backup
                </Button>
              </div>
            )}
          </div>
          <input
            ref={fileInput}
            type="file"
            accept=".json,application/json"
            className="sr-only"
            aria-label="Import a journal backup"
            onChange={(e) => {
              void importData(e.target.files?.[0]);
            }}
          />
        </div>
      </header>
      <div className="desk-tagline">
        For the books we read, the worlds we visit, and the words we keep.
      </div>
      {(message || storageError) && (
        <div className="desk-message" role="status">
          <Check size={15} />
          <span>{storageError || message}</span>
          <Button
            variant="chapter"
            size="sm"
            onClick={() => setMessage("")}
            aria-label="Dismiss notification"
          >
            ×
          </Button>
        </div>
      )}
      <div className="desk-book-area">
        <BookShell
          chapter={chapter}
          journal={journal}
          onChange={changeChapter}
          onSelectBook={(id) => {
            const b = journal.books.find((b) => b.id === id);
            if (b) {
              setChapter(1);
              setSelected(b);
            }
          }}
        >
          {chapter === 0 ? (
            <ContentsPage journal={journal} onChange={changeChapter} />
          ) : chapter === 1 ? (
            <Bookshelf journal={journal} setJournal={setJournal} />
          ) : chapter === 2 ? (
            <Soundtracks journal={journal} setJournal={setJournal} />
          ) : chapter === 3 ? (
            <QuoteGarden journal={journal} setJournal={setJournal} />
          ) : (
            <GoalTracker journal={journal} setJournal={setJournal} />
          )}
        </BookShell>
        <CoffeeCup />
        <div className="desk-pen" aria-hidden="true">
          <Feather />
        </div>
      </div>
      <footer className="desk-footer">
        <span>
          <Feather size={14} />A quiet corner. A good book. A little time.
        </span>
        {hasSamples && (
          <Button variant="chapter" size="sm" onClick={clearSamples}>
            <Trash2 />
            Clear sample data
          </Button>
        )}
        <span className="footer-privacy">Just you and your stories.</span>
      </footer>
      {selected && (
        <Modal title="A book from your shelf" onClose={() => setSelected(null)}>
          <BookForm
            book={selected}
            onCancel={() => setSelected(null)}
            onSave={(book) => {
              setJournal((j) => ({
                ...j,
                books: j.books.map((b) => (b.id === book.id ? book : b)),
              }));
              setSelected(null);
            }}
          />
        </Modal>
      )}
    </main>
  );
}
