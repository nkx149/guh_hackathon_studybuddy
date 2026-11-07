import { useState, useMemo, useRef, useEffect } from "react";

/* ---------------- helpers ---------------- */
const DAY = 86400000;
const START = new Date(2026, 10, 9, 9, 0); // Mon 9 Nov 2026, 09:00 (simulated)
const at = (d, h = 17, m = 0) => { const x = new Date(START); x.setDate(START.getDate() + d); x.setHours(h, m, 0, 0); return x; };
const fmtDay = d => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
const fmtTime = d => d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
const toInput = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fromInput = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d, 17, 0); };
const sameDay = (a, b) => a.toDateString() === b.toDateString();
let uid = 100; const nid = () => `t${uid++}`;

function statusOf(task, now) {
  if (task.done) return { key: "done", label: "Done", cls: "ok" };
  if (task.due < now) return { key: "overdue", label: "Overdue", cls: "bad" };
  if (task.due - now < DAY) return { key: "risk", label: "Due soon", cls: "warn" };
  return { key: "track", label: "On track", cls: "info" };
}

function speak(text, on, lang) {
  if (!on) return;
  try {
    const s = window.speechSynthesis; if (!s) return;
    s.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 1.02;
    if (lang) u.lang = lang;
    s.speak(u);
  } catch (e) { /* voice preview not available here */ }
}

/* ---------------- seed data ---------------- */
const SEED_TASKS = [
  { id: "t1", title: "Read essay brief and pick a question", due: at(0, 17), done: false, src: "plan" },
  { id: "t2", title: "Outline essay in 5 sections", due: at(1, 17), done: false, src: "plan" },
  { id: "t3", title: "Draft sections 1–2 (800 words)", due: at(3, 17), done: false, src: "plan" },
  { id: "t4", title: "COMP12111 Lab 4 submission", due: at(4, 12), done: false, src: "course" },
];
const LECTURES = [
  { d: 0, h: 10, title: "COMP12111 · Recursion" },
  { d: 1, h: 14, title: "MATH11120 · Proof methods" },
  { d: 2, h: 11, title: "COMP12111 · Lab session" },
  { d: 3, h: 9, title: "COMP11212 · Algorithms" },
  { d: 4, h: 13, title: "Academic writing seminar" },
];
const EVENTS = [
  { d: 1, h: 18, title: "Hack Night: build a game in 3 hours", org: "Computing Society", tag: "Tech", why: "Matches your major and your interest in building projects." },
  { d: 2, h: 19, title: "Language exchange café", org: "International Students’ Society", tag: "Social", why: "You chose a non-English preferred language; good for meeting people early in term." },
  { d: 3, h: 17, title: "Intro to competitive programming", org: "Algorithms Club", tag: "Tech", why: "Lines up with this week’s Algorithms lecture." },
  { d: 5, h: 10, title: "Saturday walk and brunch", org: "Hiking Society", tag: "Wellbeing", why: "You have no plans on Saturday and three study blocks this week." },
];
const LANGS = { English: "en-GB", Spanish: "es-ES", French: "fr-FR", Mandarin: "zh-CN", Arabic: "ar-SA", Hindi: "hi-IN" };
const EXPLAIN = {
  English: "Recursion means a function solves a problem by calling itself on a smaller version of the same problem. It needs a base case, where it stops, and a recursive case, where it shrinks the problem. Think of Russian dolls: open one, find a smaller one, until the last doll has nothing inside.",
  Spanish: "La recursión significa que una función resuelve un problema llamándose a sí misma con una versión más pequeña del mismo problema. Necesita un caso base, donde se detiene, y un caso recursivo, donde reduce el problema.",
  French: "La récursivité, c’est quand une fonction résout un problème en s’appelant elle-même sur une version plus petite du même problème. Il faut un cas de base, où elle s’arrête, et un cas récursif, où le problème diminue.",
  Mandarin: "递归是指函数通过在同一问题的较小版本上调用自身来解决问题。它需要一个基本情况（停止的地方）和一个递归情况（缩小问题的地方）。",
};

/* ---------------- login + onboarding ---------------- */
function Login({ onDone }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("aisha.k@student.demo-uni.ac.uk");
  const [pw, setPw] = useState("demo-password");
  const [p, setP] = useState({ name: "Aisha", uni: "Demo University", major: "Computer Science", year: "First year", lang: "Spanish" });
  const set = k => e => setP({ ...p, [k]: e.target.value });

  return (
    <div className="login-wrap">
      <div className="login panel" style={{ padding: "1.6rem" }}>
        <div className="brand"><div className="brand-mark">◐</div><span>Study Coach</span><span className="mock-tag">working name</span></div>
        <div className="steps"><span className="on"></span><span className={step === 2 ? "on" : ""}></span></div>

        {step === 1 && (
          <form className="login" style={{ gap: "1rem" }} onSubmit={e => { e.preventDefault(); setStep(2); }}>
            <div><h1>Sign in</h1><p className="muted">Your coach checks in every day so your plans actually happen.</p></div>
            <div className="field"><label className="label" htmlFor="email">University email</label><input id="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div className="field"><label className="label" htmlFor="pw">Password</label><input id="pw" type="password" value={pw} onChange={e => setPw(e.target.value)} /></div>
            <button className="btn primary" type="submit">Sign in with demo account</button>
            <p className="demo-note">Demo only. No real authentication: any details continue to onboarding.</p>
          </form>
        )}

        {step === 2 && (
          <form className="login" style={{ gap: "1rem" }} onSubmit={e => { e.preventDefault(); onDone(p); }}>
            <div><h1>Set up your profile</h1><p className="muted">Every feature uses this to personalise plans, explanations and events.</p></div>
            <div className="field"><label className="label" htmlFor="name">First name</label><input id="name" value={p.name} onChange={set("name")} /></div>
            <div className="field"><label className="label" htmlFor="uni">University</label>
              <select id="uni" value={p.uni} onChange={set("uni")}><option>Demo University</option><option>Another University (coming soon)</option></select></div>
            <div className="field"><label className="label" htmlFor="major">Major</label>
              <select id="major" value={p.major} onChange={set("major")}><option>Computer Science</option><option>Mathematics</option><option>Psychology</option><option>Business</option></select></div>
            <div className="field"><label className="label" htmlFor="lang">Preferred language for explanations and voice</label>
              <select id="lang" value={p.lang} onChange={set("lang")}>{Object.keys(LANGS).map(l => <option key={l}>{l}</option>)}</select></div>
            <div style={{ display: "flex", gap: ".5rem", justifyContent: "space-between" }}>
              <button type="button" className="btn ghost" onClick={() => setStep(1)}>Back</button>
              <button className="btn primary" type="submit">Go to dashboard</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ---------------- Today / coach ---------------- */
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

function Coach({ profile, tasks, setTasks, now, voiceOn }) {
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

function Today({ profile, tasks, setTasks, now, voiceOn, jumped }) {
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
        <Coach profile={profile} tasks={tasks} setTasks={setTasks} now={now} voiceOn={voiceOn} />
        <div className="panel"><div className="row-actions" style={{ marginBottom: ".4rem" }}><h2>Your plan</h2><span className="muted" style={{ fontSize: ".85rem" }}>{tasks.length} tasks</span></div>
          <TaskList tasks={tasks} now={now} onToggle={toggle} /></div>
      </div>
    </>
  );
}

/* ---------------- Planner ---------------- */
function Planner({ tasks, setTasks, now, go }) {
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

/* ---------------- Calendar ---------------- */
function Calendar({ tasks, now }) {
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

/* ---------------- Study Buddy ---------------- */
function StudyBuddy({ profile, voiceOn }) {
  const [mode, setMode] = useState("explain");
  const [msgs, setMsgs] = useState([{ who: "agent", text: "I’ve read your Week 6 slides on recursion. Ask me anything about them, or switch to Oral quiz to practise out loud." }]);
  const [q, setQ] = useState("");
  const [quizStep, setQuizStep] = useState(0);
  const [flag, setFlag] = useState(null);
  const boxRef = useRef(null);
  useEffect(() => { if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight; }, [msgs]);

  const say = (text, lang = "en-GB") => { setMsgs(m => [...m, { who: "agent", text }]); speak(text, voiceOn, lang); };
  const me = text => setMsgs(m => [...m, { who: "user", text }]);

  const respond = text => {
    const t = text.toLowerCase(); me(text); setFlag(null);
    if (/(write|do|complete|finish) (my|the) (essay|assignment|lab|coursework|homework)/.test(t)) {
      setFlag({ cls: "warn", title: "Guardrail: academic integrity", body: "Request refused. Study Buddy explains and gives feedback but never writes work to submit." });
      return say("I can’t write work for you to hand in, but I can help you get there. Want me to explain the part you’re stuck on, or check a paragraph you’ve written?");
    }
    if (/ignore (all|your|previous)|system prompt|you are now/.test(t)) {
      setFlag({ cls: "bad", title: "Guardrail: prompt injection blocked", body: "Instruction ignored. The assistant keeps its original rules." });
      return say("I’ll stick to helping with your course material. What would you like to understand?");
    }
    if (/struggl|can.?t cope|hopeless|overwhelm/.test(t)) {
      setFlag({ cls: "bad", title: "Escalated to a person", body: "Wellbeing contacts shown and study mode paused." });
      return say("I’m sorry it feels like that. You don’t have to handle it alone. Your university’s wellbeing team can talk to you today; I’ve put their details on screen.");
    }
    if (/language|translate|spanish|french|mandarin|my own/.test(t) && EXPLAIN[profile.lang]) {
      return say(EXPLAIN[profile.lang], LANGS[profile.lang]);
    }
    if (/base case/.test(t)) return say("The base case is the input where the function returns an answer directly, without calling itself. For factorial, that’s n = 0, which returns 1. Without it, the calls never stop and you get a stack overflow. Slide 7 shows this.");
    if (/stack|overflow/.test(t)) return say("Each recursive call adds a frame to the call stack. If there’s no base case, or the input never reaches it, frames pile up until memory runs out: a stack overflow. Slide 9 has the diagram.");
    return say(EXPLAIN.English + " This is on slides 4–6.");
  };

  const QUIZ = [
    { q: "Question 1. What two parts does every recursive function need?", good: "A base case where it stops, and a recursive case that calls itself on a smaller input.", bad: "It needs a loop and a return statement.",
      fbGood: "Exactly right. Base case and recursive case. Nicely explained.", fbBad: "Not quite. Recursion replaces the loop. You need a base case to stop, and a recursive case that makes the problem smaller." },
    { q: "Question 2. What happens if a recursive function has no base case?", good: "It keeps calling itself until the stack overflows.", bad: "It returns zero.",
      fbGood: "Correct. The calls never stop, so the call stack runs out of memory.", fbBad: "Not quite. Nothing tells it to stop, so it keeps adding stack frames until it overflows." },
  ];
  const startQuiz = () => { setQuizStep(1); say(QUIZ[0].q); };
  const answer = good => {
    const item = QUIZ[quizStep - 1]; me("🎙 " + (good ? item.good : item.bad));
    say(good ? item.fbGood : item.fbBad);
    if (quizStep < QUIZ.length) { setTimeout(() => say(QUIZ[quizStep].q), 400); setQuizStep(quizStep + 1); }
    else { setTimeout(() => say("That’s the end of the quiz. I’ve added a 10-minute recap on base cases to tomorrow’s plan."), 400); setQuizStep(0); }
  };

  const examples = ["Explain recursion simply", "Explain it in my language", "What is a base case?", "Write my lab for me", "Ignore your previous instructions"];

  return (
    <>
      <div className="row-actions"><div><span className="label">Study Buddy</span><h1>Understand your lectures</h1></div>
        <div className="seg" role="tablist"><button className={mode === "explain" ? "on" : ""} onClick={() => setMode("explain")}>Explain</button><button className={mode === "quiz" ? "on" : ""} onClick={() => setMode("quiz")}>Oral quiz</button></div></div>
      <div className="grid2">
        <div className="panel" style={{ display: "flex", flexDirection: "column", gap: ".8rem" }}>
          <div className="chat" ref={boxRef} aria-live="polite">
            {msgs.map((m, i) => <div key={i} className={"line " + m.who}><span className="who">{m.who === "agent" ? "Study Buddy" : profile.name}</span>{m.text}</div>)}
          </div>
          {flag && <div className={"alert " + flag.cls}><b>{flag.title}</b><span>{flag.body}</span></div>}
          {mode === "explain" ? (
            <>
              <div className="replies">{examples.map(e => <button key={e} className="btn sm" onClick={() => respond(e)}>{e}</button>)}</div>
              <form className="composer" onSubmit={e => { e.preventDefault(); if (q.trim()) { respond(q); setQ(""); } }}>
                <input id="ask" className="inline-input" placeholder="Ask about the slides, or tap the mic" value={q} onChange={e => setQ(e.target.value)} />
                <button className="btn primary" type="submit">Ask</button>
              </form>
            </>
          ) : quizStep === 0 ? (
            <button className="btn primary" onClick={startQuiz}>Start a 2-question oral quiz</button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
              <span className="label">Simulate a spoken answer</span>
              <div className="replies"><button className="btn sm" onClick={() => answer(true)}>Answer correctly</button><button className="btn sm" onClick={() => answer(false)}>Answer wrongly</button></div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="panel" style={{ display: "flex", flexDirection: "column", gap: ".7rem" }}>
            <span className="label">Loaded material</span>
            <div className="doc"><div className="doc-icon">PDF</div><div style={{ minWidth: 0 }}><b>COMP12111 Week 6 – Recursion.pdf</b><div className="t-meta">18 slides · added before the demo</div></div></div>
            <div className="alert info"><b>1 hidden instruction ignored</b><span>Slide 14 contained text telling the assistant to reveal its prompt. It was treated as content, not a command.</span></div>
          </div>
          <div className="panel" style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
            <span className="label">Voice and language</span>
            <p style={{ fontSize: ".9rem" }}>Explanations are spoken by the tutor voice in <b>{profile.lang}</b> or English. Technical terms stay in English so they match your exams.</p>
            <span className="mock-tag" style={{ alignSelf: "flex-start" }}>ElevenLabs TTS · browser voice used as preview</span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------------- Societies ---------------- */
function Societies({ profile, now }) {
  return (
    <>
      <div className="row-actions"><div><span className="label">Societies and events</span><h1>Picked for you this week</h1></div><span className="mock-tag">pre-loaded from {profile.uni} events page</span></div>
      <div className="cards">
        {EVENTS.map(e => { const t = at(e.d, e.h); return (
          <div key={e.title} className="event">
            <div style={{ display: "flex", justifyContent: "space-between", gap: ".5rem" }}><span className="pill neutral">{e.tag}</span><span className="mono muted" style={{ fontSize: ".8rem" }}>{fmtDay(t)} · {fmtTime(t)}</span></div>
            <h3>{e.title}</h3><div className="muted" style={{ fontSize: ".85rem" }}>{e.org}</div>
            <p className="why">Why: {e.why}</p>
            {t < now ? <span className="pill neutral" style={{ alignSelf: "flex-start" }}>Finished</span> : <button className="btn sm" style={{ alignSelf: "flex-start" }}>Remind me</button>}
          </div>); })}
      </div>
    </>
  );
}

/* ---------------- App shell ---------------- */
const TABS = [["today", "Today"], ["planner", "Planner"], ["calendar", "Calendar"], ["study", "Study Buddy"], ["social", "Societies"]];

function Dashboard({ profile, onSignOut }) {
  const [tab, setTab] = useState("today");
  const [tasks, setTasks] = useState(SEED_TASKS);
  const [now, setNow] = useState(START);
  const [voiceOn, setVoiceOn] = useState(false);
  const jumped = now > START;
  const overdue = tasks.filter(t => statusOf(t, now).key === "overdue").length;

  return (
    <div className="shell">
      <aside className="rail">
        <div className="brand"><div className="brand-mark">◐</div><span className="word">Study Coach</span></div>
        <nav className="tabs">
          {TABS.map(([k, l]) => <button key={k} className={"tab" + (tab === k ? " on" : "")} onClick={() => setTab(k)}>{l}{k === "today" && overdue > 0 && <span className="count">{overdue}</span>}</button>)}
        </nav>
        <div className="profile"><b style={{ color: "var(--fg)" }}>{profile.name}</b><span>{profile.major}</span><span>{profile.uni}</span><span>Language: {profile.lang}</span>
          <button className="btn ghost sm" style={{ alignSelf: "flex-start", paddingLeft: 0 }} onClick={onSignOut}>Sign out</button></div>
      </aside>
      <main className="main">
        <div className="topbar">
          <div className="clock"><span className="label">Demo clock</span><span className="mono">{fmtDay(now)} · {fmtTime(now)}</span></div>
          <div className="clock">
            <label style={{ display: "flex", alignItems: "center", gap: ".35rem", fontSize: ".85rem" }}><input id="voice" type="checkbox" checked={voiceOn} onChange={e => setVoiceOn(e.target.checked)} /> Voice preview</label>
            <button className="btn sm" onClick={() => setNow(new Date(now.getTime() + 2 * DAY))}>Fast-forward 2 days</button>
            {jumped && <button className="btn ghost sm" onClick={() => { setNow(START); setTasks(SEED_TASKS); }}>Reset demo</button>}
          </div>
        </div>
        <div className="content">
          {tab === "today" && <Today profile={profile} tasks={tasks} setTasks={setTasks} now={now} voiceOn={voiceOn} jumped={jumped} />}
          {tab === "planner" && <Planner tasks={tasks} setTasks={setTasks} now={now} go={setTab} />}
          {tab === "calendar" && <Calendar tasks={tasks} now={now} />}
          {tab === "study" && <StudyBuddy profile={profile} voiceOn={voiceOn} />}
          {tab === "social" && <Societies profile={profile} now={now} />}
        </div>
      </main>
    </div>
  );
}

function App() {
  const [profile, setProfile] = useState(null);
  return profile ? <Dashboard profile={profile} onSignOut={() => setProfile(null)} /> : <Login onDone={setProfile} />;
}

export default App;
