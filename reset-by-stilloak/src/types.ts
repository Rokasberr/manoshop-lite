export type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  plan: "free" | "lifetime";
  lifetime: { active: boolean; paymentStatus: string; activatedAt?: string | null };
  onboardingComplete: boolean;
  resetDuration: 7 | 30 | 60 | 90;
  resetStartedAt: string;
  preferences: {
    goals: string[];
    wakeTime: string;
    bedtime: string;
    cigarettesPerDay: number;
    cigaretteTarget: number;
    screenTimeMinutes: number;
    screenTargetMinutes: number;
    exerciseFrequency: number;
    readingMinutes: number;
    morningRoutine: string;
    eveningRoutine: string;
    scheduleMode: "exact" | "flexible";
    timeZone: string;
  };
  emailPreferences: {
    morningEnabled: boolean;
    morningTime: string;
    eveningEnabled: boolean;
    eveningTime: string;
    weeklyEnabled: boolean;
  };
  createdAt: string;
};

export type RoutineItem = {
  key: string;
  title: string;
  time: string;
  anchor: string;
  status: "pending" | "done" | "skipped";
  note: string;
  source: "routine" | "habit";
};

export type Habit = {
  _id: string;
  title: string;
  frequency: "daily" | "weekdays" | "custom";
  days: number[];
  scheduleMode: "exact" | "flexible";
  time: string;
  anchor: string;
  stats: { streak: number; completion: number; completed: number };
};

export type TodayData = {
  date: string;
  day: number;
  duration: number;
  program: { focus: string; challenge: string; reflection: string; phaseLabel?: string };
  entry: {
    routine: RoutineItem[];
    cigarettes: number | null;
    cigaretteTarget: number | null;
    screenTimeMinutes: number | null;
    screenTargetMinutes: number | null;
    noScrollCompleted: boolean | null;
    noScrollStart: string;
    noScrollEnd: string;
    mood: number | null;
    workout: boolean | null;
    readingMinutes: number | null;
    wentWell: string;
  };
  completion: number;
  podcast?: Podcast | null;
  smoking: {
    cravingsDelayed: number;
    cigarettesAvoided: number;
    averageIntervalMinutes: number | null;
    lastCigaretteAt: string | null;
  };
};

export type Podcast = {
  _id: string;
  title: string;
  creator: string;
  category: string;
  duration: string;
  spotifyUrl: string;
  embedUrl: string;
  description: string;
  recommendedContext: string;
  active: boolean;
};

export type ProgressData = {
  points: Array<{
    date: string;
    completion: number;
    cigarettes: number | null;
    screenTimeMinutes: number | null;
    mood: number | null;
    workout: number;
    readingMinutes: number | null;
  }>;
  summary: {
    averageCompletion: number | null;
    averageCigarettes: number | null;
    averageScreenTimeMinutes: number | null;
    averageMood: number | null;
    workouts: number;
    readingMinutes: number;
    currentStreak: number;
    trackedDays: number;
    bestDay: { date: string; completion: number } | null;
    cravingsDelayed: number;
    cigarettesAvoided: number;
  };
};
