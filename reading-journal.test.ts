import { afterEach, describe, expect, it, vi } from "vitest";
import { initialJournal, isJournal, localDate, safeLink } from "@/components/reading-room/data";
import { readingStats } from "@/components/reading-room/goals";
afterEach(() => vi.useRealTimers());
describe("Reading Room journal", () => {
  it("has editable, honest samples and no invented quotes", () => {
    const journal = initialJournal();
    expect(isJournal(journal)).toBe(true);
    expect(journal.books).toHaveLength(2);
    expect(journal.quotes.every((q) => q.text === "Replace with your own quote")).toBe(true);
    expect(journal.playlists.every((p) => p.url === "")).toBe(true);
  });
  it("rejects malformed backups, duplicate ids and orphan playlists", () => {
    expect(isJournal(null)).toBe(false);
    expect(isJournal({ books: [] })).toBe(false);
    const journal = initialJournal();
    journal.books.push({
      ...journal.books[0],
      id: "sample-laura",
    } as (typeof journal.books)[number]);
    expect(isJournal(journal)).toBe(false);
    const orphan = initialJournal();
    orphan.books = [];
    expect(isJournal(orphan)).toBe(false);
  });
  it("allows only web links, never executable URLs", () => {
    expect(safeLink("javascript:alert(1)")).toBe("");
    expect(safeLink("https://open.spotify.com/playlist/example")).toContain("https://");
    expect(safeLink("")).toBe("");
  });
  it("counts this week, finished dates and a streak through yesterday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 11, 12));
    const journal = initialJournal();
    journal.logs = [
      { date: "2026-10-09", pages: 10, minutes: 0 },
      { date: "2026-10-10", pages: 20, minutes: 5 },
      { date: "2026-10-04", pages: 80, minutes: 0 },
    ];
    const first = journal.books[0];
    if (first) {
      first.status = "finished";
      first.finishedAt = "2026-01-01";
    }
    expect(readingStats(journal).weekly).toBe(30);
    expect(readingStats(journal).streak).toBe(2);
    expect(readingStats(journal).finished).toBe(1);
    expect(localDate()).toBe("2026-10-11");
  });
});
