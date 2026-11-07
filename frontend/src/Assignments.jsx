import { ASSIGNMENTS } from "./assignmentData";
import { fmtDay } from "./data";

export default function Assignments({ tasks, onPlan }) {
  return (
    <>
      <div><span className="label">Assignments</span><h1>Your assignments</h1></div>
      <div className="cards">
        {ASSIGNMENTS.map(a => {
          const n = tasks.filter(t => t.assignmentId === a.id).length;
          return (
            <div key={a.id} className="event">
              <span className="muted" style={{ fontSize: ".85rem" }}>{a.module}</span>
              <h3>{a.title}</h3>
              <span className="mono muted" style={{ fontSize: ".8rem" }}>Due {fmtDay(a.due)}</span>
              <p className="why">{a.brief.slice(0, 140)}…</p>
              <span className={"pill " + (n ? "info" : "neutral")} style={{ alignSelf: "flex-start" }}>
                {n ? `Planned · ${n} steps` : "Not planned yet"}
              </span>
              <button className="btn primary sm" style={{ alignSelf: "flex-start" }} onClick={() => onPlan(a.id)}>
                Plan with Coach
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
