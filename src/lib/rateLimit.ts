type RateLimitEntry = {
  tokens: number;
  lastRefill: number;
};

const RATE_LIMIT_STORE = new Map<string, RateLimitEntry>();
const LIMIT = 10;
const REFILL_INTERVAL_MS = 60_000;

export const checkRateLimit = (key: string) => {
  const now = Date.now();
  const entry = RATE_LIMIT_STORE.get(key) ?? {
    tokens: LIMIT,
    lastRefill: now,
  };

  const elapsed = now - entry.lastRefill;
  if (elapsed > REFILL_INTERVAL_MS) {
    entry.tokens = LIMIT;
    entry.lastRefill = now;
  }

  if (entry.tokens <= 0) {
    RATE_LIMIT_STORE.set(key, entry);
    return false;
  }

  entry.tokens -= 1;
  RATE_LIMIT_STORE.set(key, entry);
  return true;
};
