import { useState, useRef, useEffect } from "react";
import { EXPLAIN, LANGS, speak } from "./data";

export default function StudyBuddy({ profile, voiceOn }) {
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
