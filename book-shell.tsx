import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  BookOpen,
  Music2,
  Flower2,
  Sprout,
  List,
  ChevronRight,
  ChevronLeft,
  Feather,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import libraryIllustration from "@/assets/library-still-life.jpg";
import { chapters, type Journal } from "./data";
import { Botanical, Flourish } from "./decorations";
import { readingStats } from "./goals";
const icons = [List, BookOpen, Music2, Flower2, Sprout];
const roman = ["", "I", "II", "III", "IV"];
const descriptions = [
  "A little place for your literary life.",
  "For the stories on your shelf, and the ones still waiting.",
  "For the melodies that live between the lines.",
  "For the words that bloom long after the last page.",
  "For little rituals, and all the worlds ahead.",
];

export function ChapterTabs({
  chapter,
  onChange,
}: {
  chapter: number;
  onChange: (n: number) => void;
}) {
  return (
    <nav className="chapter-tabs" aria-label="Book chapters">
      {chapters.map((name, i) => {
        const Icon = icons[i] ?? BookOpen;
        return (
          <Button
            variant="chapter"
            key={name}
            className={chapter === i ? "active" : ""}
            aria-current={chapter === i ? "page" : undefined}
            onClick={() => onChange(i)}
            onKeyDown={(e) => {
              if (
                ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"].includes(e.key)
              ) {
                e.preventDefault();
                const next =
                  e.key === "Home"
                    ? 0
                    : e.key === "End"
                      ? 4
                      : (i + (["ArrowDown", "ArrowRight"].includes(e.key) ? 1 : 4)) % 5;
                onChange(next);
                const nav = e.currentTarget.parentElement;
                const button = nav?.querySelectorAll<HTMLButtonElement>("button")[next];
                button?.focus();
              }
            }}
          >
            <Icon />
            <span>{name === "Contents" ? "Contents" : name}</span>
          </Button>
        );
      })}
    </nav>
  );
}
// Only the overlay rotates; both underlying pages retain their readable layout.
// The transform origin changes with direction, just like turning a real leaf.
export function PageFlip({ chapter, children }: { chapter: number; children: ReactNode }) {
  const previous = useRef(chapter);
  const [turn, setTurn] = useState<{ direction: string; key: number } | null>(null);
  useEffect(() => {
    if (previous.current !== chapter) {
      setTurn({ direction: chapter > previous.current ? "forward" : "backward", key: Date.now() });
      previous.current = chapter;
      const timer = window.setTimeout(() => setTurn(null), 780);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [chapter]);
  return (
    <div className="page-flip">
      {children}
      {turn && (
        <div key={turn.key} className={`turning-leaf ${turn.direction}`} aria-hidden="true">
          <div className="leaf-front">
            <Flourish />
          </div>
          <div className="leaf-back">
            <Flourish />
          </div>
        </div>
      )}
    </div>
  );
}
export function LeftPage({
  chapter,
  journal,
  onChange,
  onSelectBook,
}: {
  chapter: number;
  journal: Journal;
  onChange: (n: number) => void;
  onSelectBook: (id: string) => void;
}) {
  const stats = readingStats(journal);
  return (
    <section
      className={`book-page left-page ${chapter === 0 ? "contents-left" : ""}`}
      aria-label={`${chapters[chapter]} introduction`}
    >
      <div className="corner-flourish top-left" aria-hidden="true">
        ❧
      </div>
      <div className="page-topline">
        <span>A PERSONAL READING JOURNAL</span>
        <Feather size={14} />
      </div>
      <div className="left-page-title">
        <span className="chapter-eyebrow">
          {chapter === 0 ? "Welcome to your" : `Chapter ${roman[chapter]}`}
        </span>
        <h1>
          {chapter === 0
            ? "Reading Room"
            : chapters[chapter] === "Reading Goals"
              ? "Little Intentions"
              : chapters[chapter] === "Soundtracks"
                ? "The Soundtrack"
                : chapters[chapter] === "Quote Garden"
                  ? "Words in Bloom"
                  : "The Bookshelf"}
        </h1>
        <Flourish />
        <p>{descriptions[chapter]}</p>
      </div>
      {chapter === 0 ? (
        <>
          <div className="illustration-wrap">
            <img
              src={libraryIllustration}
              width={1024}
              height={1024}
              alt="An antique illustration of leather books, a candle and pressed roses"
            />
          </div>
          <p className="welcome-note handwritten">
            Come in. Find a comfortable corner.
            <br />
            There’s always another story waiting.
          </p>
        </>
      ) : chapter === 1 ? (
        <>
          <div className="wooden-bookshelf">
            <div className="shelf-books">
              {journal.books.map((b, i) => (
                <Button
                  variant="chapter"
                  key={b.id}
                  className={`book-spine spine-${i % 4}`}
                  title={`Open ${b.title}`}
                  onClick={() => onSelectBook(b.id)}
                >
                  <span>{b.title}</span>
                  <span className="spine-decoration">❦</span>
                </Button>
              ))}
              {!journal.books.length && (
                <span className="handwritten">A shelf full of possibilities…</span>
              )}
            </div>
            <div className="shelf-plank" />
            <div className="shelf-books shelf-lower">
              <div className="shelf-horizontal">
                <span>STORIES YET TO COME</span>
                <span>ONE MORE CHAPTER</span>
              </div>
              <Botanical />
            </div>
            <div className="shelf-plank" />
          </div>
          <p className="handwritten left-margin-note">
            A well-loved book is a well-travelled world.
          </p>
        </>
      ) : chapter === 2 ? (
        <>
          <div className="large-record">
            <div className="vinyl">
              <div className="vinyl-label">
                <Music2 />
                <span>The Reading Room</span>
                <span>33 ⅓ RPM</span>
              </div>
            </div>
            <span className="handwritten">A soundtrack for getting lost.</span>
          </div>
          <Botanical className="soundtrack-flower" />
        </>
      ) : chapter === 3 ? (
        <>
          <div className="garden-art">
            <Botanical />
            <Botanical />
            <Botanical />
            <span className="handwritten">Let the words take root.</span>
          </div>
          <div className="ink-note">
            <span className="quote-mark" aria-hidden="true">
              “
            </span>
            <p className="handwritten">
              Some words are not just read.
              <br />
              They are carried.
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="goals-illustration">
            <img
              src={libraryIllustration}
              width={1024}
              height={1024}
              loading="lazy"
              alt="A quiet reading ritual with books and a candle"
            />
          </div>
          <p className="handwritten welcome-note">
            Slow mornings. A few pages.
            <br />A little more room for yourself.
          </p>
        </>
      )}
      <div className="left-stats">
        {chapter === 0 || chapter === 1 ? (
          <>
            <div>
              <strong>{journal.books.length}</strong>
              <span>books on my shelf</span>
            </div>
            <span className="stat-separator">✦</span>
            <div>
              <strong>{journal.books.filter((b) => b.status === "reading").length}</strong>
              <span>worlds in progress</span>
            </div>
          </>
        ) : chapter === 2 ? (
          <>
            <div>
              <strong>{journal.playlists.length}</strong>
              <span>story soundtracks</span>
            </div>
            <span className="stat-separator">✦</span>
            <div>
              <strong>{journal.playlists.reduce((n, p) => n + p.tracks.length, 0)}</strong>
              <span>little melodies</span>
            </div>
          </>
        ) : chapter === 3 ? (
          <>
            <div>
              <strong>{journal.quotes.length}</strong>
              <span>words worth keeping</span>
            </div>
            <span className="stat-separator">✦</span>
            <div>
              <strong>{new Set(journal.quotes.flatMap((q) => q.tags)).size}</strong>
              <span>different feelings</span>
            </div>
          </>
        ) : (
          <>
            <div>
              <strong>{stats.finished}</strong>
              <span>books this year</span>
            </div>
            <span className="stat-separator">✦</span>
            <div>
              <strong>{stats.streak}</strong>
              <span>days of little moments</span>
            </div>
          </>
        )}
      </div>
      <div className="coffee-ring" aria-hidden="true" />
      <div className="page-bottom">
        <span>THE READING ROOM</span>
        <span>{String(chapter * 2 + 1).padStart(2, "0")}</span>
      </div>
      <div className="corner-flourish bottom-left" aria-hidden="true">
        ❧
      </div>
    </section>
  );
}
export function ContentsPage({
  journal,
  onChange,
}: {
  journal: Journal;
  onChange: (n: number) => void;
}) {
  const quote = journal.quotes.find((q) => !q.sample);
  return (
    <>
      <div className="contents-heading">
        <span className="small-label">A place to return to</span>
        <h2>Table of Contents</h2>
        <Flourish />
      </div>
      <div className="contents-list">
        {chapters.slice(1).map((name, i) => {
          const Icon = icons[i + 1] ?? BookOpen;
          return (
            <Button
              key={name}
              variant="paperTab"
              className="contents-link"
              onClick={() => onChange(i + 1)}
            >
              <span className="contents-icon">
                <Icon />
              </span>
              <span className="contents-link-body">
                <span className="contents-name">
                  {name === "Soundtracks"
                    ? "The Book Soundtrack"
                    : name === "Quote Garden"
                      ? "The Quote Garden"
                      : name === "Reading Goals"
                        ? "Gentle Reading Goals"
                        : "The Bookshelf"}
                </span>
                <span className="contents-description">
                  {
                    [
                      "Stories started, loved, and yet to come",
                      "A little music for every world",
                      "Words to press between the pages",
                      "Small steps. Wonderful journeys.",
                    ][i]
                  }
                </span>
              </span>
              <span className="dotted-leader" />
              <span className="contents-number">{String((i + 1) * 2 + 1).padStart(2, "0")}</span>
            </Button>
          );
        })}
      </div>
      <div className="moment-note">
        <span className="note-pin" />
        <span className="small-label">
          {quote ? "Quote of the moment" : "A note for the reader"}
        </span>
        <span className="quote-mark" aria-hidden="true">
          “
        </span>
        <p className="handwritten">
          {quote
            ? quote.text
            : "For the books we read, the worlds we visit, and the words we keep."}
        </p>
        <span className="note-signature handwritten">
          {quote ? quote.author || quote.book : "With love, your Reading Room"}
        </span>
        <Botanical />
      </div>
      <div className="contents-bottom">
        <Flourish />
        <p className="handwritten">Your next chapter is only a page turn away.</p>
      </div>
    </>
  );
}
export function BookShell({
  chapter,
  journal,
  onChange,
  onSelectBook,
  children,
}: {
  chapter: number;
  journal: Journal;
  onChange: (n: number) => void;
  onSelectBook: (id: string) => void;
  children: ReactNode;
}) {
  const [opening, setOpening] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setOpening(false), 1750);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <div className={`book-container ${opening ? "book-opening" : ""}`}>
      <div className="bookmark-ribbon" aria-hidden="true" />
      <div className="book-cover-base">
        <PageFlip chapter={chapter}>
          <div className="book-spread">
            <LeftPage
              chapter={chapter}
              journal={journal}
              onChange={onChange}
              onSelectBook={onSelectBook}
            />
            <div className="book-binding" aria-hidden="true" />
            <section className="book-page right-page" aria-label={chapters[chapter]}>
              <div className="corner-flourish top-right" aria-hidden="true">
                ❧
              </div>
              <div className="right-page-content" key={chapter}>
                {children}
              </div>
              <div className="page-bottom">
                <span>FOR THE LOVE OF STORIES</span>
                <span>{String(chapter * 2 + 2).padStart(2, "0")}</span>
              </div>
              <div className="corner-flourish bottom-right" aria-hidden="true">
                ❧
              </div>
            </section>
          </div>
        </PageFlip>
        <ChapterTabs chapter={chapter} onChange={onChange} />
      </div>
      {opening && (
        <div className="opening-cover" aria-hidden="true">
          <div>
            <span className="cover-ornament">❦</span>
            <h2>The Reading Room</h2>
            <p>
              For the books we read, the worlds we visit,
              <br />
              and the words we keep.
            </p>
            <Flourish />
          </div>
        </div>
      )}
      <div className="book-under-pages" aria-hidden="true" />
      <nav className="bottom-page-nav" aria-label="Turn pages">
        <Button
          variant="chapter"
          size="sm"
          disabled={chapter === 0}
          onClick={() => onChange(chapter - 1)}
        >
          <ChevronLeft />
          Previous chapter
        </Button>
        <span className="metadata">
          {chapter === 0 ? "THE BEGINNING" : `CHAPTER ${roman[chapter]}`}
        </span>
        <Button
          variant="chapter"
          size="sm"
          disabled={chapter === 4}
          onClick={() => onChange(chapter + 1)}
        >
          Next chapter
          <ChevronRight />
        </Button>
      </nav>
    </div>
  );
}
