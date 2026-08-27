import { OAUTH_STATE_COOKIE, encodeOAuthState } from "@shared/const";
import { isSupabaseAuthConfigured } from "@/lib/supabase";

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Start authentication from an event handler. Supabase uses the local auth
// screen; Manus remains available when the independent provider is not selected.
// moment you want to navigate, e.g. `onClick={() => startLogin()}`.
//
// It has SIDE EFFECTS — it mints a one-time nonce, writes the __Host- state
// cookie, and navigates immediately — so the cookie nonce always matches the
// `state` it sends. Do NOT call it during render (no `href={startLogin()}` /
// `loginUrl={...}`): each call overwrites the cookie, so a stray render-phase
// call would desync it from an in-flight login and the callback would reject it
// with "invalid oauth state". It returns void by design, so there is no URL to
// stash across renders.
export const getSafeNextPath = (nextPath?: string) => {
  if (nextPath?.startsWith("/") && !nextPath.startsWith("//") && nextPath !== "/register") {
    return nextPath;
  }
  return "/";
};

export const startLogin = (nextPath?: string) => {
  const safeNextPath = getSafeNextPath(nextPath);
  const registerUrl = `/register?next=${encodeURIComponent(safeNextPath)}`;
  const hasConsent = typeof document !== "undefined" && document.cookie.split("; ").some((cookie) => cookie.trim().startsWith("b2_legal_consent=platform-protection-v1"));
  if (!hasConsent) {
    window.location.href = registerUrl;
    return;
  }

  if (isSupabaseAuthConfigured()) {
    window.location.href = registerUrl;
    return;
  }

  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;

  // Never let a missing or malformed legacy OAuth setting crash the React tree.
  // Supabase is the primary provider; this branch is only a guarded fallback.
  let parsedPortalUrl: URL;
  try {
    parsedPortalUrl = new URL(oauthPortalUrl);
    if (!appId || !["http:", "https:"].includes(parsedPortalUrl.protocol)) {
      window.location.href = registerUrl;
      return;
    }
  } catch {
    window.location.href = registerUrl;
    return;
  }

  const nonce = crypto.randomUUID();
  document.cookie = `${OAUTH_STATE_COOKIE}=${nonce}; Path=/; Max-Age=600; SameSite=None; Secure`;
  const state = encodeOAuthState({ redirectUri, nonce });

  const url = new URL("app-auth", `${parsedPortalUrl.toString().replace(/\/+$/, "")}/`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  window.location.href = url.toString();
};
