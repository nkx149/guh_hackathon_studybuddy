import { useState } from "react";
import { LANGS } from "./data";

export default function Login({ onDone }) {
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
