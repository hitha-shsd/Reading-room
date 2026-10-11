import { useEffect, useRef, useState } from "react";
import { initialJournal, isJournal, type Journal } from "@/components/reading-room/data";
const STORAGE_KEY = "the-reading-room-v1";

// Read after hydration: the server and browser initially render the same pages.
// A single hook owns persistence, so chapters only need to update the journal.
export function useJournal() {
  const [journal, setJournal] = useState<Journal>(initialJournal);
  const unreadableSnapshot = useRef<Journal | null>(null);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (isJournal(parsed)) setJournal(parsed);
        else {
          unreadableSnapshot.current = journal;
          setStorageError(
            "Your saved journal could not be read. Your original browser data is preserved until you change the journal.",
          );
        }
      }
    } catch {
      unreadableSnapshot.current = journal;
      setStorageError(
        "Browser storage could not be read. Please export your journal to keep it safe.",
      );
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready || journal === unreadableSnapshot.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(journal));
    } catch {
      setStorageError("Your browser could not save these changes. Please export a backup.");
    }
  }, [journal, ready]);
  return { journal, setJournal, ready, storageError };
}
