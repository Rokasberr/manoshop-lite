export const dateKey = (date = new Date(), timeZone = "UTC") => {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(date);
    const get = (type) => parts.find((part) => part.type === type)?.value || "";
    return `${get("year")}-${get("month")}-${get("day")}`;
  } catch {
    return dateKey(date, "UTC");
  }
};

export const isDateKey = (date, key, timeZone = "UTC") => {
  const value = date instanceof Date ? date : new Date(date);
  return !Number.isNaN(value.getTime()) && dateKey(value, timeZone) === key;
};

export const localParts = (date = new Date(), timeZone = "UTC") => {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(date);
    const get = (type) => parts.find((part) => part.type === type)?.value || "";
    return { weekday: get("weekday"), hour: Number(get("hour")), minute: Number(get("minute")) };
  } catch {
    return localParts(date, "UTC");
  }
};

export const isTimeInWindow = (configuredTime, parts, windowMinutes = 5) => {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(configuredTime || ""));
  if (!match || !Number.isFinite(parts?.hour) || !Number.isFinite(parts?.minute)) return false;
  const configuredMinutes = Number(match[1]) * 60 + Number(match[2]);
  const currentMinutes = Number(parts.hour) * 60 + Number(parts.minute);
  return currentMinutes >= configuredMinutes && currentMinutes < configuredMinutes + windowMinutes;
};

export const startOfDayUtc = (key) => new Date(`${key}T00:00:00.000Z`);

export const daysBetween = (fromKey, toKey) => {
  const milliseconds = startOfDayUtc(toKey).getTime() - startOfDayUtc(fromKey).getTime();
  return Math.max(0, Math.floor(milliseconds / 86_400_000));
};

export const isValidTimeZone = (value) => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
};
