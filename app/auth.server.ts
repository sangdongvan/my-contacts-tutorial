import { createCookieSessionStorage } from "@remix-run/node";
import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { createApiClient } from "./authApi.server";
import invariant from "tiny-invariant";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: ["s3cret"], // This should be an env variable
    secure: process.env.NODE_ENV === "production",
  },
});

type TokenResponse = {
  accessToken: string;
  refreshToken: string;
};

export const auth = new Authenticator<TokenResponse>(sessionStorage);

const authApi = createApiClient("http://localhost:5167");

auth.use(
  new FormStrategy(async ({ form }) => {
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    let res;
    try {
      res = await authApi.post("/Auth/GetUserToken", {
        email: email,
        password: password,
      });
    } catch (_) {
      throw new AuthorizationError("Invalid credentials");
    }

    invariant(
      typeof res.accessToken === "string",
      "accessToken must be string"
    );
    invariant(
      typeof res.refreshToken === "string",
      "refreshToken must be string"
    );

    return {
      accessToken: res.accessToken as string,
      refreshToken: res.refreshToken as string,
    };
  })
);
