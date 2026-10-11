import { useState } from "react";
import { Flame, Feather, CalendarDays, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Journal, localDate } from "./data";
import type { SetJournal } from "./books";
import { Field, Flourish } from "./decorations";
function Progress({
  value,
  goal,
  label,
  unit,
}: {
  value: number;
  goal: number;
  label: string;
  unit: string;
}) {
  return (
    <div className="goal-progress">
      <div>
        <span>{label}</span>
        <span className="metadata">
          {value} / {goal} {unit}
        </span>
      </div>
      <progress value={Math.min(value, goal)} max={Math.max(goal, 1)} />
    </div>
  );
}
export function readingStats(journal: Journal) {
  const today = localDate(),
    now = new Date();
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const todayLog = journal.logs.find((l) => l.date === today);
  const weekly = journal.logs
    .filter((l) => l.date >= localDate(monday) && l.date <= today)
    .reduce((sum, l) => sum + l.pages, 0);
  const finished = journal.books.filter(
    (b) => b.status === "finished" && b.finishedAt?.startsWith(String(now.getFullYear())),
  ).length;
  const active = new Set(
    journal.logs.filter((l) => l.pages > 0 || l.minutes > 0).map((l) => l.date),
  );
  let streak = 0;
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!active.has(today)) day.setDate(day.getDate() - 1);
  while (active.has(localDate(day))) {
    streak++;
    day.setDate(day.getDate() - 1);
  }
  return { todayLog, weekly, finished, streak, active };
}
export function GoalTracker({ journal, setJournal }: { journal: Journal; setJournal: SetJournal }) {
  const [pages, setPages] = useState(0),
    [minutes, setMinutes] = useState(0),
    [saved, setSaved] = useState(false);
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const stats = readingStats(journal),
    goals = journal.goals;
  const updateGoal = (key: keyof Journal["goals"], value: number | string) =>
    setJournal((j) => ({ ...j, goals: { ...j.goals, [key]: value } }));
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate(),
    offset = (month.getDay() + 6) % 7;
  return (
    <>
      <div className="page-section-heading">
        <div>
          <span className="small-label">Chapter IV</span>
          <h2>Gentle Reading Goals</h2>
        </div>
        <span className="little-flower" aria-hidden="true">
          ❀
        </span>
      </div>
      <p className="page-intro">Not a race. Just a little ritual, one page at a time.</p>
      <section className="planner-section">
        <h3>My little intentions</h3>
        <div className="mode-switch" role="group" aria-label="Daily reading goal type">
          <Button
            variant="paperTab"
            className={goals.mode === "pages" ? "selected" : ""}
            aria-pressed={goals.mode === "pages"}
            onClick={() => updateGoal("mode", "pages")}
          >
            Pages today
          </Button>
          <Button
            variant="paperTab"
            className={goals.mode === "minutes" ? "selected" : ""}
            aria-pressed={goals.mode === "minutes"}
            onClick={() => updateGoal("mode", "minutes")}
          >
            Minutes today
          </Button>
        </div>
        <div className="goal-inputs">
          <Field label={goals.mode === "pages" ? "Daily pages" : "Daily minutes"}>
            <input
              type="number"
              min="1"
              value={goals.mode === "pages" ? goals.daily : goals.minutes}
              onChange={(e) =>
                updateGoal(
                  goals.mode === "pages" ? "daily" : "minutes",
                  Math.max(1, Number(e.target.value)),
                )
              }
            />
          </Field>
          <Field label="Weekly pages">
            <input
              type="number"
              min="1"
              value={goals.weekly}
              onChange={(e) => updateGoal("weekly", Math.max(1, Number(e.target.value)))}
            />
          </Field>
          <Field label="Books this year">
            <input
              type="number"
              min="1"
              value={goals.annual}
              onChange={(e) => updateGoal("annual", Math.max(1, Number(e.target.value)))}
            />
          </Field>
        </div>
        <Progress
          label="A little reading today"
          value={goals.mode === "pages" ? stats.todayLog?.pages || 0 : stats.todayLog?.minutes || 0}
          goal={goals.mode === "pages" ? goals.daily : goals.minutes}
          unit={goals.mode}
        />
        <Progress label="This week’s pages" value={stats.weekly} goal={goals.weekly} unit="pages" />
        <Progress
          label="Worlds visited this year"
          value={stats.finished}
          goal={goals.annual}
          unit="books"
        />
      </section>
      <section className="planner-section">
        <h3>Today, I found a little time</h3>
        <form
          className="log-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!pages && !minutes) return;
            const today = localDate();
            setJournal((j) => {
              const old = j.logs.find((l) => l.date === today);
              return {
                ...j,
                logs: [
                  ...j.logs.filter((l) => l.date !== today),
                  {
                    date: today,
                    pages: (old?.pages || 0) + pages,
                    minutes: (old?.minutes || 0) + minutes,
                  },
                ],
              };
            });
            setPages(0);
            setMinutes(0);
            setSaved(true);
          }}
        >
          <Field label="Pages read">
            <input
              type="number"
              min="0"
              required
              value={pages}
              onChange={(e) => {
                setPages(Math.max(0, Number(e.target.value)));
                setSaved(false);
              }}
            />
          </Field>
          <Field label="Minutes spent">
            <input
              type="number"
              min="0"
              required
              value={minutes}
              onChange={(e) => {
                setMinutes(Math.max(0, Number(e.target.value)));
                setSaved(false);
              }}
            />
          </Field>
          <Button variant="leather" type="submit" disabled={!pages && !minutes}>
            {saved ? <Check /> : <Feather />}
            {saved ? "Kept for today" : "Log my reading"}
          </Button>
        </form>
        <p className="handwritten encouragement" role="status">
          {saved
            ? "A little time with a book. That is something worth celebrating."
            : "A few pages still count. The story will wait for you."}
        </p>
      </section>
      <section className="planner-section">
        <div className="calendar-heading">
          <h3>
            <CalendarDays size={17} />A month of little moments
          </h3>
          <div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Previous month"
              onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
            >
              <ChevronLeft />
            </Button>
            <span className="metadata">
              {month.toLocaleDateString("en", { month: "long", year: "numeric" })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Next month"
              onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
        <div className="reading-calendar">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <span key={`label-${i}`} className="calendar-weekday metadata">
              {d}
            </span>
          ))}
          {Array.from({ length: offset }, (_, i) => (
            <span key={`blank-${i}`} />
          ))}
          {Array.from({ length: days }, (_, i) => {
            const date = localDate(new Date(month.getFullYear(), month.getMonth(), i + 1));
            return (
              <span
                key={date}
                className={`calendar-day ${stats.active.has(date) ? "read-day" : ""} ${date === localDate() ? "today" : ""}`}
                title={`${date}${stats.active.has(date) ? " · A little reading" : ""}`}
              >
                {i + 1}
                {stats.active.has(date) && <span aria-label="Reading logged">✿</span>}
              </span>
            );
          })}
        </div>
        <div className="streak-row">
          {Array.from({ length: 7 }, (_, i) => (
            <Flame key={i} className={i < Math.min(stats.streak, 7) ? "candle-lit" : ""} />
          ))}
          <span className="metadata">
            {stats.streak} {stats.streak === 1 ? "day" : "days"} of little moments
          </span>
        </div>
      </section>
      <Flourish />
    </>
  );
}
