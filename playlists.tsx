import { useState } from "react";
import { Plus, Pencil, Trash2, ExternalLink, Music2, Feather, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Journal, type Playlist, newId, safeLink } from "./data";
import type { SetJournal } from "./books";
import { Modal, Field, Flourish } from "./decorations";
export function PlaylistRecord({
  playlist,
  book,
  onEdit,
  onDelete,
}: {
  playlist: Playlist;
  book: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const url = safeLink(playlist.url);
  return (
    <article className="playlist-record">
      <div className="record-art">
        <div className="vinyl">
          <div className="vinyl-label">
            <Music2 />
            <span>Side A</span>
          </div>
        </div>
        <span className="record-caption handwritten">{playlist.name}</span>
      </div>
      <div className="record-info">
        <span className="small-label">{book}</span>
        <h3>{playlist.name}</h3>
        <p>{playlist.mood}</p>
        {playlist.scene && <p className="handwritten scene-note">{playlist.scene}</p>}
        {playlist.tracks.length > 0 && (
          <ol className="track-list">
            {playlist.tracks.map((t, i) => (
              <li key={i}>
                <span className="metadata">{String(i + 1).padStart(2, "0")}</span>
                {safeLink(t.url) ? (
                  <a href={safeLink(t.url)} target="_blank" rel="noopener noreferrer">
                    {t.name}
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  <span>{t.name}</span>
                )}
              </li>
            ))}
          </ol>
        )}
        <div className="book-actions">
          {url ? (
            <Button asChild variant="leather" size="sm">
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink />
                Listen
              </a>
            </Button>
          ) : (
            <span className="metadata">A soundtrack still taking shape</span>
          )}
          <span className="action-spacer" />
          <Button
            variant="ghost"
            size="icon"
            title="Edit playlist"
            aria-label={`Edit ${playlist.name}`}
            onClick={onEdit}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Delete playlist"
            aria-label={`Delete ${playlist.name}`}
            onClick={onDelete}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
    </article>
  );
}
function PlaylistForm({
  playlist,
  journal,
  onSave,
  onCancel,
}: {
  playlist?: Playlist | undefined;
  journal: Journal;
  onSave: (p: Playlist) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Playlist>(
    playlist ?? {
      id: newId(),
      bookId: journal.books[0]?.id || "",
      name: "",
      url: "",
      mood: "",
      scene: "",
      tracks: [],
    },
  );
  const set = (key: keyof Playlist, value: string) => setDraft((d) => ({ ...d, [key]: value }));
  return (
    <form
      className="journal-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(draft);
      }}
    >
      <Field label="For which book?">
        <select required value={draft.bookId} onChange={(e) => set("bookId", e.target.value)}>
          <option value="">Choose a book</option>
          {journal.books.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Playlist name">
        <input
          required
          value={draft.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="What does this story sound like?"
        />
      </Field>
      <Field label="Playlist link · optional">
        <input
          type="url"
          value={draft.url}
          onChange={(e) => set("url", e.target.value)}
          placeholder="Spotify, YouTube, Apple Music…"
        />
      </Field>
      <Field label="The mood">
        <textarea
          rows={2}
          value={draft.mood}
          onChange={(e) => set("mood", e.target.value)}
          placeholder="Rain against the window, a mystery unfolding…"
        />
      </Field>
      <Field label="A scene or character">
        <textarea
          className="handwritten"
          rows={2}
          value={draft.scene}
          onChange={(e) => set("scene", e.target.value)}
          placeholder="Who or what does it remind you of?"
        />
      </Field>
      <div className="tracks-heading">
        <span className="small-label">The tracklist</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setDraft((d) => ({ ...d, tracks: [...d.tracks, { name: "", url: "" }] }))}
        >
          <Plus />
          Add a song
        </Button>
      </div>
      {draft.tracks.map((track, i) => (
        <div className="track-form" key={i}>
          <input
            aria-label={`Song ${i + 1} name`}
            required
            value={track.name}
            placeholder="Song name"
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                tracks: d.tracks.map((t, n) => (n === i ? { ...t, name: e.target.value } : t)),
              }))
            }
          />
          <input
            aria-label={`Song ${i + 1} link`}
            type="url"
            value={track.url}
            placeholder="Song link (optional)"
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                tracks: d.tracks.map((t, n) => (n === i ? { ...t, url: e.target.value } : t)),
              }))
            }
          />
          <Button
            variant="ghost"
            size="icon"
            type="button"
            aria-label={`Remove song ${i + 1}`}
            onClick={() => setDraft((d) => ({ ...d, tracks: d.tracks.filter((_, n) => n !== i) }))}
          >
            <X />
          </Button>
        </div>
      ))}
      <div className="form-actions">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="leather" type="submit">
          <Feather />
          Keep this soundtrack
        </Button>
      </div>
    </form>
  );
}
export function Soundtracks({ journal, setJournal }: { journal: Journal; setJournal: SetJournal }) {
  const [editing, setEditing] = useState<Playlist | "new" | null>(null);
  return (
    <>
      <div className="page-section-heading">
        <div>
          <span className="small-label">Chapter II</span>
          <h2>Book Soundtracks</h2>
        </div>
        <Button
          variant="leather"
          size="sm"
          disabled={!journal.books.length}
          onClick={() => setEditing("new")}
        >
          <Plus />
          Add a playlist
        </Button>
      </div>
      <p className="page-intro">For the melodies that belong between the lines.</p>
      <div className="playlist-groups">
        {journal.books
          .filter((b) => journal.playlists.some((p) => p.bookId === b.id))
          .map((b) => (
            <section key={b.id}>
              <h3 className="group-heading">{b.title}</h3>
              {journal.playlists
                .filter((p) => p.bookId === b.id)
                .map((p) => (
                  <PlaylistRecord
                    key={p.id}
                    playlist={p}
                    book={b.author}
                    onEdit={() => setEditing(p)}
                    onDelete={() => {
                      if (confirm(`Remove “${p.name}”?`))
                        setJournal((j) => ({
                          ...j,
                          playlists: j.playlists.filter((item) => item.id !== p.id),
                        }));
                    }}
                  />
                ))}
            </section>
          ))}
      </div>
      {!journal.playlists.length && (
        <div className="empty-state">
          <Music2 />
          <h3>A story has its own sound</h3>
          <p>
            {journal.books.length
              ? "Keep a playlist for your next reading evening."
              : "Add a book to your shelf first."}
          </p>
        </div>
      )}
      <Flourish />
      <p className="page-closing handwritten">Some stories are best read with a little music.</p>
      {editing && (
        <Modal
          title={editing === "new" ? "The sound of a story" : "A few notes to change"}
          onClose={() => setEditing(null)}
        >
          <PlaylistForm
            journal={journal}
            playlist={editing === "new" ? undefined : editing}
            onCancel={() => setEditing(null)}
            onSave={(p) => {
              setJournal((j) => ({
                ...j,
                playlists:
                  editing === "new"
                    ? [...j.playlists, p]
                    : j.playlists.map((item) => (item.id === p.id ? p : item)),
              }));
              setEditing(null);
            }}
          />
        </Modal>
      )}
    </>
  );
}
