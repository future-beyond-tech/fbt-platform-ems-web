const REFRESH_TOKEN_KEY = "ems_refresh_token";
const EXPIRES_AT_KEY = "ems_access_expires_at";
const ROLES_KEY = "ems_roles";

let accessTokenMemory = null;

export function getAccessToken() {
  return accessTokenMemory;
}

export function setAccessToken(token) {
  accessTokenMemory = token || null;
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function setSessionMeta({ expiresAtUtc, roles }) {
  if (typeof window === "undefined") return;

  if (expiresAtUtc) {
    localStorage.setItem(EXPIRES_AT_KEY, expiresAtUtc);
  } else {
    localStorage.removeItem(EXPIRES_AT_KEY);
  }

  if (roles) {
    localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
  } else {
    localStorage.removeItem(ROLES_KEY);
  }
}

export function getSessionMeta() {
  if (typeof window === "undefined") {
    return { expiresAtUtc: null, roles: [] };
  }

  const expiresAtUtc = localStorage.getItem(EXPIRES_AT_KEY);
  const rolesRaw = localStorage.getItem(ROLES_KEY);

  let roles = [];
  try {
    roles = rolesRaw ? JSON.parse(rolesRaw) : [];
  } catch {
    roles = [];
  }

  return { expiresAtUtc, roles };
}

export function hydrateAccessTokenFromStorage() {
  accessTokenMemory = null;
  return accessTokenMemory;
}

export function clearSession() {
  accessTokenMemory = null;
  if (typeof window === "undefined") return;
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
  localStorage.removeItem(ROLES_KEY);
}
