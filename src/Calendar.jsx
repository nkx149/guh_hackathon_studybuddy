import { at, fmtDay, fmtTime, sameDay, statusOf, LECTURES, EVENTS } from "./data";

export default function Calendar({ tasks, now }) {
  const days = [...Array(7)].map((_, i) => at(i, 0));
  return (
    <>
      <div className="row-actions"><div><span className="label">Calendar</span><h1>This week</h1></div>
        <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap" }}><span className="pill info">Lecture</span><span className="pill neutral" style={{ background: "var(--accent-soft)", color: "var(--fg)" }}>Plan task</span><span className="pill warn">Society event</span><span className="mock-tag">timetable imported from sample .ics</span></div></div>
      <div className="week-wrap"><div className="week">
        {days.map(d => {
          const items = [
            ...LECTURES.filter(l => sameDay(at(l.d), d)).map(l => ({ k: "l" + l.title, t: at(l.d, l.h), cls: "lec", text: l.title })),
            ...EVENTS.filter(e => sameDay(at(e.d), d)).map(e => ({ k: "e" + e.title, t: at(e.d, e.h), cls: "soc", text: e.title })),
            ...tasks.filter(t => sameDay(t.due, d)).map(t => { const s = statusOf(t, now).key; return { k: t.id, t: t.due, cls: s === "done" ? "done" : s === "overdue" ? "over" : "task", text: t.title }; }),
          ].sort((a, b) => a.t - b.t);
          return (
            <div key={d.toISOString()} className={"day" + (sameDay(d, now) ? " today" : "")}>
              <div className="label">{fmtDay(d)}</div>
              {items.length === 0 && <span className="muted" style={{ fontSize: ".8rem" }}>Free</span>}
              {items.map(it => <div key={it.k} className={"ev " + it.cls}><span className="mono" style={{ fontSize: ".72rem" }}>{fmtTime(it.t)}</span><br />{it.text}</div>)}
            </div>);
        })}
      </div></div>
    </>
  );
}
