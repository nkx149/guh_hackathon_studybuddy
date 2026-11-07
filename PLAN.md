Here's a plan for five people to turn the demo page into a minimum viable product.

## The MVP is one sentence

**A student speaks to a real voice coach, and their plan on screen updates live. The plan itself comes from a real AI call.**

Everything else stays exactly as it is in the demo: Calendar, Societies, onboarding and Study Buddy.

## The architecture choice that saves you hours

Make the agent's actions **client tools**. ElevenLabs runs the conversation, and when the coach decides to tick a task off, it calls a function inside your React app. That function updates the task list directly.

This means you don't need a database or task API. The backend shrinks to two endpoints:

- one that creates a session for the agent, so your ElevenLabs key never reaches the browser
- one that calls OpenAI to generate a plan

## Agree these two things before anyone codes (first 15 minutes, everyone)

**1. Task format** (already used by the demo):

```js
{ id: "t1", title: "Outline essay", due: "2026-11-10T17:00:00", done: false, src: "plan" }
```

**2. Agent tools** (exact names and parameters):

| Tool | Parameters | What the app does |
| --- | --- | --- |
| `get_tasks` | none | Returns the task list and the demo clock's current time as JSON |
| `mark_done` | `task_id` | Ticks the task |
| `reschedule` | `task_id`, `new_due` | Moves the due date |
| `split_task` | `task_id`, `steps` (list of titles) | Replaces the task with smaller tasks |
| `escalate_wellbeing` | none | Shows the "handed over to a person" card |

The app also sends the student's **name** and **language** to the agent as variables when the conversation starts.

## Roles

**Person 1: Agent lead (ElevenLabs dashboard, no app code)**

- Create the **Coach** agent: write the system prompt (check-in style, short replies, uses `get_tasks` first) and pick the voice.
- Define the 5 client tools above with exactly those names and parameters.
- Add guardrail rules to the prompt: no writing assignments for students, and call `escalate_wellbeing` on any distress.
- Test in the dashboard's test panel until the conversation feels natural.
- Stretch: a **Tutor** agent with the recursion lecture PDF in its knowledge base.

**Person 2: Voice integration (frontend), owns `src/Coach.jsx`**

- Install the ElevenLabs React SDK (check its docs for the exact package name and hook).
- Replace the scripted check-in with a real conversation session: a start/stop button, live transcript, and the pulsing orb shown while the agent speaks.
- Write the 5 client-tool handlers so each one updates the tasks.
- Get the session URL from Person 3's `/api/agent-session`.

**Person 3: Backend, owns `server/`**

- A small Express server with `.env` holding both keys. Add `.env` to `.gitignore`, which is already done.
- `GET /api/agent-session` returns a signed URL for the Coach agent, using ElevenLabs' "Get signed URL" endpoint.
- `POST /api/plan` takes `{ goal, deadline, now }`, calls OpenAI with a JSON-only response format, and returns a list of `{ title, due }` steps. Validate the response and fall back to the current template plan if it fails.
- Add a proxy in `vite.config.js` so the frontend can call `/api/...` without CORS issues.
- Once both endpoints work, help Person 2.

**Person 4: Frontend structure and Planner, owns everything else in `src/`**

- **In the first 30 minutes, before anyone else edits code:**
  - Split `App.jsx` into `Login.jsx`, `Today.jsx`, `Coach.jsx`, `Planner.jsx`, `Calendar.jsx`, `StudyBuddy.jsx`, `Societies.jsx` and `data.js`.
  - Move `tasks` and the demo clock into a shared React context, so the coach's tool calls and the dashboard see the same data.
  - Push to GitHub. Everyone else pulls after this.
- Then wire the Planner's "Generate plan" button to `/api/plan`, with a loading state and an error message.
- Then polish: Today's summary counts, the overdue banner after fast-forward, and phone layout.

**Person 5: Pitch, QA and demo**

- Write the 3-minute demo script, with the exact words to say to the agent.
- Prepare the slides:
  - the problem
  - the persona
  - why voice
  - the architecture diagram, showing the multi-agent design as the roadmap
  - who pays
- Write and run test cases: "write my essay for me", an injection attempt, a distress message, an off-topic question. Report failures to Person 1.
- Compare voices with Person 1 on real speakers.
- Own the backup demo recording and the final rehearsals.

## Checkpoints

| When | Must be true | If not |
| --- | --- | --- |
| +0:30 | Repo split and pushed; keys in `.env`; agent created | Everyone helps Person 4 finish the split |
| +1:30 | `/api/agent-session` works and you can talk to the coach in the app, even without tools | Persons 3 and 4 join Person 2 |
| **+2:00** | **Saying "I finished the outline" turns the task green** | **Everyone stops and fixes this. It's the MVP.** |
| +2:45 | Planner generates a real plan; fast-forward, then the coach follows up on the missed task | Planner falls back to the template |
| +3:30 | **Feature freeze** | Cut anything unfinished |
| +3:30 to 5:00 | Guardrail tests, polish, record backup, rehearse twice | — |

## Rules to avoid merge conflicts

- Each person edits only the files they own. Agree changes to the shared context with Person 4 first.
- Work on short branches and merge to `main` at least every hour. `main` must always run.
- Nobody touches Calendar, Societies or Login. They're good enough as mocks.
