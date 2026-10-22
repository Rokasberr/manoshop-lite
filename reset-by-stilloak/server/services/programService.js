import { daysBetween, dateKey } from "../utils/dates.js";

const focuses = [
  "Create a clean starting point",
  "Win the first hour",
  "Remove one source of friction",
  "Move before motivation arrives",
  "Make your phone less interesting",
  "Eat and drink on purpose",
  "Review the first week",
  "Protect your attention",
  "Practice a slower impulse",
  "Finish one delayed task",
  "Build a repeatable evening",
  "Choose consistency over intensity",
  "Make healthy actions visible",
  "Reset after a difficult day",
  "Review without judging yourself",
  "Extend the no-scroll window",
  "Train a stronger pause",
  "Reduce decision fatigue",
  "Use movement to change your state",
  "Replace an old trigger",
  "Review the third week",
  "Do the important thing first",
  "Create a low-energy version",
  "Strengthen your sleep signal",
  "Choose your inputs carefully",
  "Make progress easy to see",
  "Plan for the next obstacle",
  "Prove you can restart quickly",
  "Design the routine you can keep",
  "Complete the reset, keep the system"
];

const challenges = [
  "Clear one surface and remove one distracting app from your first screen.",
  "Complete your morning routine before opening social media.",
  "Prepare tomorrow's water, clothes, or breakfast tonight.",
  "Take a 20-minute walk even if the pace is easy.",
  "Keep your phone outside reach for one focused 45-minute block.",
  "Eat one meal without a screen and notice when you feel full.",
  "Review your completed actions and choose one adjustment for next week.",
  "Turn off non-essential notifications for the rest of the reset.",
  "Delay one craving or scroll impulse by 10 minutes.",
  "Finish a task you have postponed for less than 30 minutes.",
  "Start your wind-down 30 minutes before bed.",
  "Do the smallest useful version of every core habit today.",
  "Place a book, shoes, or water where the next action begins.",
  "If the day slips, restart with the next single action.",
  "Compare this week with your baseline, not with a perfect week.",
  "Add 15 minutes to your longest no-scroll period.",
  "Name the trigger before acting on one urge.",
  "Decide tomorrow's three essential actions tonight.",
  "Use a short walk or stretch break when your energy drops.",
  "Replace one usual trigger with water, gum, breathing, or a small task.",
  "Identify the day that worked best and repeat its structure.",
  "Complete your main focus before low-value messages or feeds.",
  "Write a five-minute fallback routine for difficult days.",
  "Keep the final 30 minutes before bed screen-free.",
  "Replace one feed session with a useful podcast or chapter.",
  "Write down three changes that are now measurable.",
  "Plan a response for your most common trigger.",
  "Recover from one missed action without abandoning the day.",
  "Choose the five habits that deserve a permanent place.",
  "Write your next 30-day commitment in one clear sentence."
];

const reflections = [
  "What made today feel more controlled?",
  "How did the first hour affect the rest of the day?",
  "Which preparation saved effort?",
  "How did movement change your energy?",
  "What happened when the phone was less available?",
  "Which meal or drink choice helped most?",
  "What should stay the same next week?",
  "Where did your attention go today?",
  "Which urge became easier after a pause?",
  "What did finishing create space for?",
  "What helped your body understand that the day was ending?",
  "What was your smallest successful action?",
  "Which visible cue worked?",
  "How quickly did you restart?",
  "What does the data say without criticism?",
  "What did you do with the reclaimed time?",
  "Which trigger can you recognize earlier next time?",
  "Which decision can be removed tomorrow?",
  "What physical action improved your mental state?",
  "Which replacement felt natural?",
  "What pattern from this week is worth repeating?",
  "Did your main focus receive your best attention?",
  "What is your realistic low-energy minimum?",
  "What improved or disrupted sleep preparation?",
  "Which input was worth your attention?",
  "Which result are you most able to prove?",
  "How will you handle the next predictable obstacle?",
  "What helped you return without guilt?",
  "Which parts of this routine fit your real life?",
  "What will you continue tomorrow?"
];

export const buildProgramDay = (day) => {
  const normalizedDay = Math.max(1, Math.min(90, Number(day) || 1));
  const cycleIndex = (normalizedDay - 1) % 30;
  const phase = Math.ceil(normalizedDay / 30);
  const phaseLabel = phase === 1 ? "Reset" : phase === 2 ? "Build" : "Sustain";

  return {
    day: normalizedDay,
    phase,
    phaseLabel,
    focus: focuses[cycleIndex],
    challenge:
      phase === 1 ? challenges[cycleIndex] : `${challenges[cycleIndex]} Keep the version that still works on a busy day.`,
    reflection:
      phase === 3 ? `${reflections[cycleIndex]} What would make this sustainable for another month?` : reflections[cycleIndex]
  };
};

export const getCurrentProgramDay = (user, now = new Date()) => {
  const timeZone = user.preferences?.timeZone || "UTC";
  const startKey = dateKey(user.resetStartedAt || user.createdAt || now, timeZone);
  const todayKey = dateKey(now, timeZone);
  return Math.min(user.resetDuration || 7, daysBetween(startKey, todayKey) + 1);
};

export const buildProgram = (duration) => {
  const allowed = [7, 30, 60, 90];
  const normalized = allowed.includes(Number(duration)) ? Number(duration) : 7;
  return Array.from({ length: normalized }, (_, index) => buildProgramDay(index + 1));
};
