import { useState } from "react";
import { DAY, fromInput, nid, toInput } from "./data";

export default function Planner({ tasks, setTasks, now, go }) {
  const [goal, setGoal] = useState("I have a 2,000-word history of computing essay due in two weeks and I keep putting it off.");
  const [deadline, setDeadline] = useState(toInput(new Date(now.getTime() + 14 * DAY)));
  const [plan, setPlan] = useState(null);
  const [thinking, setThinking] = useState(false);
  const [saved, setSaved] = useState(false);

  const generate = () => {
    setThinking(true); setSaved(false);
    setTimeout(() => {
      const end = fromInput(deadline); const span = Math.max(3, Math.round((end - now) / DAY));
      const steps = ["Read the brief and choose a question", "Find 5 sources and note key points", "Write a 5-section outline", "Draft the first half", "Draft the second half", "Edit, reference and proofread", "Submit"];
      setPlan(steps.map((s, i) => ({ id: nid(), title: s, due: new Date(now.getTime() + Math.round(span * (i + 1) / steps.length) * DAY) })));
      setThinking(false);
    }, 700);
  };
  const edit = (id, k, v) => setPlan(p => p.map(s => s.id === id ? { ...s, [k]: v } : s));
  const save = () => {
    const items = plan.filter(s => s.title.trim()).map(s => ({ ...s, done: false, src: "plan" }));
    setTasks(ts => [...ts.filter(t => t.src !== "plan"), ...items]); setSaved(true);
  };

  return (
    <>
      <div><span className="label">Planner</span><h1>Turn a goal into a plan</h1><p className="muted">Describe what you need to get done. You can also say it to your coach by voice.</p></div>
      <div className="panel" style={{ display: "flex", flexDirection: "column", gap: ".8rem" }}>
        <div className="field"><label className="label" htmlFor="goal">Goal or problem</label><textarea id="goal" rows="3" value={goal} onChange={e => setGoal(e.target.value)} /></div>
        <div className="row-actions">
          <div className="field" style={{ maxWidth: 220 }}><label className="label" htmlFor="dl">Deadline</label><input id="dl" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} /></div>
          <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}><span className="mock-tag">AI response mocked</span><button className="btn primary" onClick={generate} disabled={thinking}>{thinking ? "Planning…" : "Generate plan"}</button></div>
        </div>
      </div>
      {plan && (
        <div className="panel">
          <div className="row-actions" style={{ marginBottom: ".5rem" }}><h2>Proposed plan</h2><span className="muted" style={{ fontSize: ".85rem" }}>Edit anything before saving</span></div>
          {plan.map((s, i) => (
            <div className="plan-row" key={s.id}>
              <span className="mono muted">{i + 1}</span>
              <input className="inline-input" id={"step-" + s.id} value={s.title} onChange={e => edit(s.id, "title", e.target.value)} />
              <input className="inline-input" id={"date-" + s.id} type="date" value={toInput(s.due)} onChange={e => edit(s.id, "due", fromInput(e.target.value))} />
              <button className="btn ghost sm" aria-label="Remove step" onClick={() => setPlan(p => p.filter(x => x.id !== s.id))}>Remove</button>
            </div>))}
          <div className="row-actions" style={{ marginTop: ".8rem" }}>
            <button className="btn sm" onClick={() => setPlan(p => [...p, { id: nid(), title: "New step", due: new Date(now.getTime() + 2 * DAY) }])}>Add step</button>
            <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
              {saved && <span className="pill ok">Saved to calendar and check-ins</span>}
              {saved ? <button className="btn" onClick={() => go("calendar")}>View calendar</button> : <button className="btn primary" onClick={save}>Save plan</button>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
