import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import {
  authenticateWithJwt,
  authenticateWithUserCredentials,
} from "~/authentication.server";
import { accessTokenCookie, refreshTokenCookie } from "~/cookies.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { accessToken, refreshToken } = await authenticateWithUserCredentials(
    request
  );
  return redirect("/contacts", {
    headers: [
      ["Set-Cookie", await accessTokenCookie.serialize(accessToken)],
      ["Set-Cookie", await refreshTokenCookie.serialize(refreshToken)],
    ],
  });
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    await authenticateWithJwt(request);
  } catch (_) {
    return json({ error: null });
  }
  return redirect("/contacts");
};

export default function Screen() {
  const { error } = useLoaderData<typeof loader>();

  return (
    <div id="index-page">
      <Form method="post">
        {error ? <div>{error}</div> : null}
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            defaultValue="abc@domain.com"
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            defaultValue="abcABC@123"
          />
        </div>

        <button>Log In</button>
      </Form>
    </div>
  );
}
