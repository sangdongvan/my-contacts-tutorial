import { createCookie } from "@remix-run/node";

// Signing already done at backend, just use plain cookie here.
// Access token is intentionally share with front-end so that it can
// back-end API directly with JWT.
export const accessTokenCookie = createCookie("__accessToken", {
  sameSite: "lax", // Resilient to CSRF attack.
  httpOnly: true, // You must not allow JS access this cookie.
  path: "/", // All routes have access to this cookie.
  secure: process.env.NODE_ENV === "production", // Require HTTPS in production.
});

export const refreshTokenCookie = createCookie("__refreshToken", {
  sameSite: "lax",
  httpOnly: true,
  path: "/",
  secure: process.env.NODE_ENV === "production",
});
