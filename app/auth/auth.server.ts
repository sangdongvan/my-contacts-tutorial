import invariant from "tiny-invariant";
import type { JwtHeader, JwtPayload, SigningKeyCallback } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { createApiClient } from "../api/app-api.gen";
import JwksRsa from "jwks-rsa";
import { accessTokenCookie, refreshTokenCookie } from "./cookies.server";
import { redirect } from "@remix-run/node";

const authApi = createApiClient("http://localhost:5167");

const jwksClient = JwksRsa({
  jwksUri: "http://localhost:5167/.well-known/jwks",
  requestHeaders: {}, // Optional
  timeout: 30000, // Defaults to 30s
});

type TokenResponse = {
  accessToken: string;
  refreshToken: string;
};

export async function authenticateWithUserCredentials(
  request: Request
): Promise<{ accessToken: string; refreshToken: string }> {
  const form = await request.formData();
  const email = String(form.get("email"));
  const password = String(form.get("password"));

  let res;
  try {
    res = await authApi.post("/Auth/GetUserToken", {
      email: email,
      password: password,
    });
  } catch (_) {
    throw new Error("Invalid credentials");
  }

  invariant(typeof res.accessToken === "string", "accessToken must be string");
  invariant(
    typeof res.refreshToken === "string",
    "refreshToken must be string"
  );

  return {
    accessToken: res.accessToken as string,
    refreshToken: res.refreshToken as string,
  };
}

export async function authenticateOrGoLogin(
  request: Request
): Promise<TokenResponse> {
  try {
    return await authenticateWithJwt(request);
  } catch (_) {
    throw redirect("/login");
  }
}
export async function authenticateOrError(
  request: Request
): Promise<TokenResponse & { error?: string }> {
  try {
    return await authenticateWithJwt(request);
  } catch (_) {
    return {
      accessToken: "",
      refreshToken: "",
      error: "TODO",
    };
  }
}

export async function authenticateWithJwt(
  request: Request
): Promise<TokenResponse> {
  const unauthorized = (code: number) => {
    throw new Error("Unauthorized. Error code: " + code);
  };

  const cookieHeader = request.headers.get("Cookie");
  const token = await accessTokenCookie.parse(cookieHeader);

  if (token === undefined) {
    unauthorized(1);
  }

  const unverifiedPayload = jwt.decode(token);
  if (typeof unverifiedPayload === "string" || unverifiedPayload === null) {
    unauthorized(2);
  }

  const unverifiedJwtPayload = unverifiedPayload as JwtPayload;

  // TODO verify exp, aud, etc.
  if (unverifiedJwtPayload.aud) {
    unauthorized(3);
  }

  const verifying = new Promise((resolve, reject) => {
    jwt.verify(
      token,
      async (header: JwtHeader, callback: SigningKeyCallback) => {
        const key = await jwksClient.getSigningKey(header.kid);
        callback(null, key.getPublicKey());
      },
      (err, payload) => {
        if (err !== null || payload === undefined) {
          reject("Malformed cookie");
        } else {
          resolve({});
        }
      }
    );
  });

  try {
    await verifying;
  } catch (exception: any) {
    unauthorized(4);
  }

  // TODO renew the expired token if refresh token is available.
  if (
    unverifiedJwtPayload.exp == null ||
    unverifiedJwtPayload.exp < Date.now() / 1000
  ) {
    unauthorized(3);
  }

  return {
    accessToken: token,
    refreshToken: await refreshTokenCookie.parse(cookieHeader),
  };
}
