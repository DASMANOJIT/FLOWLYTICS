const activeSessions = new Map();

const makeKey = (role, userId) => `${role}:${userId}`;

const pruneExpiredForKey = (key) => {
  const sessions = activeSessions.get(key);
  if (!sessions) return;
  const now = Date.now();

  for (const [token, expMs] of sessions.entries()) {
    if (!expMs || expMs <= now) {
      sessions.delete(token);
    }
  }

  if (!sessions.size) {
    activeSessions.delete(key);
  }
};

export const getActiveSessionCount = (role, userId) => {
  const key = makeKey(role, userId);
  pruneExpiredForKey(key);
  return activeSessions.get(key)?.size || 0;
};

export const addSession = (role, userId, token, expMs) => {
  const key = makeKey(role, userId);
  pruneExpiredForKey(key);

  if (!activeSessions.has(key)) {
    activeSessions.set(key, new Map());
  }
  activeSessions.get(key).set(token, expMs);
};

export const removeSession = (role, userId, token) => {
  const key = makeKey(role, userId);
  const sessions = activeSessions.get(key);
  if (!sessions) return;

  sessions.delete(token);
  if (!sessions.size) {
    activeSessions.delete(key);
  }
};

export const clearUserSessions = (role, userId) => {
  activeSessions.delete(makeKey(role, userId));
};

export const isSessionActive = (role, userId, token) => {
  const key = makeKey(role, userId);
  pruneExpiredForKey(key);
  const sessions = activeSessions.get(key);
  if (!sessions) return false;
  return sessions.has(token);
};
