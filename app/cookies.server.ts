import { createCookie } from "@remix-run/node";

// Signing already done at backend, just use plain cookie here.
// Access token is intentionally share with front-end so that it can
// back-end API directly with JWT.
export const accessTokenCookie = createCookie("__accessToken", {
  maxAge: 604_800,
});

export const refreshTokenCookie = createCookie("__refreshToken", {
  maxAge: 604_800,
});
