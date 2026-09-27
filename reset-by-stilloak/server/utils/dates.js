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
