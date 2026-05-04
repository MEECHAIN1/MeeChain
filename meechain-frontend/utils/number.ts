export const safeNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
};

export const calcPercent = (used: unknown, limit: unknown): number => {
  const safeUsed = safeNumber(used, 0);
  const safeLimit = safeNumber(limit, 0);

  if (safeLimit <= 0) {
    return 0;
  }

  return (safeUsed / safeLimit) * 100;
};
