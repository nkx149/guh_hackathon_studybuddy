import { useState, useRef, useEffect } from "react";
import { DAY, fmtDay, nid, speak } from "./data";

export default function Coach({ profile, tasks, setTasks, now, voiceOn }) {
  const [log, setLog] = useState([]);
  const [focus, setFocus] = useState(null);
  const [live, setLive] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const boxRef = useRef(null);
  useEffect(() => { if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight; }, [log]);

  const agent = text => { setLog(l => [...l, { who: "agent", text }]); speak(text, voiceOn, "en-GB"); };
  const user = text => setLog(l => [...l, { who: "user", text }]);

  const pickFocus = () => {
    const open = tasks.filter(t => !t.done).sort((a, b) => a.due - b.due);
    return open.find(t => t.due < now) || open[0] || null;
  };

  const start = () => {
    const f = pickFocus(); setFocus(f); setLive(true); setLog([]); setEscalated(false);
    if (!f) { agent(`Morning ${profile.name}. Everything on your plan is done. Want to plan the next goal?`); return; }
    const late = f.due < now;
    agent(late
      ? `Morning ${profile.name}. “${f.title}” was due ${fmtDay(f.due)}. No judgement — how did it go?`
      : `Morning ${profile.name}. Today’s focus is “${f.title}”, due ${fmtDay(f.due)}. How’s it going so far?`);
  };

  const reply = kind => {
    if (!focus) return;
    if (kind === "done") {
      user("I finished it last night.");
      setTasks(ts => ts.map(t => t.id === focus.id ? { ...t, done: true } : t));
      const next = tasks.filter(t => !t.done && t.id !== focus.id).sort((a, b) => a.due - b.due)[0];
      agent(next ? `Brilliant, I’ve ticked it off. Next up is “${next.title}” on ${fmtDay(next.due)}. I’ll check in then.` : "Brilliant, that clears your list. Nice work.");
      setFocus(null);
    }
    if (kind === "partly") {
      user("I got about halfway.");
      const newDue = new Date(Math.max(now.getTime(), focus.due.getTime()) + DAY);
      setTasks(ts => ts.map(t => t.id === focus.id ? { ...t, due: newDue } : t));
      agent(`Halfway is real progress. I’ve moved it to ${fmtDay(newDue)}. Could you do a 45-minute block after your lecture today?`);
      setFocus(null);
    }
    if (kind === "blocked") {
      user("I’m stuck. I don’t know where to start.");
      const a = { id: nid(), title: `${focus.title}: list 3 questions you need answered`, due: new Date(now.getTime() + 6 * 3600000), done: false, src: "coach" };
      const b = { id: nid(), title: `${focus.title}: 25-minute first attempt`, due: new Date(now.getTime() + DAY), done: false, src: "coach" };
      setTasks(ts => [...ts.filter(t => t.id !== focus.id), a, b]);
      agent("That’s normal for this kind of task. I’ve split it into two smaller steps: list the questions you’re stuck on today, then a 25-minute first attempt tomorrow. Study Buddy can help with the questions.");
      setFocus(null);
    }
    if (kind === "struggling") {
      user("Honestly I’m really struggling and can’t cope right now.");
      agent("Thank you for telling me. That sounds hard, and you don’t have to deal with it alone. I’ve paused your reminders for today. I can connect you with your university’s wellbeing team now.");
      setEscalated(true); setFocus(null);
    }
  };

  return (
    <div className="panel voice">
      <div className="orb-row">
        <div className={"orb" + (live ? " live" : "")} aria-hidden="true"></div>
        <div style={{ minWidth: 0 }}>
          <h2>Daily check-in</h2>
          <p className="muted" style={{ fontSize: ".88rem" }}>A 60-second spoken stand-up with your coach. Replies update your plan.</p>
        </div>
      </div>
      <div className="row-actions">
        <button className="btn primary" onClick={start}>{live ? "Restart check-in" : "Start voice check-in"}</button>
        <span className="mock-tag">ElevenLabs agent · simulated</span>
      </div>
      {log.length > 0 && (
        <div className="transcript" ref={boxRef} aria-live="polite">
          {log.map((l, i) => <div key={i} className={"line " + l.who}><span className="who">{l.who === "agent" ? "Coach" : profile.name}</span>{l.text}</div>)}
        </div>
      )}
      {focus && (
        <div style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
          <span className="label">Simulate what the student says</span>
          <div className="replies">
            <button className="btn sm" onClick={() => reply("done")}>“I finished it”</button>
            <button className="btn sm" onClick={() => reply("partly")}>“About halfway”</button>
            <button className="btn sm" onClick={() => reply("blocked")}>“I’m stuck”</button>
            <button className="btn sm" onClick={() => reply("struggling")}>“I can’t cope”</button>
          </div>
        </div>
      )}
      {escalated && <Escalation />}
    </div>
  );
}

function Escalation() {
  return (
    <div className="alert bad" role="status">
      <b>Handed over to a person</b>
      <span>Coaching is paused. In the real product this shows your university’s wellbeing service and urgent-help contacts, and can notify a named adviser with the student’s consent.</span>
      <span className="mono" style={{ fontSize: ".8rem" }}>Wellbeing team: [university contact] · Urgent help: [local crisis line]</span>
    </div>
  );
}
