// The entire journal is one JSON object, making backups easy to understand.
export type BookStatus = "reading" | "want" | "finished";
export interface Book {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  current: number;
  total: number;
  rating: number;
  review: string;
  cover: string;
  finishedAt?: string;
  sample?: boolean;
}
export interface Track {
  name: string;
  url: string;
}
export interface Playlist {
  id: string;
  bookId: string;
  name: string;
  url: string;
  mood: string;
  scene: string;
  tracks: Track[];
  sample?: boolean;
}
export interface Quote {
  id: string;
  text: string;
  book: string;
  author: string;
  page: string;
  reflection: string;
  tags: string[];
  sample?: boolean;
}
export interface ReadingLog {
  date: string;
  pages: number;
  minutes: number;
}
export interface Journal {
  books: Book[];
  playlists: Playlist[];
  quotes: Quote[];
  goals: {
    daily: number;
    weekly: number;
    annual: number;
    minutes: number;
    mode: "pages" | "minutes";
  };
  logs: ReadingLog[];
}
export const chapters = ["Contents", "Bookshelf", "Soundtracks", "Quote Garden", "Reading Goals"];
export const statusLabels: Record<BookStatus, string> = {
  reading: "Currently Reading",
  want: "Want to Read",
  finished: "Finished Reading",
};
export function localDate(date = new Date()) {
  const y = date.getFullYear();
  return `${y}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function newId() {
  return crypto.randomUUID();
}
export function safeLink(url: string) {
  try {
    const parsed = new URL(url);
    return ["https:", "http:"].includes(parsed.protocol) ? parsed.href : "";
  } catch {
    return "";
  }
}
export function initialJournal(): Journal {
  return {
    books: [
      {
        id: "sample-laura",
        title: "The Last Thing He Told Me",
        author: "Laura Dave",
        status: "reading",
        current: 86,
        total: 320,
        rating: 0,
        review: "",
        cover: "",
        sample: true,
      },
      {
        id: "sample-holly",
        title: "A Good Girl’s Guide to Murder",
        author: "Holly Jackson",
        status: "reading",
        current: 124,
        total: 400,
        rating: 0,
        review: "",
        cover: "",
        sample: true,
      },
    ],
    playlists: [
      {
        id: "sample-playlist-1",
        bookId: "sample-laura",
        name: "Between the lines",
        url: "",
        mood: "Tense, quiet thriller ambience",
        scene: "",
        tracks: [],
        sample: true,
      },
      {
        id: "sample-playlist-2",
        bookId: "sample-holly",
        name: "After the town falls asleep",
        url: "",
        mood: "Small-town mystery, late-night study vibes",
        scene: "",
        tracks: [],
        sample: true,
      },
    ],
    quotes: [
      {
        id: "sample-quote-1",
        text: "Replace with your own quote",
        book: "The Last Thing He Told Me",
        author: "Laura Dave",
        page: "",
        reflection: "A little space for the words that stay with you.",
        tags: ["hope"],
        sample: true,
      },
      {
        id: "sample-quote-2",
        text: "Replace with your own quote",
        book: "A Good Girl’s Guide to Murder",
        author: "Holly Jackson",
        page: "",
        reflection: "What did this passage make you feel?",
        tags: ["comfort"],
        sample: true,
      },
    ],
    goals: { daily: 20, weekly: 140, annual: 12, minutes: 20, mode: "pages" },
    logs: [],
  };
}
// Validate a backup before replacing anything. Invalid files never touch the journal.
export function isJournal(value: unknown): value is Journal {
  if (!value || typeof value !== "object") return false;
  const v = value as Journal;
  const str = (x: unknown) => typeof x === "string";
  const num = (x: unknown) => typeof x === "number" && Number.isFinite(x) && x >= 0;
  return (
    Array.isArray(v.books) &&
    v.books.every(
      (b) =>
        b &&
        str(b.id) &&
        str(b.title) &&
        str(b.author) &&
        ["reading", "want", "finished"].includes(b.status) &&
        num(b.current) &&
        num(b.total) &&
        b.total > 0 &&
        b.current <= b.total &&
        num(b.rating) &&
        b.rating <= 5 &&
        str(b.review) &&
        str(b.cover) &&
        (b.finishedAt === undefined || str(b.finishedAt)),
    ) &&
    Array.isArray(v.playlists) &&
    v.playlists.every(
      (p) =>
        p &&
        str(p.id) &&
        str(p.bookId) &&
        str(p.name) &&
        str(p.url) &&
        str(p.mood) &&
        str(p.scene) &&
        Array.isArray(p.tracks) &&
        p.tracks.every((t) => t && str(t.name) && str(t.url)),
    ) &&
    Array.isArray(v.quotes) &&
    v.quotes.every(
      (q) =>
        q &&
        str(q.id) &&
        str(q.text) &&
        str(q.book) &&
        str(q.author) &&
        str(q.page) &&
        str(q.reflection) &&
        Array.isArray(q.tags) &&
        q.tags.every(str),
    ) &&
    new Set(v.books.map((b) => b.id)).size === v.books.length &&
    new Set(v.playlists.map((p) => p.id)).size === v.playlists.length &&
    new Set(v.quotes.map((q) => q.id)).size === v.quotes.length &&
    v.playlists.every((p) => v.books.some((b) => b.id === p.bookId)) &&
    new Set(v.logs.map((l) => l.date)).size === v.logs.length &&
    !!v.goals &&
    ["daily", "weekly", "annual", "minutes"].every((k) => num(v.goals[k as "daily"])) &&
    ["pages", "minutes"].includes(v.goals.mode) &&
    Array.isArray(v.logs) &&
    v.logs.every(
      (l) =>
        l && str(l.date) && /^\d{4}-\d{2}-\d{2}$/.test(l.date) && num(l.pages) && num(l.minutes),
    )
  );
}
