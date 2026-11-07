import { useRef, useState, useEffect } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { ASSIGNMENTS } from "./assignmentData";

const AGENT_ID = "agent_9401m6v9keh7e04rs7bwx0bam5fv"; // paste the Coach agent ID here

export default function Coach(props) {
  return (
    <ConversationProvider>
      <CoachPanel {...props} />
    </ConversationProvider>
  );
}

function CoachPanel({ profile, tasks, setTasks, now, focusAssignmentId, onFocusHandled }) {
  const [messages, setMessages] = useState([]); // [{ who: "agent" | "user", text }]
  const [error, setError] = useState("");
  const boxRef = useRef(null);

  // Refs so tool calls always read the latest state.
  const tasksRef = useRef(tasks); tasksRef.current = tasks;
  const nowRef = useRef(now); nowRef.current = now;

  const conversation = useConversation({
    // Tool names are case-sensitive and must match the ElevenLabs dashboard exactly.
    clientTools: {
      // The agent calls this first and waits for the answer, so it must return real data.
      get_tasks: () =>
        JSON.stringify({
          current_time: nowRef.current.toISOString(),
          tasks: tasksRef.current.map(t => ({
            id: t.id,
            title: t.title,
            due: new Date(t.due).toISOString(),
            done: t.done,
          })),
        }),
      get_assignment_details: () =>
        JSON.stringify(ASSIGNMENTS.map(a => ({ ...a, due: a.due.toISOString() }))),

      create_plan: ({ goal, steps_json, assignment_id } = {}) => {
        let steps;
        try { steps = typeof steps_json === "string" ? JSON.parse(steps_json) : steps_json; }
        catch { return "error: steps_json is not valid JSON"; }
        if (!Array.isArray(steps) || !steps.length) return "error: steps_json must be a non-empty array";
        const aId = assignment_id && assignment_id !== "none" ? assignment_id : null;
        const stamp = Date.now();
        const newTasks = [];
        for (const [i, s] of steps.entries()) {
          const due = new Date(s?.due);
          if (!s?.title || isNaN(due)) return `error: step ${i + 1} needs a title and an ISO due date`;
          newTasks.push({ id: `p${stamp}${i}`, title: s.title, due, done: false, src: "plan", assignmentId: aId });
        }
        setTasks(ts => [...ts, ...newTasks]);
        console.log("[tool] create_plan", aId, goal, newTasks);
        return `ok: added ${newTasks.length} steps`;
      },

      // Not wired up in this task: log only, so the agent does not hang.
      mark_done: p => { console.log("[tool] mark_done", p); return "ok"; },
      reschedule: p => { console.log("[tool] reschedule", p); return "ok"; },
      split_task: p => { console.log("[tool] split_task", p); return "ok"; },
      escalate_wellbeing: p => { console.log("[tool] escalate_wellbeing", p); return "ok"; },
    },

    // SDK v1.21: payload is { message, role: "user" | "agent", source (deprecated), event_id }.
    onMessage: msg => {
      console.log("[agent message]", msg);
      const text = msg?.message ?? "";
      const who = msg?.role === "user" || msg?.source === "user" ? "user" : "agent";
      if (text) setMessages(m => [...m, { who, text }]);
    },

    // SDK v1.21: onError(message: string, context?: any).
    onError: (message, context) => {
      console.error("[agent error]", message, context);
      setError("The voice connection failed. Check the agent ID and that authentication is off, then try again.");
    },
  });

  // Keep the newest message in view.
  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [messages]);

  const start = async (focusId = null) => {
    setError("");
    setMessages([]);
    if (AGENT_ID === "agent_xxxxxxxx") {
      setError("No agent ID set. Paste the Coach agent ID into AGENT_ID in src/Coach.jsx.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop()); // permission check only; the SDK opens its own stream
    } catch {
      setError("Microphone access is blocked. Allow it in the browser's site settings and try again.");
      return;
    }
    // SDK v1.21: startSession returns void (not a Promise). Connection failures arrive via onError.
    try {
      conversation.startSession({
        agentId: AGENT_ID,
        dynamicVariables: {
          user_name: profile.name,
          major: profile.major,
          preferred_language: profile.lang,
          focus_assignment_id: focusId || "none",
        },
      });
    } catch (e) {
      console.error(e);
      setError("Couldn't start the check-in. Check the agent ID and that authentication is off.");
    }
  };

  // Auto-start when arriving from the Assignments tab.
  // The ref guard stops React StrictMode (dev) from running this twice and opening two sessions.
  const autoStartedFor = useRef(null);
  useEffect(() => {
    if (!focusAssignmentId || conversation.status !== "disconnected") return;
    if (autoStartedFor.current === focusAssignmentId) return;
    autoStartedFor.current = focusAssignmentId;
    const id = focusAssignmentId;
    onFocusHandled?.();
    start(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusAssignmentId]);

  const status = conversation.status; // "disconnected" | "connecting" | "connected"

  return (
    <div className="panel voice">
      <div className="orb-row">
        <div className={"orb" + (conversation.isSpeaking ? " live" : "")} aria-hidden="true"></div>
        <div style={{ minWidth: 0 }}>
          <h2>Daily check-in</h2>
          <p className="muted" style={{ fontSize: ".88rem" }}>
            {status === "connected"
              ? (conversation.isSpeaking ? "Coach is speaking…" : conversation.isMuted ? "Mic muted — unmute to reply." : "Listening…")
              : "Talk to your coach about today's plan."}
          </p>
        </div>
      </div>

      <div className="row-actions">
        <button
          className="btn primary"
          disabled={status === "connecting"}
          onClick={() => (status === "connected" ? conversation.endSession() : start())}
        >
          {status === "connected" ? "End check-in" : status === "connecting" ? "Connecting…" : "Start voice check-in"}
        </button>
        {/* SDK: setMuted throws without an active session, so only show while connected. Mute resets on disconnect. */}
        {status === "connected" && (
          <button
            className={"mic-btn" + (conversation.isMuted ? " muted" : "")}
            aria-pressed={conversation.isMuted}
            aria-label={conversation.isMuted ? "Unmute microphone" : "Mute microphone"}
            title={conversation.isMuted ? "Unmute microphone" : "Mute microphone"}
            onClick={() => conversation.setMuted(!conversation.isMuted)}
          >
            {conversation.isMuted ? <MicOffIcon /> : <MicIcon />}
          </button>
        )}
        <span className="mock-tag">ElevenLabs agent · live</span>
      </div>

      {error && <div className="alert bad" role="alert">{error}</div>}

      {messages.length > 0 && (
        <div className="transcript" ref={boxRef} aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={"line " + m.who}>
              <span className="who">{m.who === "agent" ? "Coach" : profile.name}</span>
              {m.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const iconProps = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };

function MicIcon() {
  return (
    <svg {...iconProps}>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10v1a7 7 0 0 0 14 0v-1" />
      <line x1="12" y1="18" x2="12" y2="22" />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg {...iconProps}>
      <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
      <path d="M9 9v2a3 3 0 0 0 5.12 2.12" />
      <path d="M19 10v1a7 7 0 0 1-.64 2.9" />
      <path d="M16.95 16.95A7 7 0 0 1 5 11v-1" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

// Kept for the next task (show when escalate_wellbeing is called).
// eslint-disable-next-line no-unused-vars
function Escalation() {
  return (
    <div className="alert bad" role="status">
      <b>Handed over to a person</b>
      <span>Coaching is paused. In the real product this shows your university’s wellbeing service and urgent-help contacts, and can notify a named adviser with the student’s consent.</span>
      <span className="mono" style={{ fontSize: ".8rem" }}>Wellbeing team: [university contact] · Urgent help: [local crisis line]</span>
    </div>
  );
}
