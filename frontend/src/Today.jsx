import { useMemo } from "react";
import Coach from "./Coach";
import { fmtDay, fmtTime, statusOf } from "./data";

function TaskList({ tasks, now, onToggle }) {
  const sorted = [...tasks].sort((a, b) => (a.done - b.done) || (a.due - b.due));
  return (
    <div className="tasks">
      {sorted.map(t => { const s = statusOf(t, now); return (
        <div key={t.id} className={"task" + (t.done ? " is-done" : "")}>
          <button className={"check" + (t.done ? " done" : "")} aria-label={t.done ? "Mark not done" : "Mark done"} onClick={() => onToggle(t.id)}>{t.done ? "✓" : ""}</button>
          <div style={{ minWidth: 0 }}><div className="t-title">{t.title}</div><div className="t-meta mono">Due {fmtDay(t.due)} · {fmtTime(t.due)}</div></div>
          <span className={"pill " + s.cls}>{s.label}</span>
        </div>); })}
    </div>
  );
}

export default function Today({ profile, tasks, setTasks, now, voiceOn, jumped, focusAssignmentId, onFocusHandled }) {
  const counts = useMemo(() => {
    const c = { done: 0, overdue: 0, risk: 0, track: 0 };
    tasks.forEach(t => c[statusOf(t, now).key]++); return c;
  }, [tasks, now]);
  const toggle = id => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  return (
    <>
      <div><span className="label">{fmtDay(now)}</span><h1>Good morning, {profile.name}</h1></div>
      {jumped && counts.overdue > 0 && (
        <div className="alert warn"><b>{counts.overdue} task{counts.overdue > 1 ? "s" : ""} missed while you were away</b><span>Your coach has a follow-up ready. Start the check-in to replan.</span></div>
      )}
      <div className="stats">
        <div className="stat"><span className="label">On track</span><b>{counts.track}</b></div>
        <div className="stat"><span className="label">Due soon</span><b style={{ color: "var(--warn)" }}>{counts.risk}</b></div>
        <div className="stat"><span className="label">Overdue</span><b style={{ color: "var(--bad)" }}>{counts.overdue}</b></div>
        <div className="stat"><span className="label">Done</span><b style={{ color: "var(--ok)" }}>{counts.done}</b></div>
      </div>
      <div className="grid2">
        <Coach profile={profile} tasks={tasks} setTasks={setTasks} now={now} voiceOn={voiceOn} focusAssignmentId={focusAssignmentId} onFocusHandled={onFocusHandled} />
        <div className="panel"><div className="row-actions" style={{ marginBottom: ".4rem" }}><h2>Your plan</h2><span className="muted" style={{ fontSize: ".85rem" }}>{tasks.length} tasks</span></div>
          <TaskList tasks={tasks} now={now} onToggle={toggle} /></div>
      </div>
    </>
  );
}
