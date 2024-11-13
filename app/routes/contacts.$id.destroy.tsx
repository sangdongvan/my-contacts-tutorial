import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import { deleteContact } from "../api/contact-api";
import { authenticateOrGoLogin } from "~/auth/auth.server";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  invariant(params.id, "Missing id param");
  const { accessToken } = await authenticateOrGoLogin(request);
  await deleteContact(params.id, accessToken);
  return redirect("/contacts");
};
