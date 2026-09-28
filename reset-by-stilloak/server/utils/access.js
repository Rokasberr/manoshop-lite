export const hasLifetimeAccess = (user) => Boolean(user?.role === "admin" || user?.lifetime?.active);
