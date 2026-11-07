// Shared demo dates, formatting helpers and sample content.
export const DAY = 86400000;
export const START = new Date(2026, 10, 9, 9, 0); // Mon 9 Nov 2026, 09:00 (simulated)
export const at = (d, h = 17, m = 0) => { const x = new Date(START); x.setDate(START.getDate() + d); x.setHours(h, m, 0, 0); return x; };
export const fmtDay = d => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
export const fmtTime = d => d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
export const toInput = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const fromInput = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d, 17, 0); };
export const sameDay = (a, b) => a.toDateString() === b.toDateString();
let uid = 100;
export const nid = () => `t${uid++}`;

export function statusOf(task, now) {
  if (task.done) return { key: "done", label: "Done", cls: "ok" };
  if (task.due < now) return { key: "overdue", label: "Overdue", cls: "bad" };
  if (task.due - now < DAY) return { key: "risk", label: "Due soon", cls: "warn" };
  return { key: "track", label: "On track", cls: "info" };
}

export function speak(text, on, lang) {
  if (!on) return;
  try {
    const s = window.speechSynthesis;
    if (!s) return;
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.02;
    if (lang) u.lang = lang;
    s.speak(u);
  } catch (e) { /* voice preview not available here */ }
}

export const SEED_TASKS = [
  { id: "t1", title: "Read essay brief and pick a question", due: at(0, 17), done: false, src: "plan", assignmentId: "a1" },
  { id: "t2", title: "Outline essay in 5 sections", due: at(1, 17), done: false, src: "plan", assignmentId: "a1" },
  { id: "t3", title: "Draft sections 1–2 (800 words)", due: at(3, 17), done: false, src: "plan", assignmentId: "a1" },
  { id: "t4", title: "COMP12111 Lab 4 submission", due: at(4, 12), done: false, src: "course" },
];
export const LECTURES = [
  { d: 0, h: 10, title: "COMP12111 · Recursion" },
  { d: 1, h: 14, title: "MATH11120 · Proof methods" },
  { d: 2, h: 11, title: "COMP12111 · Lab session" },
  { d: 3, h: 9, title: "COMP11212 · Algorithms" },
  { d: 4, h: 13, title: "Academic writing seminar" },
];
export const EVENTS = [
  { d: 1, h: 18, title: "Hack Night: build a game in 3 hours", org: "Computing Society", tag: "Tech", why: "Matches your major and your interest in building projects." },
  { d: 2, h: 19, title: "Language exchange café", org: "International Students’ Society", tag: "Social", why: "You chose a non-English preferred language; good for meeting people early in term." },
  { d: 3, h: 17, title: "Intro to competitive programming", org: "Algorithms Club", tag: "Tech", why: "Lines up with this week’s Algorithms lecture." },
  { d: 5, h: 10, title: "Saturday walk and brunch", org: "Hiking Society", tag: "Wellbeing", why: "You have no plans on Saturday and three study blocks this week." },
];
export const LANGS = { English: "en-GB", Spanish: "es-ES", French: "fr-FR", Mandarin: "zh-CN", Arabic: "ar-SA", Hindi: "hi-IN" };
export const EXPLAIN = {
  English: "Recursion means a function solves a problem by calling itself on a smaller version of the same problem. It needs a base case, where it stops, and a recursive case, where it shrinks the problem. Think of Russian dolls: open one, find a smaller one, until the last doll has nothing inside.",
  Spanish: "La recursión significa que una función resuelve un problema llamándose a sí misma con una versión más pequeña del mismo problema. Necesita un caso base, donde se detiene, y un caso recursivo, donde reduce el problema.",
  French: "La récursivité, c’est quand une fonction résout un problème en s’appelant elle-même sur une version plus petite du même problème. Il faut un cas de base, où elle s’arrête, et un cas récursif, où le problème diminue.",
  Mandarin: "递归是指函数通过在同一问题的较小版本上调用自身来解决问题。它需要一个基本情况（停止的地方）和一个递归情况（缩小问题的地方）。",
};

export const TABS = [["today", "Today"], ["assignments", "Assignments"], ["calendar", "Calendar"], ["study", "Study Buddy"], ["social", "Societies"]];
