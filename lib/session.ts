const TOKEN_KEY = "auth_token";
const TOKEN_EVENT = "auth-token";
const WEEK = 60 * 60 * 24 * 7;

function readCookie() {
  const prefix = `${TOKEN_KEY}=`;
  const part = document.cookie
    .split("; ")
    .find((row) => row.startsWith(prefix));
  if (!part) return null;
  return decodeURIComponent(part.slice(prefix.length));
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return readCookie();
}

export function setToken(token: string) {
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; Path=/; Max-Age=${WEEK}; SameSite=Lax`;
  window.dispatchEvent(new Event(TOKEN_EVENT));
}

export function clearToken() {
  document.cookie = `${TOKEN_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
  window.dispatchEvent(new Event(TOKEN_EVENT));
}

export function subscribeToken(onStoreChange: () => void) {
  window.addEventListener(TOKEN_EVENT, onStoreChange);
  window.addEventListener("focus", onStoreChange);
  return () => {
    window.removeEventListener(TOKEN_EVENT, onStoreChange);
    window.removeEventListener("focus", onStoreChange);
  };
}
