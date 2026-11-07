# Study Coach MVP (hackathon prototype)

Clickable React prototype: demo login and onboarding, then a dashboard with
Today (voice check-in), Planner, Calendar, Study Buddy and Societies.
All data and AI replies are mocked.

## Run

    npm install
    npm run dev

Then open http://localhost:5173

## Where to plug in real services

- `Coach` in src/App.jsx: replace the scripted `reply()` branches with the ElevenLabs agent and its tool calls.
- `Planner.generate()`: replace the template plan with an LLM call that returns JSON steps.
- `StudyBuddy.respond()`: replace keyword matching with the tutor agent; keep the guardrail checks.
- `speak()`: swap browser speechSynthesis for ElevenLabs text-to-speech.
- Never put API keys in frontend code. Call the services from a small backend.

# guh_hackathon_studybuddy