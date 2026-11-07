import { useState } from "react";
import Login from "./Login";
import Today from "./Today";
import Planner from "./Planner";
import Calendar from "./Calendar";
import StudyBuddy from "./StudyBuddy";
import Societies from "./Societies";
import { TaskProvider, useTasks } from "./TaskContext";
import { DAY, fmtDay, fmtTime, statusOf, TABS } from "./data";

function Dashboard({ profile, onSignOut }) {
  const [tab, setTab] = useState("today");
  const [voiceOn, setVoiceOn] = useState(false);
  const { tasks, setTasks, now, setNow, resetDemo } = useTasks();
  const jumped = now > new Date(2026, 10, 9, 9, 0);
  const overdue = tasks.filter(task => statusOf(task, now).key === "overdue").length;

  return (
    <div className="shell">
      <aside className="rail">
        <div className="brand"><div className="brand-mark">◐</div><span className="word">Study Coach</span></div>
        <nav className="tabs">
          {TABS.map(([key, label]) => <button key={key} className={"tab" + (tab === key ? " on" : "")} onClick={() => setTab(key)}>{label}{key === "today" && overdue > 0 && <span className="count">{overdue}</span>}</button>)}
        </nav>
        <div className="profile"><b style={{ color: "var(--fg)" }}>{profile.name}</b><span>{profile.major}</span><span>{profile.uni}</span><span>Language: {profile.lang}</span>
          <button className="btn ghost sm" style={{ alignSelf: "flex-start", paddingLeft: 0 }} onClick={onSignOut}>Sign out</button></div>
      </aside>
      <main className="main">
        <div className="topbar">
          <div className="clock"><span className="label">Demo clock</span><span className="mono">{fmtDay(now)} · {fmtTime(now)}</span></div>
          <div className="clock">
            <label style={{ display: "flex", alignItems: "center", gap: ".35rem", fontSize: ".85rem" }}><input id="voice" type="checkbox" checked={voiceOn} onChange={e => setVoiceOn(e.target.checked)} /> Voice preview</label>
            <button className="btn sm" onClick={() => setNow(current => new Date(current.getTime() + 2 * DAY))}>Fast-forward 2 days</button>
            {jumped && <button className="btn ghost sm" onClick={resetDemo}>Reset demo</button>}
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

export default function App() {
  const [profile, setProfile] = useState(null);
  if (!profile) return <Login onDone={setProfile} />;
  return (
    <TaskProvider>
      <Dashboard profile={profile} onSignOut={() => setProfile(null)} />
    </TaskProvider>
  );
}
