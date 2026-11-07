import { at, fmtDay, fmtTime, EVENTS } from "./data";

export default function Societies({ profile, now }) {
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
