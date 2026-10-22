const goalHabitMap = {
  scroll: { title: "No social media during protected time", anchor: "Evening", time: "22:00" },
  smoking: { title: "Pause before every cigarette", anchor: "Morning", time: "09:00" },
  sleep: { title: "Start the no-screen wind-down", anchor: "Before bed", time: "22:45" },
  exercise: { title: "Move for at least 20 minutes", anchor: "Afternoon", time: "17:00" },
  reading: { title: "Read for 20 minutes", anchor: "Evening", time: "21:00" },
  procrastination: { title: "Complete one focused work block", anchor: "Morning", time: "09:00" },
  routine: { title: "Complete the core daily routine", anchor: "Morning", time: "08:00" },
  meals: { title: "Eat three regular meals", anchor: "Midday", time: "12:30" },
  productivity: { title: "Set and finish one main focus", anchor: "Morning", time: "09:00" }
};

const addMinutes = (time, minutes) => {
  const [hours = 8, mins = 0] = String(time || "08:00").split(":").map(Number);
  const total = (hours * 60 + mins + minutes + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

const routineDefinition = (preferences) => [
  { key: "wake", title: "Wake up", offset: 0, anchor: "Morning" },
  { key: "water", title: "Drink water", offset: 5, anchor: "Morning" },
  { key: "shower", title: "Shower", offset: 10, anchor: "Morning" },
  { key: "teeth-am", title: "Brush teeth", offset: 25, anchor: "Morning" },
  { key: "breakfast", title: "Breakfast", offset: 40, anchor: "Morning" },
  { key: "focus", title: "Main focus block", offset: 60, anchor: "Morning" },
  { key: "lunch", title: "Lunch", time: "12:30", anchor: "Midday" },
  { key: "walk", title: "Walk", time: "13:00", anchor: "Midday" },
  { key: "movement", title: "Workout or hobby", time: "17:00", anchor: "Afternoon" },
  { key: "dinner", title: "Dinner", time: "18:30", anchor: "Evening" },
  { key: "reading", title: `Read for ${preferences.readingMinutes || 20} min`, time: "21:00", anchor: "Evening" },
  { key: "no-social", title: "No social media", time: addMinutes(preferences.bedtime, -90), anchor: "Before bed" },
  { key: "teeth-pm", title: "Evening hygiene", time: addMinutes(preferences.bedtime, -75), anchor: "Before bed" },
  { key: "sleep", title: "Sleep", time: preferences.bedtime || "23:30", anchor: "Before bed" }
];

const isHabitDue = (habit, date = new Date()) => {
  const weekday = date.getUTCDay();
  if (habit.frequency === "weekdays") return weekday >= 1 && weekday <= 5;
  if (habit.frequency === "custom") return habit.days?.includes(weekday);
  return true;
};

export const buildDefaultHabits = (goals, scheduleMode = "flexible") => {
  const selected = goals.map((goal) => goalHabitMap[goal]).filter(Boolean);
  const unique = selected.filter((habit, index) => selected.findIndex((item) => item.title === habit.title) === index);
  const fallback = [
    goalHabitMap.routine,
    goalHabitMap.exercise,
    goalHabitMap.reading,
    goalHabitMap.sleep,
    { title: "Drink water", anchor: "Morning", time: "08:05" }
  ];

  return [...unique, ...fallback]
    .filter((habit, index, all) => all.findIndex((item) => item.title === habit.title) === index)
    .slice(0, 5)
    .map((habit) => ({
      ...habit,
      frequency: "daily",
      scheduleMode,
      isDefault: true
    }));
};

export const buildRoutine = ({ preferences, habits = [], existing = [], date = new Date() }) => {
  const exact = preferences.scheduleMode === "exact";
  const routine = routineDefinition(preferences).map((item) => ({
    key: item.key,
    title: item.title,
    time: exact ? item.time || addMinutes(preferences.wakeTime, item.offset || 0) : "",
    anchor: item.anchor,
    status: "pending",
    note: "",
    source: "routine"
  }));

  const habitItems = habits.filter((habit) => !habit.archived && isHabitDue(habit, date)).map((habit) => ({
    key: `habit:${habit._id}`,
    title: habit.title,
    time: habit.scheduleMode === "exact" ? habit.time : "",
    anchor: habit.anchor,
    status: "pending",
    note: "",
    source: "habit",
    habitId: habit._id
  }));

  const merged = [...routine, ...habitItems].map((item) => {
    const previous = existing.find((entry) => entry.key === item.key);
    return previous
      ? { ...item, status: previous.status, note: previous.note || "" }
      : item;
  });

  const anchorOrder = ["Morning", "Midday", "Afternoon", "Evening", "Before bed"];
  return merged.sort((a, b) => {
    if (exact) return (a.time || "99:99").localeCompare(b.time || "99:99");
    return anchorOrder.indexOf(a.anchor) - anchorOrder.indexOf(b.anchor);
  });
};

export const completionPercent = (routine = []) => {
  const actionable = routine.filter((item) => item.status !== "skipped");
  if (!actionable.length) return 0;
  return Math.round((actionable.filter((item) => item.status === "done").length / actionable.length) * 100);
};

export const boredomSuggestions = {
  5: ["Drink a glass of water", "Stretch your shoulders and hips", "Clear the surface in front of you"],
  15: ["Read ten pages", "Walk without your phone", "Finish one small delayed task"],
  30: ["Complete a short workout", "Take a podcast walk", "Prepare a simple meal"],
  60: ["Work on a personal project", "Go to the gym", "Complete a focused learning session"],
  120: ["Build something for your project", "Watch a film without a second screen", "Take a full gym or learning session"]
};
